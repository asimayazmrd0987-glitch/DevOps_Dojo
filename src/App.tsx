import React, { useState, useEffect, useRef } from "react";
import {
  Terminal as TerminalIcon,
  BookOpen,
  HelpCircle,
  Play,
  RotateCcw,
  CheckCircle2,
  Lock,
  Compass,
  Trophy,
  Flame,
  User,
  Users,
  Shield,
  Cpu,
  RefreshCw,
  FolderOpen,
  FileCode,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Send,
  MessageSquare,
  Volume2,
  Layers,
  Heart,
  ExternalLink,
  Laptop
} from "lucide-react";
import { LABS } from "./data/labs";
import { Lab, LabStep, FileNode, FileSystemState, TerminalLine, UserStats } from "./types";
import { getNodeByPath, setNodeByPath, deleteNodeByPath, resolvePath, getFlatFileList } from "./utils/fsHelper";

export default function App() {
  // Current active Lab or sandbox exploration mode
  const [activeLab, setActiveLab] = useState<Lab>(LABS[0]);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  
  // Virtual Filesystem State - initialized with lab's defaults
  const [vfs, setVfs] = useState<FileSystemState>(JSON.parse(JSON.stringify(LABS[0].startingFiles)));
  const [currentPath, setCurrentPath] = useState<string>(""); // empty string represents root '/'
  
  // Terminal execution history and command lines
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    {
      id: "welcome-info",
      type: "system",
      text: "========================================================\nDEVOPS DOJO EPHEMERAL SANDBOX ENGINE v1.2.4 (LIVE)\n========================================================\n* Session limits: 3.0 Hours allocated (Free Tier)\n* Seccomp Drop-policy: ACTIVE (Container escape disabled)\n* Heartbeat: MONITORING (Automatic kill on tab close)\nType 'help' to see available sandbox controls.\n",
    },
    {
      id: "lab-start",
      type: "system",
      text: `Starting Lab: "${LABS[0].title}". Follow the tutorial on the left!`,
    }
  ]);
  const [commandInput, setCommandInput] = useState<string>("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyPointer, setHistoryPointer] = useState<number>(-1);
  
  // UI Tabs / state controls
  const [sidebarTab, setSidebarTab] = useState<"instructions" | "explorer" | "coach">("instructions");
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>({
    type: "info",
    text: "Welcome to DevOps Dojo! Start with Step 1 instructions on the left or type terminal commands on the right.",
  });
  
  // User profile metrics
  const [userStats, setUserStats] = useState<UserStats>({
    xp: 250,
    level: 2,
    labsCompleted: [],
    currentStreak: 3,
  });

  // DevOps Coach Chat State (Gemini-powered Mentor)
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    {
      role: "assistant",
      content: "Hello! I am DevOpsSensei, your personal DevOps coach. Stuck on any commands or docker configurations? Ask me anything and I'll guide you to mastery! 🛠️",
    }
  ]);
  const [chatInput, setChatInput] = useState<string>("");
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  // File explorer selection
  const [selectedFile, setSelectedFile] = useState<{ name: string; path: string; content: string } | null>(null);

  // Simulation values for active docker containers and k8s pods
  const [dockerContainers, setDockerContainers] = useState<{ id: string; name: string; image: string; ports: string; status: string }[]>([]);
  const [k8sPods, setK8sPods] = useState<{ name: string; status: string; ready: string; age: string }[]>([]);
  const [gitState, setGitState] = useState<{ initialized: boolean; commits: string[]; filesAdded: string[] }>({
    initialized: false,
    commits: [],
    filesAdded: [],
  });

  // Ephemeral heartbeat simulation timer (counts down 3 hours)
  const [timeLeft, setTimeLeft] = useState<number>(3 * 3600); // 3 hours in seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) return 3 * 3600; // Reset
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Auto scroll terminal and chat
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollTerminal = () => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollChat = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollTerminal();
  }, [terminalLines]);

  useEffect(() => {
    scrollChat();
  }, [chatMessages, isChatLoading]);

  // Load selected lab
  const loadLab = (lab: Lab) => {
    setActiveLab(lab);
    setActiveStepIndex(0);
    setVfs(JSON.parse(JSON.stringify(lab.startingFiles)));
    setCurrentPath("");
    setDockerContainers([]);
    setK8sPods([]);
    setGitState({ initialized: false, commits: [], filesAdded: [] });
    setSelectedFile(null);
    setTerminalLines([
      {
        id: `start-lab-${Date.now()}`,
        type: "system",
        text: `========================================================\nSPAWNED ISOLATED WORKSPACE FOR LAB: ${lab.title.toUpperCase()}\n========================================================\n* Starting files generated. Sandbox is fully isolated.\nType 'help' to review guidelines. Let's solve DevOps.`,
      }
    ]);
    setFeedbackMessage({
      type: "info",
      text: `Loaded Lab: "${lab.title}". Complete the steps on the left, clicking "Verify Sandbox Status" to pass validation.`,
    });
  };

  // Basic Sound FX simulation via synthesized browser Audio API (beautiful and lightweight!)
  const playBeep = (freq: number, type: OscillatorType, duration: number) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = type;
      oscillator.frequency.value = freq;
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio context might be blocked or unsupported; ignore silently
    }
  };

  const triggerStepSuccess = () => {
    playBeep(523.25, "sine", 0.15); // C5 snippet
    setTimeout(() => playBeep(659.25, "sine", 0.2), 150); // E5 snippet
  };

  const triggerErrorBeep = () => {
    playBeep(180, "sawtooth", 0.25);
  };

  // Lab Validation logic
  const verifyCurrentStep = () => {
    const step = activeLab.steps[activeStepIndex];
    const flatFiles = getFlatFileList(vfs);
    
    let isPassed = false;
    let detailMsg = "";

    switch (step.id) {
      // LINUX LAB
      case "linux-1": {
        // User must execute command 'ls' or 'cat README.md' - recorded in terminal history
        const hasLs = commandHistory.some(cmd => cmd.trim() === "ls" || cmd.trim() === "ls -la" || cmd.trim() === "ls -a");
        const hasCat = commandHistory.some(cmd => cmd.trim().includes("cat README.md") || cmd.trim() === "cat README.md");
        if (hasLs || hasCat) {
          isPassed = true;
        } else {
          detailMsg = "You need to type and execute 'ls' or 'cat README.md' in the terminal terminal on the right.";
        }
        break;
      }
      case "linux-2": {
        // Must contain express-app directory
        const hasDir = flatFiles.some(f => f.path === "express-app" && f.isDir);
        if (hasDir) {
          isPassed = true;
        } else {
          detailMsg = "Please run 'mkdir express-app' to create the express application project folder.";
        }
        break;
      }
      case "linux-3": {
        // Must contain config.env inside express-app or main root with PORT=3000
        const envFile = flatFiles.find(f => (f.path === "express-app/config.env" || f.path === "config.env") && !f.isDir);
        if (envFile && envFile.content?.includes("PORT=3000")) {
          isPassed = true;
        } else {
          detailMsg = "Make sure to write 'PORT=3000' inside configured config.env. Hint: use redirectional echo: echo \"PORT=3000\" > express-app/config.env";
        }
        break;
      }

      // DOCKER LAB
      case "docker-1": {
        // Must contain Dockerfile containing node:18-alpine or server.js CMD
        const dockerfile = flatFiles.find(f => f.path.toLowerCase() === "dockerfile" && !f.isDir);
        if (dockerfile && dockerfile.content && dockerfile.content.includes("node:18-alpine")) {
          isPassed = true;
        } else {
          detailMsg = "A Dockerfile containing 'FROM node:18-alpine' is required in the root directory.";
        }
        break;
      }
      case "docker-2": {
        // Image must be built
        const hasBuiltCommand = commandHistory.some(cmd => cmd.includes("docker build -t node-service:v1.0"));
        if (hasBuiltCommand) {
          isPassed = true;
        } else {
          detailMsg = "Run the image build command in your terminal: docker build -t node-service:v1.0 .";
        }
        break;
      }
      case "docker-3": {
        // App container must be running on host 8080 mapping to 3000 as webapp
        const hasWebapp = dockerContainers.some(c => c.name === "webapp" && c.ports.includes("8080"));
        if (hasWebapp) {
          isPassed = true;
        } else {
          detailMsg = "Verify container launch: type 'docker run -d -p 8080:3000 --name webapp node-service:v1.0'";
        }
        break;
      }

      // KUBERNETES LAB
      case "k8s-1": {
        // Read file nginx-pod.yaml and check parameters
        const yamlFile = flatFiles.find(f => f.path === "nginx-pod.yaml" && !f.isDir);
        if (yamlFile && yamlFile.content && yamlFile.content.includes("kind: Pod") && yamlFile.content.includes("nginx:alpine")) {
          isPassed = true;
        } else {
          detailMsg = "Create positive nginx-pod.yaml containing kind: Pod, name: web-server container and nginx:alpine image specifications.";
        }
        break;
      }
      case "k8s-2": {
        // kubectl apply of web-server pods
        const appState = k8sPods.some(p => p.name === "web-server");
        if (appState) {
          isPassed = true;
        } else {
          detailMsg = "Deploy pod spec configurations to target kubernetes resources using: kubectl apply -f nginx-pod.yaml";
        }
        break;
      }
      case "k8s-3": {
        // kubectl get pods must have been run
        const trackedGet = commandHistory.some(cmd => cmd.trim() === "kubectl get pods");
        if (trackedGet) {
          isPassed = true;
        } else {
          detailMsg = "Execute 'kubectl get pods' in your terminal console to see cluster resource status.";
        }
        break;
      }

      // CI/CD pipelines
      case "cicd-1": {
        // Create workflows directory
        const workflowsExist = flatFiles.some(f => f.path.includes(".github/workflows") && f.isDir);
        if (workflowsExist) {
          isPassed = true;
        } else {
          detailMsg = "Structure layout required: create the pipeline folders '.github/workflows' using mkdir command.";
        }
        break;
      }
      case "cicd-2": {
        // deploy.yml file with DevOps CI
        const deployYml = flatFiles.find(f => f.path.includes(".github/workflows/deploy.yml") && !f.isDir);
        if (deployYml && deployYml.content && (deployYml.content.includes("runs-on") || deployYml.content.includes("DevOps CI"))) {
          isPassed = true;
        } else {
          detailMsg = "Create positive workflow file .github/workflows/deploy.yml describing DevOps CI actions.";
        }
        break;
      }
      case "cicd-3": {
        // simulates git push triggered trigger pipeline run
        const isCommitted = commandHistory.some(cmd => cmd.includes("git push"));
        if (isCommitted) {
          isPassed = true;
        } else {
          detailMsg = "Simulate code release to triggers workflows: add, commit, and enter command: git push origin main";
        }
        break;
      }

      default:
        isPassed = true;
    }

    if (isPassed) {
      triggerStepSuccess();
      
      const newXp = userStats.xp + activeLab.points / activeLab.steps.length;
      const leveledUp = Math.floor(newXp / 500) > Math.floor(userStats.xp / 500);
      const newLevel = leveledUp ? userStats.level + 1 : userStats.level;
      
      setUserStats(prev => ({
        ...prev,
        xp: Math.round(newXp),
        level: newLevel,
      }));

      // Go to next step or complete Lab
      if (activeStepIndex < activeLab.steps.length - 1) {
        setTerminalLines(prev => [
          ...prev,
          {
            id: `success-${Date.now()}`,
            type: "success",
            text: `[SYSTEM OK] STEP ${activeStepIndex + 1} VERIFIED! XP Awarded. Navigating to Step ${activeStepIndex + 2}...`
          }
        ]);
        setActiveStepIndex(prev => prev + 1);
        setFeedbackMessage({
          type: "success",
          text: `Awesome job! Step ${activeStepIndex + 1} completed. Proceeding to Step ${activeStepIndex + 2}: "${activeLab.steps[activeStepIndex + 1].title}"`,
        });
      } else {
        // Completed lab fully!
        const labsCompletedList = userStats.labsCompleted.includes(activeLab.id) 
          ? userStats.labsCompleted 
          : [...userStats.labsCompleted, activeLab.id];
        
        setUserStats(prev => ({
          ...prev,
          labsCompleted: labsCompletedList,
          currentStreak: prev.currentStreak + 1
        }));

        setTerminalLines(prev => [
          ...prev,
          {
            id: `success-${Date.now()}`,
            type: "success",
            text: `\n🏆 CONGRATULATIONS! LAB "${activeLab.title.toUpperCase()}" COMPLETED!\nPoints awarded: +${activeLab.points} XP.\nDaily Practice Streak: ${userStats.currentStreak + 1} DAYS. Keep coding DevOps!\n`
          }
        ]);
        setFeedbackMessage({
          type: "success",
          text: `🎉 Beautifully done! You've mastered: "${activeLab.title}". Browse the card catalog below to starting a different lab.`,
        });
      }
    } else {
      triggerErrorBeep();
      setTerminalLines(prev => [
        ...prev,
        {
          id: `step-fail-${Date.now()}`,
          type: "error",
          text: `[VALIDATION FAILED] Could not verify step parameters. Verify files and commands run. Try typing 'status' to review instructions.`
        }
      ]);
      setFeedbackMessage({
        type: "error",
        text: `Validation Failed: ${detailMsg || "Requirements for this step were not met. Check hints or talk to the Sensei."}`,
      });
    }
  };

  // State-driven Interactive Terminal Command Shell execution
  const executeTerminalCommand = (line: string) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    setCommandHistory(prev => [...prev, trimmed]);
    setHistoryPointer(-1);

    const parts = trimmed.split(" ");
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    let outputText = "";
    let isError = false;

    // Standard echo formatting helpers
    const formatFileSystemListing = (dirContent: { [key: string]: FileNode }) => {
      const keys = Object.keys(dirContent);
      if (keys.length === 0) return "(directory is empty)";
      return keys.map(key => {
        const item = dirContent[key];
        if (item.isDir) {
          return `\x1b[34m${key}/\x1b[0m`; // Colorized representation
        }
        return key;
      }).join("    ");
    };

    const currentPathParts = currentPath.split("/").filter(Boolean);

    switch (command) {
      case "help":
        outputText = `DevOps Sandbox Terminal Engine v1.2
Core Shell Commands:
  help              Display this guide
  clear             Clear screen logs
  pwd               Print working folder directory path
  ls [-la]          List workspace directory contents
  cd <dir>          Change directory (supports '..' and '/')
  mkdir <dir>       Create a layout directory
  touch <file>      Create an empty source file
  cat <file>        Print custom files context to display
  echo "X" > file    Write data streams to a target file
  rm <file_path>    Delete isolated elements, files or dirs
  status            Read custom docker, k8s, levels, platform configurations

Simulated DevOps Executables:
  docker build -t <tag> .             Compile container imagery
  docker run -d -p <ports> <img-tag> Launch detached containers
  docker ps                           List active containers
  kubectl apply -f <yaml-file>        Inject deployment pods state
  kubectl get pods                    Verify target orchestration list
  git init | add . | commit | push     Trigger CI/CD orchestration release

Shortcut: Type 'verify' to trigger automatic validation checks.`;
        break;

      case "clear":
        setTerminalLines([]);
        setCommandInput("");
        return;

      case "verify":
        setTerminalLines(prev => [
          ...prev,
          { id: `term-${Date.now()}`, type: "input", text: `${currentPath || "/"} $ ${trimmed}` },
        ]);
        verifyCurrentStep();
        setCommandInput("");
        return;

      case "pwd":
        outputText = `/${currentPathParts.join("/")}`;
        break;

      case "ls": {
        const isLongAll = args.includes("-la") || args.includes("-a") || args.includes("-l");
        const node = getNodeByPath(vfs, currentPathParts);
        if (node && node.isDir && node.children) {
          if (isLongAll) {
            // Show all including custom hidden logs
            const rows = [];
            rows.push("drwxr-xr-x  2 root  root  4096 Jun 22 00:38 .");
            rows.push("drwxr-xr-x  4 root  root  4096 Jun 22 00:38 ..");
            for (const key of Object.keys(node.children)) {
              const child = node.children[key];
              const size = child.isDir ? "4096" : (child.content?.length || 0).toString();
              const typeChar = child.isDir ? "d" : "-";
              rows.push(`${typeChar}rwxr-xr-x  1 root  root  ${size.padStart(4, " ")} Jun 22 00:38 ${key}${child.isDir ? "/" : ""}`);
            }
            outputText = rows.join("\n");
          } else {
            // Filter non-hidden files
            const visibleKeys = Object.keys(node.children).filter(k => !k.startsWith("."));
            const visibleSub: { [key: string]: FileNode } = {};
            visibleKeys.forEach(k => {
              if (node.children) visibleSub[k] = node.children[k];
            });
            outputText = formatFileSystemListing(visibleSub);
          }
        } else {
          outputText = "ls: cannot access directory: No such file or directory";
          isError = true;
        }
        break;
      }

      case "cd": {
        if (args.length === 0 || args[0] === "~" || args[0] === "/") {
          setCurrentPath("");
          outputText = "";
        } else {
          const resolvedParts = resolvePath(currentPath, args[0]);
          const targetNode = getNodeByPath(vfs, resolvedParts);
          
          if (targetNode && targetNode.isDir) {
            setCurrentPath(resolvedParts.join("/"));
            outputText = "";
          } else {
            outputText = `cd: can't cd to ${args[0]}: Not a directory or path does not exist`;
            isError = true;
          }
        }
        break;
      }

      case "mkdir": {
        if (args.length === 0) {
          outputText = "mkdir: missing operand";
          isError = true;
        } else {
          const folderName = args[0];
          const targetPathParts = resolvePath(currentPath, folderName);
          const parentParts = targetPathParts.slice(0, -1);
          const parentNode = getNodeByPath(vfs, parentParts);

          if (parentNode && parentNode.isDir) {
            const leafName = targetPathParts[targetPathParts.length - 1];
            const updatedVfs = setNodeByPath(vfs, targetPathParts, {
              name: leafName,
              isDir: true,
              children: {}
            });
            setVfs(updatedVfs);
            outputText = "";
          } else {
            outputText = "mkdir: complete path cannot be resolved";
            isError = true;
          }
        }
        break;
      }

      case "touch": {
        if (args.length === 0) {
          outputText = "touch: missing file operand";
          isError = true;
        } else {
          const fileName = args[0];
          const filePathParts = resolvePath(currentPath, fileName);
          const leafName = filePathParts[filePathParts.length - 1];
          const hasDir = getNodeByPath(vfs, filePathParts.slice(0, -1));

          if (hasDir && hasDir.isDir) {
            const updatedVfs = setNodeByPath(vfs, filePathParts, {
              name: leafName,
              isDir: false,
              content: ""
            });
            setVfs(updatedVfs);
          } else {
            outputText = "touch: directory location does not exist";
            isError = true;
          }
        }
        break;
      }

      case "cat": {
        if (args.length === 0) {
          outputText = "cat: missing file operand";
          isError = true;
        } else {
          const fileName = args[0];
          const filePathParts = resolvePath(currentPath, fileName);
          const fileNode = getNodeByPath(vfs, filePathParts);

          if (fileNode && !fileNode.isDir) {
            outputText = fileNode.content || "(file is empty)";
          } else if (fileNode && fileNode.isDir) {
            outputText = `cat: ${fileName}: Is a directory`;
            isError = true;
          } else {
            outputText = `cat: ${fileName}: No such file or directory`;
            isError = true;
          }
        }
        break;
      }

      case "echo": {
        // Simple redirectional parser echo "text" > file
        const fullArgStr = args.join(" ");
        const redirectIndex = fullArgStr.indexOf(">");
        const appendIndex = fullArgStr.indexOf(">>");

        if (redirectIndex === -1 && appendIndex === -1) {
          // Just print text to screen
          outputText = fullArgStr.replace(/['"]/g, "");
        } else {
          const isAppend = appendIndex !== -1;
          const splitChar = isAppend ? ">>" : ">";
          const segments = fullArgStr.split(splitChar);
          
          let content = segments[0].trim();
          // strip outer surrounding quotes
          if (content.startsWith('"') && content.endsWith('"')) {
            content = content.slice(1, -1);
          } else if (content.startsWith("'") && content.endsWith("'")) {
            content = content.slice(1, -1);
          }
          // replace escaped newlines
          content = content.replace(/\\n/g, "\n");

          const fileName = segments[1].trim();
          if (!fileName) {
            outputText = "echo: redirection syntax error";
            isError = true;
          } else {
            const filePathParts = resolvePath(currentPath, fileName);
            const parentParts = filePathParts.slice(0, -1);
            const leafName = filePathParts[filePathParts.length - 1];

            const parentNode = getNodeByPath(vfs, parentParts);
            if (parentNode && parentNode.isDir) {
              const existingFile = getNodeByPath(vfs, filePathParts);
              let newContent = content;

              if (isAppend && existingFile && !existingFile.isDir) {
                newContent = (existingFile.content || "") + "\n" + content;
              }

              const updatedVfs = setNodeByPath(vfs, filePathParts, {
                name: leafName,
                isDir: false,
                content: newContent
              });
              setVfs(updatedVfs);
              outputText = "";
            } else {
              outputText = `echo: folder destination directory does not exist for: ${fileName}`;
              isError = true;
            }
          }
        }
        break;
      }

      case "rm": {
        const isRecurse = args.includes("-rf") || args.includes("-r");
        const targets = args.filter(a => !a.startsWith("-"));
        
        if (targets.length === 0) {
          outputText = "rm: missing operand";
          isError = true;
        } else {
          const targetPathParts = resolvePath(currentPath, targets[0]);
          const targetNode = getNodeByPath(vfs, targetPathParts);

          if (!targetNode) {
            outputText = `rm: cannot remove '${targets[0]}': No such file or directory`;
            isError = true;
          } else if (targetNode.isDir && !isRecurse) {
            outputText = `rm: cannot remove '${targets[0]}': Is a directory. Use -rf`;
            isError = true;
          } else {
            const updatedVfs = deleteNodeByPath(vfs, targetPathParts);
            setVfs(updatedVfs);
            outputText = "";
          }
        }
        break;
      }

      case "docker": {
        const subSub = args[0]?.toLowerCase();
        if (subSub === "build") {
          // Check if custom Dockerfile exists
          const flat = getFlatFileList(vfs);
          const dockerFile = flat.find(f => f.path.toLowerCase() === "dockerfile" && !f.isDir);
          
          if (!dockerFile) {
            outputText = "Error: Dockerfile not found in active directory root space.";
            isError = true;
          } else {
            const tagIndex = args.indexOf("-t");
            const imageTag = tagIndex !== -1 && args[tagIndex + 1] ? args[tagIndex + 1] : "latest-build";
            outputText = `Sending build context to Docker daemon  42.5kB
Step 1/4 : FROM node:18-alpine
 ---> f128148b832b
Step 2/4 : WORKDIR /app
 ---> Running in f025a75cf94d
 ---> 56839be49c32
Step 3/4 : COPY . .
 ---> cb0451a2d5ff
Step 4/4 : CMD ["node", "server.js"]
 ---> Running in 728bdae9c1f2
 ---> Successfully built 20c8f5d0de1d
 ---> Successfully tagged ${imageTag}`;
          }
        } else if (subSub === "run") {
          // docker run -d -p 8080:3000 --name webapp node-service:v1.0
          const detached = args.includes("-d") || args.includes("-dp");
          const portIndex = args.indexOf("-p");
          const portMap = portIndex !== -1 && args[portIndex + 1] ? args[portIndex + 1] : "8080:3000";
          const nameIndex = args.indexOf("--name");
          const nameVal = nameIndex !== -1 && args[nameIndex + 1] ? args[nameIndex + 1] : `container-${Date.now().toString().slice(-4)}`;
          const imageName = args[args.length - 1];

          if (!imageName || imageName === "run") {
            outputText = "docker: run requires at least an image name. Run docker help.";
            isError = true;
          } else {
            // Register container
            const containerId = Math.random().toString(36).substring(2, 14);
            const newCont = {
              id: containerId,
              name: nameVal,
              image: imageName,
              ports: portMap,
              status: "Up 38 seconds"
            };
            setDockerContainers(prev => [...prev, newCont]);
            outputText = containerId;
          }
        } else if (subSub === "ps") {
          if (dockerContainers.length === 0) {
            outputText = "CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES";
          } else {
            const rows = ["CONTAINER ID   IMAGE     COMMAND                  CREATED         STATUS          PORTS                    NAMES"];
            dockerContainers.forEach(c => {
              rows.push(`${c.id.substring(0, 12).padEnd(14, " ")}${c.image.padEnd(10, " ")}"node server.js"          2 mins ago      ${c.status.padEnd(16, " ")}0.0.0.0:${c.ports}->3000/tcp   ${c.name}`);
            });
            outputText = rows.join("\n");
          }
        } else {
          outputText = `Docker daemon Simulator API
Usage: 
  docker build -t <tag-name> .        Build container image
  docker run -d -p <host:cont> <tag>  Run virtual detached container
  docker ps                           List containers state`;
        }
        break;
      }

      case "kubectl": {
        const subSub = args[0]?.toLowerCase();
        if (subSub === "apply") {
          const fIndex = args.indexOf("-f");
          const fileTarget = fIndex !== -1 && args[fIndex + 1] ? args[fIndex + 1] : "";
          const yamlNode = getFlatFileList(vfs).find(f => f.path === fileTarget && !f.isDir);

          if (!fileTarget) {
            outputText = "error: must specify one of -f parameters";
            isError = true;
          } else if (!yamlNode) {
            outputText = `error: the path "${fileTarget}" does not exist in local configuration files`;
            isError = true;
          } else {
            // Apply YAML
            const content = yamlNode.content || "";
            let name = "web-server";
            if (content.includes("name:")) {
              const matches = content.match(/name:\s*([^\s]+)/);
              if (matches && matches[1]) name = matches[1];
            }
            // Register pod
            const exist = k8sPods.some(p => p.name === name);
            if (!exist) {
              setK8sPods(prev => [...prev, { name, status: "Running", ready: "1/1", age: "5s" }]);
            }
            outputText = `pod/${name} created successfully. k8s cluster sync OK.`;
          }
        } else if (subSub === "get") {
          const resource = args[1]?.toLowerCase();
          if (resource === "pods" || resource === "pod") {
            if (k8sPods.length === 0) {
              outputText = "No resources found in default namespace.";
            } else {
              const rows = ["NAME         READY   STATUS    RESTARTS   AGE"];
              k8sPods.forEach(p => {
                rows.push(`${p.name.padEnd(13, " ")}${p.ready.padEnd(8, " ")}${p.status.padEnd(10, " ")}0          ${p.age}`);
              });
              outputText = rows.join("\n");
            }
          } else {
            outputText = "error: resource type not specified. Use 'kubectl get pods'";
            isError = true;
          }
        } else {
          outputText = `Kubectl Orchestration CLI Simulator
Usage: 
  kubectl apply -f <path-to-yaml>        Apply manifests to control plane
  kubectl get pods                       Print active pod workloads`;
        }
        break;
      }

      case "git": {
        const action = args[0]?.toLowerCase();
        if (action === "init") {
          setGitState(prev => ({ ...prev, initialized: true }));
          outputText = "Initialized empty Git repository in /workspace/.git/";
        } else if (action === "add") {
          setGitState(prev => ({ ...prev, filesAdded: ["all"] }));
          outputText = "warning: LF will be replaced by CRLF in Workspace files. Added changes to index stages.";
        } else if (action === "commit") {
          const msgIndex = args.indexOf("-m");
          const msg = msgIndex !== -1 && args[msgIndex + 1] ? args[msgIndex + 1] : "Update deployment configurations";
          setGitState(prev => ({ ...prev, commits: [...prev.commits, msg] }));
          outputText = `[main bd1a8f9] ${msg}\n 3 files changed, 24 insertions(+)\n create mode 100644 .github/workflows/deploy.yml`;
        } else if (action === "push") {
          if (gitState.commits.length === 0) {
            outputText = "Everything up-to-date";
          } else {
            outputText = `Enumerating objects: 7, done.
Counting objects: 100% (7/7), done.
Delta compression using up to 8 threads
Compressing objects: 100% (4/4), done.
Writing objects: 100% (4/4), 382 bytes | 382.00 KiB/s, done.
To github.com:devops-dojo/sandbox-pipelines.git
   f39a1fe..bd1a8f9  main -> main
* Pipeline Trigger registered. CI check workflow in progress...`;
          }
        } else {
          outputText = "Git simulated CLI parameters. Supports: git init, git add, git commit -m 'msg', git push";
        }
        break;
      }

      case "status":
        outputText = `*** DEVOPS DOJO STATUS AND ENVIRONMENT DIAGNOSTICS ***
User Stats:
  - Account Tier : Generous FREE Core Tier (3 hrs daily lab duration)
  - XP Points    : ${userStats.xp} XP total
  - Skill Level  : Level ${userStats.level} DevOps Practitioner
  - Daily Streak : ${userStats.currentStreak} Days continuous streak!
  - Labs Done    : ${userStats.labsCompleted.length} Completed (${userStats.labsCompleted.join(", ") || "None"})

Host Sandbox Telemetry:
  - Sandbox OS   : Isolated Minimal Ubuntu x86_64 Core Wrapper
  - CPU Shares   : Standard cgroup throttled (cfs_quota: 50%)
  - Memory Max   : 256 MB RAM ceiling hard limit
  - Seccomp Mode : Active seccomp profile Dropping privileges (NO root escape possible!)
  - Heartbeat T. : ${formatTime(timeLeft)} until auto-eviction daemon cleans resources.`;
        break;

      default:
        outputText = `bash: ${command}: command not found. Need hints? Type 'help' to review allowed instructions or invoke 'verify' to inspect lab goals.`;
        isError = true;
        break;
    }

    setTerminalLines(prev => [
      ...prev,
      { id: `input-${Date.now()}`, type: "input", text: `${currentPath || "/"} $ ${trimmed}`, dir: currentPath },
      { id: `output-${Date.now()}`, type: isError ? "error" : "output", text: outputText }
    ]);
    setCommandInput("");
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;
    executeTerminalCommand(commandInput);
  };

  // Chat request forwarding to Server proxy - talks directly with the Gemini mentor
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsChatLoading(true);

    try {
      const response = await fetch("/api/gemini/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, { role: "user", content: userMsg }],
          currentLab: activeLab,
          activeStepIndex,
          terminalHistory: commandHistory,
          virtualFilesystem: getFlatFileList(vfs),
          currentPath: currentPath || "/"
        })
      });

      if (!response.ok) {
        throw new Error("Failed to contact mentor API agent");
      }

      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }

      setChatMessages(prev => [...prev, { role: "assistant", content: result.text }]);
    } catch (err: any) {
      console.error(err);
      setChatMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ Oops! I had trouble connecting to my Gemini brain nodes. Details: ${err.message || "Endpoint error"}. Make sure your GEMINI_API_KEY is configured in the AI Studio platform panel!`
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0d1117] text-[#c9d1d9] font-sans antialiased overflow-hidden">
      {/* Dynamic Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-[#30363d] bg-[#161b22] relative z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-[#238636] p-1.5 rounded-lg text-white shadow-md shadow-[#238636]/10 animate-pulse">
            <TerminalIcon size={20} />
          </div>
          <div>
            <h1 className="text-md font-extrabold tracking-tight text-white flex items-center gap-1.5 leading-none">
              DevOps Dojo <span className="text-[10px] bg-[#1f6feb]/20 text-[#58a6ff] border border-[#1f6feb]/30 px-1.5 py-0.5 rounded-full font-sans uppercase">Sandbox Platform</span>
            </h1>
            <p className="text-[11px] text-[#8b949e]">Ephemeral Zero-Install Learning Infrastructure</p>
          </div>
        </div>

        {/* User Stats, Heartbeat, and Quick Actions */}
        <div className="flex items-center gap-4">
          {/* Quick Stats Grid */}
          <div className="hidden md:flex items-center gap-3 bg-[#0d1117]/80 px-3 py-1.5 rounded-lg border border-[#30363d] text-xs">
            <div className="flex items-center gap-1 text-[#f0883e]">
              <Trophy size={14} />
              <span className="font-semibold text-white">Lvl {userStats.level}</span>
            </div>
            
            <div className="w-px h-3 bg-[#30363d]"></div>

            <div className="flex items-center gap-1">
              <span className="text-[#8b949e]">XP:</span>
              <span className="font-mono text-white font-semibold">{userStats.xp}</span>
            </div>

            <div className="w-px h-3 bg-[#30363d]"></div>

            <div className="flex items-center gap-1 text-[#da3633]">
              <Flame size={14} className="fill-[#da3633]/20" />
              <span className="font-semibold text-white">{userStats.currentStreak}d Streak</span>
            </div>
          </div>

          {/* Sandbox Status Badge */}
          <div className="flex items-center gap-2 bg-[#238636]/10 border border-[#238636]/30 px-3 py-1.5 rounded-lg text-xs">
            <div className="w-2 h-2 rounded-full bg-[#238636] animate-ping"></div>
            <span className="text-[#56d364] font-medium hidden sm:inline">Active VM</span>
            <span className="text-[#8b949e] font-mono text-[11px] border-l border-[#30363d] pl-2">{formatTime(timeLeft)}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                // Quick reset active files to default starting files
                setVfs(JSON.parse(JSON.stringify(activeLab.startingFiles)));
                setCurrentPath("");
                setTerminalLines(prev => [
                  ...prev,
                  {
                    id: `reset-${Date.now()}`,
                    type: "system",
                    text: `[SYSTEM ALERT] Virtual filesystem reverted back to default initial configuration state for Lab: ${activeLab.title}`,
                  }
                ]);
                setFeedbackMessage({ type: "info", text: "Sandbox files successfully reset to standard lab initialization defaults. Start coding!" });
                playBeep(220, "triangle", 0.3);
              }}
              title="Reset Virtual Filesystem"
              className="p-1.5 hover:bg-[#21262d] rounded-md text-[#8b949e] hover:text-[#58a6ff] transition-all"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex flex-1 overflow-hidden relative">
        {/* Left Interactive Content Area (40% width) */}
        <section className="w-[40%] border-r border-[#30363d] bg-[#161b22] flex flex-col overflow-hidden">
          {/* Tabs header */}
          <div className="flex border-b border-[#30363d] bg-[#0d1117] px-2 pt-2 gap-1">
            <button
              onClick={() => setSidebarTab("instructions")}
              className={`px-4 py-2 text-xs font-semibold rounded-t-lg border-t border-x transition-all flex items-center gap-1.5 ${
                sidebarTab === "instructions"
                  ? "bg-[#161b22] border-[#30363d] text-white"
                  : "border-transparent text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#161b22]/30"
              }`}
            >
              <BookOpen size={13} />
              Lab Instructions
            </button>
            <button
              onClick={() => setSidebarTab("explorer")}
              className={`px-4 py-2 text-xs font-semibold rounded-t-lg border-t border-x transition-all flex items-center gap-1.5 ${
                sidebarTab === "explorer"
                  ? "bg-[#161b22] border-[#30363d] text-white"
                  : "border-transparent text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#161b22]/30"
              }`}
            >
              <FolderOpen size={13} />
              Filesystem Explorer
            </button>
            <button
              onClick={() => setSidebarTab("coach")}
              className={`px-4 py-2 text-xs font-semibold rounded-t-lg border-t border-x transition-all flex items-center gap-1.5 text-left relative ${
                sidebarTab === "coach"
                  ? "bg-[#161b22] border-[#30363d] text-[#58a6ff]"
                  : "border-transparent text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#161b22]/30"
              }`}
            >
              <Sparkles size={13} className="text-[#a371f7]" />
              AI Sensei
              <span className="absolute top-1.5 right-1 w-1.5 h-1.5 bg-[#a371f7] rounded-full"></span>
            </button>
          </div>

          {/* Sidebar Tab Content container */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            
            {/* INSTRUCTIONS TAB */}
            {sidebarTab === "instructions" && (
              <div className="space-y-4 animate-fadeIn">
                {/* Lab Overview Card */}
                <div className="bg-[#0d1117]/80 rounded-xl p-4 border border-[#30363d] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#58a6ff] bg-[#1f6feb]/20 border border-[#1f6feb]/30 px-2 py-0.5 rounded-full font-mono uppercase font-semibold">
                      {activeLab.category} Lab
                    </span>
                    <span className="text-xs text-[#8b949e] flex items-center gap-1">
                      Difficulty: 
                      <span className={`font-semibold ${
                        activeLab.difficulty === "Beginner" 
                          ? "text-[#56d364]" 
                          : activeLab.difficulty === "Intermediate" 
                          ? "text-[#e3b341]" 
                          : "text-[#f85149]"
                      }`}>
                        {activeLab.difficulty}
                      </span>
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-white leading-tight">{activeLab.title}</h2>
                  <p className="text-xs text-[#8b949e] leading-relaxed">{activeLab.description}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-[#30363d] text-xs text-[#8b949e]">
                    <span className="flex items-center gap-1">
                      Time Alloc: <strong>{activeLab.timeMinutes} mins</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      Award: <strong>+{activeLab.points} XP</strong>
                    </span>
                  </div>
                </div>

                {/* Steps Horizontal Navigation or Indicator progress */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">Step Progress Checkpoints</h3>
                  <div className="grid grid-cols-3 gap-1">
                    {activeLab.steps.map((s, idx) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setActiveStepIndex(idx);
                          setFeedbackMessage({
                            type: "info",
                            text: `Switched steps to Step ${idx + 1}: "${s.title}"`
                          });
                        }}
                        className={`py-2 rounded text-center text-xs font-bold border transition-all ${
                          idx === activeStepIndex
                            ? "bg-[#1f6feb]/20 border-[#1f6feb] text-white"
                            : idx < activeStepIndex
                            ? "bg-[#238636]/10 border-[#238636]/45 text-[#56d364]"
                            : "bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:border-[#8b949e]/30"
                        }`}
                      >
                        Step {s.number}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Current Steps Active Area */}
                {activeLab.steps[activeStepIndex] && (
                  <div className="bg-[#1f6feb]/5 rounded-xl border border-[#30363d] p-5 space-y-4 relative">
                    <div className="absolute top-4 right-4 bg-[#1f6feb]/15 text-[#58a6ff] text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded border border-[#1f6feb]/30">
                      Step {activeStepIndex + 1} of {activeLab.steps.length}
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xs text-[#8b949e] font-semibold uppercase tracking-wider">Active Task:</h4>
                      <h3 className="text-md font-bold text-white">{activeLab.steps[activeStepIndex].title}</h3>
                    </div>

                    {/* Step Guidelines instructions render */}
                    <div className="text-xs text-[#c9d1d9] space-y-2 leading-relaxed bg-[#0d1117] p-3 rounded-lg border border-[#30363d]/60">
                      {activeLab.steps[activeStepIndex].instructions.split("\n\n").map((para, pIdx) => (
                        <p key={pIdx}>
                          {para.split("`").map((part, partIdx) => {
                            if (partIdx % 2 === 1) {
                              return (
                                <code key={partIdx} className="bg-[#21262d] text-[#ff7b72] px-1.5 py-0.5 rounded font-mono text-[11px] border border-[#30363d]">
                                  {part}
                                </code>
                              );
                            }
                            return part;
                          })}
                        </p>
                      ))}
                    </div>

                    {/* Objective definition checks item */}
                    <div className="space-y-1.5 bg-[#161b22] px-3.5 py-3 rounded-lg border-l-4 border-[#238636] text-xs">
                      <span className="font-semibold text-white uppercase text-[10px] tracking-wide block">Validation Parameter:</span>
                      <p className="text-[#8b949e] italic">"{activeLab.steps[activeStepIndex].objective}"</p>
                    </div>

                    {/* Hints button accordion dropdown */}
                    <details className="group border border-[#30363d] rounded-lg bg-[#0d1117]/50">
                      <summary className="list-none flex items-center justify-between p-3 cursor-pointer text-xs font-semibold text-[#8b949e] select-none hover:text-white transition-all">
                        <span className="flex items-center gap-1">
                          <HelpCircle size={14} className="text-[#e3b341]" />
                          Need a Command hint?
                        </span>
                        <ChevronDown size={14} className="transition-transform group-open:rotate-180" />
                      </summary>
                      <div className="p-3 border-t border-[#30363d] text-xs text-[#8b949e] leading-relaxed font-mono bg-[#0d1117]">
                        {activeLab.steps[activeStepIndex].hint}
                      </div>
                    </details>

                    {/* Action Execution Button Bar */}
                    <div className="pt-2 flex gap-2">
                      <button
                        onClick={verifyCurrentStep}
                        className="flex-1 bg-[#238636] hover:bg-[#2eaa40] text-xs font-bold text-white py-3 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.01] active:scale-[0.99] border border-[#23c345]"
                      >
                        <CheckCircle2 size={15} />
                        Verify Sandbox Status
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Heartbeat Guard Policy disclaimer */}
                <div className="rounded-lg border border-[#30363d] bg-[#161b22] p-4 text-[11px] text-[#8b949e] flex items-start gap-2.5">
                  <Shield className="text-[#a371f7] shrink-0 mt-0.5" size={14} />
                  <div>
                    <span className="font-semibold text-white block mb-0.5">Automated Eviction Policies</span>
                    Running user terminal commands is restricted by hard resource cgroups. Containers sleep on websocket disconnect and delete themselves after 5 minutes of inactivity for cloud cost protection.
                  </div>
                </div>
              </div>
            )}

            {/* FILESYSTEM EXPLORER TAB */}
            {sidebarTab === "explorer" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-[#30363d] pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8b949e] flex items-center gap-1">
                    <FolderOpen size={13} className="text-[#58a6ff]" />
                    Container Virtual Files
                  </span>
                  <button 
                    onClick={() => {
                      setSelectedFile(null);
                      setFeedbackMessage({ type: "info", text: "Refreshed filesystem lists." });
                    }}
                    className="p-1 hover:bg-[#21262d] rounded text-xs text-[#8b949e]"
                    title="Refresh folder structural tree"
                  >
                    <RefreshCw size={12} />
                  </button>
                </div>

                <p className="text-[11px] text-[#8b949e] leading-relaxed">
                  Below is the live virtual file map inside terminal sandbox directory. Select files to preview state attributes.
                </p>

                {/* Simulated file-tree explorer */}
                <div className="bg-[#0d1117] rounded-lg border border-[#30363d] p-3 text-xs overflow-x-auto min-h-[220px]">
                  {/* Root folder listings */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-white py-1">
                      <FolderOpen size={14} className="text-[#58a6ff]" />
                      <span className="font-mono font-bold font-semibold">/ (root)</span>
                    </div>

                    <div className="pl-4 space-y-1.5">
                      {Object.keys(vfs).length === 0 ? (
                        <span className="text-[#8b949e] italic pl-2 block">No files created yet.</span>
                      ) : (
                        Object.keys(vfs).map(key => {
                          const node = vfs[key];
                          if (node.isDir) {
                            return (
                              <div key={key} className="space-y-1.5">
                                <div className="flex items-center gap-1 text-[#58a6ff] font-mono hover:bg-[#21262d] p-1 rounded cursor-pointer">
                                  <FolderOpen size={13} />
                                  <span>{key}/</span>
                                </div>
                                {/* Subdir Children */}
                                <div className="pl-4 border-l border-[#30363d] space-y-1">
                                  {node.children && Object.keys(node.children).map(childKey => {
                                    const childNode = node.children![childKey];
                                    return (
                                      <div
                                        key={childKey}
                                        onClick={() => {
                                          if (!childNode.isDir) {
                                            setSelectedFile({
                                              name: childKey,
                                              path: `${key}/${childKey}`,
                                              content: childNode.content || ""
                                            });
                                          }
                                        }}
                                        className="flex items-center gap-1.5 text-[#c9d1d9] font-mono py-1 px-1.5 rounded hover:bg-[#21262d] cursor-pointer"
                                      >
                                        <FileCode size={12} className="text-[#8b949e]" />
                                        <span className="text-white hover:text-[#58a6ff] transition-all">{childKey}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          } else {
                            return (
                              <div
                                key={key}
                                onClick={() => {
                                  setSelectedFile({
                                    name: key,
                                    path: key,
                                    content: node.content || ""
                                  });
                                }}
                                className="flex items-center gap-1.5 text-[#c9d1d9] font-mono py-1 px-1.5 rounded hover:bg-[#21262d] cursor-pointer"
                              >
                                <FileCode size={13} className="text-[#8b949e]" />
                                <span className="text-white hover:text-[#58a6ff] transition-all">{key}</span>
                              </div>
                            );
                          }
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* File Contents Reader Preview Card */}
                {selectedFile ? (
                  <div className="bg-[#161b22] rounded-lg border border-[#30363d] p-4 text-xs space-y-2.5 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-[#30363d] pb-2">
                      <span className="text-white font-mono flex items-center gap-1 font-semibold">
                        <FileCode size={13} className="text-[#8b949e]" />
                        {selectedFile.path}
                      </span>
                      <button 
                        onClick={() => setSelectedFile(null)}
                        className="text-xs text-[#8b949e] hover:text-white"
                      >
                        Close Preview
                      </button>
                    </div>
                    <pre className="p-3 bg-[#0d1117] rounded border border-[#30363d] text-[11px] font-mono overflow-auto max-h-[160px] whitespace-pre-wrap text-[#c9d1d9]">
                      {selectedFile.content || "(empty file)"}
                    </pre>
                  </div>
                ) : (
                  <div className="rounded-lg border border-[#30363d] bg-[#0d1117]/30 p-4 text-center text-xs text-[#8b949e]">
                    Select any virtual code/yaml file from the list above to preview content state in this layout.
                  </div>
                )}
              </div>
            )}

            {/* AI COACH DISCUSSION TAB */}
            {sidebarTab === "coach" && (
              <div className="flex flex-col h-[480px] animate-fadeIn">
                {/* Coach Intro */}
                <div className="flex items-center gap-2 border-b border-[#30363d] pb-3 shrink-0">
                  <div className="w-8 h-8 rounded-full bg-[#a371f7]/10 border border-[#a371f7]/30 flex items-center justify-center text-[#a371f7]">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">DevOps Coach: Sensei</h3>
                    <p className="text-[10px] text-[#8b949e]">Real-time interactive diagnostics & coding tutor</p>
                  </div>
                </div>

                {/* Messages Scroller */}
                <div className="flex-1 overflow-y-auto space-y-3.5 py-4 px-1 min-h-[220px]">
                  {chatMessages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-2.5 text-xs ${
                        m.role === "user" ? "flex-reverse justify-end" : "justify-start"
                      }`}
                    >
                      {m.role === "assistant" && (
                        <div className="w-6 h-6 rounded-full bg-[#1f6feb]/15 border border-[#1f6feb]/30 text-white flex items-center justify-center text-[10px] shrink-0 font-bold font-sans">
                          S
                        </div>
                      )}
                      
                      <div
                        className={`rounded-xl p-3 max-w-[85%] leading-relaxed ${
                          m.role === "user"
                            ? "bg-[#1f6feb] text-white border border-[#388bfd]"
                            : "bg-[#0d1117] text-[#c9d1d9] border border-[#30363d]"
                        }`}
                      >
                        {m.content.split("\n").map((line, lIdx) => {
                          // basic highlight of bash commands
                          if (line.startsWith("```") || line.endsWith("```")) {
                            return null;
                          }
                          return (
                            <p className="mb-1 last:mb-0" key={lIdx}>
                              {line.split("`").map((part, partIdx) => {
                                if (partIdx % 2 === 1) {
                                  return (
                                    <code key={partIdx} className="bg-[#21262d] text-[#ff7b72] px-1 py-0.5 rounded font-mono text-[10px]">
                                      {part}
                                    </code>
                                  );
                                }
                                return part;
                              })}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {isChatLoading && (
                    <div className="flex gap-2.5 text-xs justify-start items-center">
                      <div className="w-6 h-6 rounded-full bg-[#1f6feb]/15 border border-[#1f6feb]/30 text-white flex items-center justify-center text-[10px] shrink-0 font-bold animate-spin">
                        ⌛
                      </div>
                      <span className="text-[#8b949e] italic font-mono">Sensei is reviewing workspace...</span>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat input form container */}
                <form onSubmit={handleChatSubmit} className="mt-auto border-t border-[#30363d] pt-3 shrink-0">
                  <div className="relative">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask Sensei helper: 'Why does my build fail?'"
                      className="w-full text-xs text-[#c9d1d9] placeholder-[#8b949e] border border-[#30363d] rounded-lg leading-6 px-3.5 py-2.5 bg-[#0d1117] focus:outline-none focus:border-[#58a6ff] pr-10"
                    />
                    <button
                      type="submit"
                      disabled={isChatLoading || !chatInput.trim()}
                      className="absolute right-2.5 top-2.5 p-1 text-[#8b949e] hover:text-[#58a6ff] disabled:opacity-20 transition-all rounded"
                    >
                      <Send size={15} />
                    </button>
                  </div>
                  <span className="text-[10px] text-[#8b949e] text-center block pt-2 italic">
                    Backed by <strong className="text-[#58a6ff]">models/gemini-3.5-flash</strong>
                  </span>
                </form>
              </div>
            )}
          </div>
        </section>

        {/* Right Active Terminal & Feedback (60% width) */}
        <section className="flex-1 bg-[#0d1117] flex flex-col overflow-hidden">
          {/* Output feedback toast indicator */}
          {feedbackMessage && (
            <div className={`p-3 relative z-10 shrink-0 text-xs font-semibold flex items-center justify-between border-b transition-all ${
              feedbackMessage.type === "success"
                ? "bg-[#238636]/10 border-[#238636]/30 text-[#56d364]"
                : feedbackMessage.type === "error"
                ? "bg-[#da3633]/10 border-[#da3633]/30 text-[#f85149]"
                : "bg-[#1f6feb]/10 border-[#1f6feb]/30 text-[#58a6ff]"
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {feedbackMessage.type === "success" ? "✅" : feedbackMessage.type === "error" ? "❌" : "ℹ️"}
                </span>
                <span>{feedbackMessage.text}</span>
              </div>
              <button 
                onClick={() => setFeedbackMessage(null)}
                className="text-xs text-[#8b949e] hover:text-white px-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* Interactive Shell Screen Panel */}
          <div className="flex-1 p-4 overflow-y-auto font-mono text-xs leading-relaxed space-y-2 selection:bg-[#58a6ff]/30 selection:text-white select-text">
            {terminalLines.map((line) => {
              if (line.type === "input") {
                return (
                  <div key={line.id} className="flex items-center text-[#ff7b72] font-semibold">
                    <span className="text-[#8b949e] mr-1.5">[{line.dir || "/"}]</span>
                    <span className="text-[#56d364] mr-2">$</span>
                    <span className="text-[#c9d1d9]">{line.text.slice(line.text.indexOf("$") + 1).trim()}</span>
                  </div>
                );
              } else if (line.type === "error") {
                return (
                  <pre key={line.id} className="text-[#f85149] whitespace-pre-wrap pl-3 border-l border-[#f85149]/40 bg-[#da3633]/5 p-2 rounded">
                    {line.text}
                  </pre>
                );
              } else if (line.type === "success") {
                return (
                  <pre key={line.id} className="text-[#56d364] whitespace-pre-wrap pl-3 border-l border-[#56d364]/40 bg-[#238636]/5 p-2 rounded">
                    {line.text}
                  </pre>
                );
              } else if (line.type === "system") {
                return (
                  <pre key={line.id} className="text-[#8b949e] whitespace-pre-wrap bg-[#161b22]/50 p-2.5 rounded border border-[#30363d]/40">
                    {line.text}
                  </pre>
                );
              } else {
                return (
                  <pre key={line.id} className="text-[#c9d1d9] whitespace-pre-wrap pl-1">
                    {line.text}
                  </pre>
                );
              }
            })}
            <div ref={terminalEndRef} />
          </div>

          {/* Shell Input Form Area */}
          <form
            onSubmit={handleCommandSubmit}
            className="border-t border-[#30363d] bg-[#161b22] px-4 py-3 flex items-center gap-2 relative z-10 shrink-0"
          >
            <div className="flex items-center text-[11px] text-[#8b949e] font-mono shrink-0 select-none bg-[#0d1117] px-2.5 py-1 rounded border border-[#30363d]">
              <span className="text-[#58a6ff]">/{currentPath}</span>
              <span className="text-[#56d364] ml-1.5 font-bold">$</span>
            </div>
            
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              onKeyDown={(e) => {
                // simple custom terminal history lookups
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  if (commandHistory.length > 0) {
                    const nextPt = historyPointer === -1 ? commandHistory.length - 1 : Math.max(0, historyPointer - 1);
                    setHistoryPointer(nextPt);
                    setCommandInput(commandHistory[nextPt]);
                  }
                } else if (e.key === "ArrowDown") {
                  e.preventDefault();
                  if (historyPointer !== -1) {
                    const nextPt = historyPointer + 1;
                    if (nextPt >= commandHistory.length) {
                      setHistoryPointer(-1);
                      setCommandInput("");
                    } else {
                      setHistoryPointer(nextPt);
                      setCommandInput(commandHistory[nextPt]);
                    }
                  }
                }
              }}
              placeholder="Enter container command here... (try: ls, mkdir, help, verify)"
              className="flex-grow bg-transparent text-xs text-[#c9d1d9] focus:outline-none placeholder-[#8b949e] font-mono leading-relaxed"
              autoFocus
            />

            <button
              type="submit"
              className="bg-[#21262d] hover:bg-[#30363d] px-3 py-1.5 rounded text-xs font-semibold text-[#c9d1d9] border border-[#30363d]"
            >
              Run
            </button>
          </form>
        </section>
      </main>

      {/* Footer / Lab Select Catalog Grid */}
      <footer className="border-t border-[#30363d] bg-[#0d1117] p-5 shrink-0">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8b949e] flex items-center gap-1.5">
              <Compass size={14} className="text-[#f0883e]" />
              Select Available Lab Coursework Modules
            </h3>
            
            <div className="flex gap-2 text-[11px] text-[#8b949e]">
              <span className="flex items-center gap-1">
                Completed: <strong>{userStats.labsCompleted.length} / {LABS.length} Labs</strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {LABS.map((lab) => {
              const isCompleted = userStats.labsCompleted.includes(lab.id);
              const isActive = activeLab.id === lab.id;

              return (
                <div
                  key={lab.id}
                  onClick={() => loadLab(lab)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer select-none relative flex flex-col justify-between ${
                    isActive
                      ? "bg-[#1f6feb]/10 border-[#1f6feb] shadow-lg shadow-[#1f6feb]/5"
                      : isCompleted
                      ? "bg-[#238636]/5 border-[#238636]/40 hover:border-[#238636]/60 text-[#8b949e]"
                      : "bg-[#161b22] border-[#30363d] hover:border-[#8b949e]/30 hover:bg-[#21262d]/50"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase tracking-wider text-[#58a6ff] bg-[#1f6feb]/15 px-2 py-0.5 rounded border border-[#1f6feb]/25">
                        {lab.category}
                      </span>

                      {isCompleted && (
                        <span className="text-[10px] text-[#56d364] flex items-center gap-0.5 font-bold">
                          ✓ Finished
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-white line-clamp-1">{lab.title}</h4>
                    <p className="text-[11px] text-[#8b949e] line-clamp-2 leading-relaxed">{lab.description}</p>
                  </div>

                  <div className="mt-3.5 pt-2 border-t border-[#30363d]/60 flex items-center justify-between text-[10px] text-[#8b949e]">
                    <span>{lab.difficulty}</span>
                    <strong className="text-white">+{lab.points} XP</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </footer>
    </div>
  );
}
