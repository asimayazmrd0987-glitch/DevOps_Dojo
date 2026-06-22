# DevOps Dojo 🥋

> An interactive, browser-based DevOps learning sandbox with hands-on Linux, Docker, and Kubernetes labs — powered by an AI mentor.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)

---

## ✨ What Is DevOps Dojo?

**DevOps Dojo** is a browser-based learning platform where developers practice real DevOps skills in a safe, interactive environment. Instead of reading docs, you:

- 🖥️ **Run Linux commands** in a simulated terminal
- 🐳 **Build Docker containers** step-by-step
- ☸️ **Deploy to Kubernetes** with guided labs
- 🤖 **Get AI mentorship** when stuck — hints, not answers
- 🏆 **Track progress** through structured challenges

---

## 🚀 Live Demo

> Coming soon — deploy to Vercel/Render and share the link.

---

## 📸 Preview

```
┌─────────────────────────────────────────────────────────────┐
│  DevOps Dojo                                    [Terminal]  │
│                                                             │
│  🥋 Welcome to Linux Basics                               │
│                                                             │
│  Step 3/8: Create a directory and navigate into it          │
│                                                             │
│  $ mkdir my-project                                         │
│  $ cd my-project                                            │
│  $ ls                                                       │
│                                                             │
│  [✓] Correct! Next step →                                   │
│                                                             │
│  🤖 AI Mentor: Nice work! Now try creating a file...        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript |
| Styling | Tailwind CSS 4 |
| Backend | Express.js + Node.js |
| AI Mentor | Google Gemini API |
| Icons | Lucide React |
| Build Tool | Vite |

---

## 🏗️ Project Structure

```
DevOps_Dojo/
├── src/                    # React frontend source
│   ├── components/         # UI components
│   ├── labs/               # Lab definitions (Linux, Docker, K8s)
│   ├── terminal/           # Terminal emulator logic
│   └── App.tsx             # Root component
├── server.ts               # Express backend + Gemini API proxy
├── index.html              # Entry HTML
├── package.json            # Dependencies & scripts
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript config
└── README.md               # This file
```

---

## 🏃 Run Locally

### Prerequisites
- Node.js 20+
- Gemini API key (for AI mentor features)

### Setup

```bash
# Clone the repo
git clone https://github.com/asimayazmrd0987-glitch/DevOps_Dojo.git
cd DevOps_Dojo

# Install dependencies
npm install

# Create environment file
echo "GEMINI_API_KEY=your_api_key_here" > .env.local

# Start development server
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Vite + Express) |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run clean` | Remove build artifacts |
| `npm run lint` | Type-check with TypeScript |

---

## 🎯 Learning Paths

### Linux Basics
- File system navigation (`cd`, `ls`, `pwd`)
- File operations (`touch`, `mkdir`, `rm`, `cp`, `mv`)
- Permissions (`chmod`, `chown`)
- Process management (`ps`, `top`, `kill`)
- Shell scripting fundamentals

### Docker Fundamentals
- Container lifecycle (`run`, `stop`, `rm`)
- Image management (`build`, `pull`, `push`)
- Dockerfile syntax
- Volume mounting
- Docker Compose basics

### Kubernetes Essentials
- Pod creation and management
- Deployments and Services
- ConfigMaps and Secrets
- Scaling and rolling updates

---

## 🤖 AI Mentor

The built-in AI mentor (powered by Gemini) provides:

- **Contextual hints** based on your current lab and step
- **Terminal history analysis** — it sees what you tried
- **Socratic guidance** — nudges you toward the answer without giving it away
- **DevOps best practices** — explains *why* something works, not just *how*

---

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes (for AI features) | Google Gemini API key |
| `NODE_ENV` | No | `development` or `production` |
| `PORT` | No | Server port (default: 3000) |

---

## 🚀 Deployment

### Vercel (Frontend + Serverless)
```bash
npm run build
vercel --prod
```

### Render/Railway (Full Node.js)
```bash
# Connect GitHub repo
# Set GEMINI_API_KEY in environment variables
# Deploy
```

### Self-Hosted
```bash
npm run build
npm start
```

---

## 📝 Roadmap

- [ ] Add 10+ Linux challenge labs
- [ ] Docker sandbox with real container execution
- [ ] Kubernetes lab with minikube integration
- [ ] User progress tracking & achievements
- [ ] Multiplayer team challenges
- [ ] CI/CD pipeline simulator
- [ ] Dark/light theme toggle

---

## 🤝 Contributing

Contributions welcome! Areas to help:

- New lab scenarios
- Bug fixes
- UI/UX improvements
- Documentation

---

## 📄 License

MIT — built for the DevOps community.

---

<p align="center">
  Built with 🥋 by <a href="https://github.com/asimayazmrd0987-glitch">asimayazmrd0987-glitch</a>
</p>
