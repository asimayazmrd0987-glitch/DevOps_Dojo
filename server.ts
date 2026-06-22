import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy initialize Gemini clients to prevent early crash if key is loaded slowly
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn(
        "GEMINI_API_KEY is missing. AI help features will be unavailable.",
      );
    }
    aiClient = new GoogleGenAI({
      apiKey: key || "MOCK_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// REST API for DevOps Coach
app.post(
  "/api/gemini/mentor",
  async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const {
        messages,
        currentLab,
        activeStepIndex,
        terminalHistory,
        virtualFilesystem,
        currentPath,
      } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(500).json({
          error:
            "GEMINI_API_KEY is not configured. Please add it to your secrets or environment configuration.",
        });
        return;
      }

      const ai = getAiClient();

      // Prepare the layout description
      const systemInstruction = `You are DevOpsSensei, a supportive, highly experienced, and playful DevOps tutor helping the student learn technologies like Linux command lines, Docker containers, Kubernetes, and CI/CD.
Your student is currently using "DevOps Dojo", a browser-based interactive learning terminal.
Current context of student workspace:
- Active Lab: ${currentLab ? `${currentLab.title} (Difficulty: ${currentLab.difficulty})` : "Exploring Sandbox"}
- Active Step Number: ${currentLab && activeStepIndex !== undefined ? activeStepIndex + 1 : "N/A"}
- Active Step Goal: ${currentLab && activeStepIndex !== undefined ? currentLab.steps[activeStepIndex]?.objective : "N/A"}
- Current Working Directory: ${currentPath || "/"}
- Virtual Directory Files: ${JSON.stringify(virtualFilesystem || {}, null, 2)}
- Last 8 entered terminal commands: ${JSON.stringify(terminalHistory ? terminalHistory.slice(-8) : [])}

Guidelines for responding:
1. Speak as DevOpsSensei—dynamic, warm, using clear emojis occasionally (🛠️, 🐳, ☸️, 🚀, 💻).
2. Avoid giving away the exact solution immediately. Instead, nudge the user or explain the underlying technology.
3. Be clean, concise, and highly professional. Avoid long blocks of text. Use code blocks for terminal commands or yaml specs.
4. If they ask about unrelated stuff, politely redirect them back to gaining top DevOps masteries.`;

      const chatContent = messages.map((m: any) => ({
        role: m.role === "assistant" ? ("model" as const) : ("user" as const),
        parts: [{ text: m.content }],
      }));

      // Trigger gemini-3.5-flash for general chat tasks
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: chatContent,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini coach error:", error);
      res
        .status(500)
        .json({
          error:
            error.message || "An error occurred with the AI Mentor connection.",
        });
    }
  },
);

// Port ping or simulation checks
app.get("/api/health", (req, res) => {
  res.json({
    status: "ready",
    platform: "DevOps Dojo Sandbox Server",
    time: new Date(),
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Configuring Vite middleware in Development mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving production bundle from dist...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Development server running on http://127.0.0.1:${PORT}`);
  });
}

startServer();
