# 🖥️ ANTEC Terminal Portfolio

```
 █████╗ ███╗   ██╗████████╗███████╗ ██████╗
██╔══██╗████╗  ██║╚══██╔══╝██╔════╝██╔════╝
███████║██╔██╗ ██║   ██║   █████╗  ██║     
██╔══██║██║╚██╗██║   ██║   ██╔══╝  ██║     
██║  ██║██║ ╚████║   ██║   ███████╗╚██████╗
╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝ ╚═════╝
```

A **Linux-inspired terminal portfolio** built as a full-stack web application. Type commands, explore projects, and authenticate — all from a retro terminal interface.

> Built with an engineering-first mindset: clean architecture, security best practices, and production-ready infrastructure — while learning DevOps step by step.

---

## 🎯 Motivation & Learning Goals

This project isn't just a portfolio — it's a **learning laboratory** for real-world software engineering:

- **Full-stack development**: React frontend + Express.js backend + MongoDB
- **Security-first mindset**: JWT authentication, bcrypt hashing, helmet headers, rate limiting
- **Monorepo architecture**: Turborepo with shared packages
- **DevOps fundamentals**: Docker containerization, environment management, deployment pipelines
- **Production deployment**: Vercel (frontend) + Render (backend) + MongoDB Atlas

The goal is to understand how **professional applications are built, deployed, and maintained** — not just make things work.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERNET                                │
└─────────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    VERCEL       │  │    RENDER       │  │  MONGODB ATLAS  │
│   (Frontend)    │  │   (Backend)     │  │   (Database)    │
│                 │  │                 │  │                 │
│  React + Vite   │──│  Express.js     │──│  User Data      │
│  xterm.js       │  │  REST API       │  │  Sessions       │
│                 │  │  JWT Auth       │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
     Port 443            Port 443            Port 27017
      HTTPS               HTTPS              TLS/SSL
```

**Data Flow:**
1. User types command in terminal UI (React + xterm.js)
2. Auth commands trigger API calls via `@antec/api-client`
3. Backend validates, processes, and responds (Express.js)
4. User data persisted in MongoDB Atlas
5. JWT tokens stored client-side for session persistence

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 19, Vite 7, xterm.js | Terminal UI, SPA |
| **Backend** | Express.js, Node.js 20 | REST API, Auth |
| **Database** | MongoDB, Mongoose | User storage |
| **Auth** | JWT, bcrypt | Secure authentication |
| **Security** | Helmet, express-rate-limit | Headers, DDoS protection |
| **Monorepo** | Turborepo, npm workspaces | Build orchestration |
| **DevOps** | Docker, docker-compose | Containerization (learning) |
| **Deployment** | Vercel, Render | Production hosting |

---

## 📁 Repository Structure

```
terminal-portfolio-antec/
├── apps/
│   ├── web/                    # Frontend (React + Vite)
│   │   ├── src/
│   │   │   ├── components/     # Terminal UI, Boot sequence
│   │   │   ├── contexts/       # Auth context (React)
│   │   │   └── utils/          # Command handlers
│   │   └── package.json
│   │
│   └── backend/                # Backend (Express.js)
│       ├── src/
│       │   ├── config/         # Database connection
│       │   ├── controllers/    # Auth logic
│       │   ├── middleware/     # Auth, error handling
│       │   ├── models/         # Mongoose schemas
│       │   ├── routes/         # API routes
│       │   └── utils/          # JWT, validation
│       ├── docker/             # Docker configs (for learning)
│       ├── Dockerfile          # Production container
│       └── package.json
│
├── packages/
│   ├── api-client/             # HTTP client for API calls
│   └── shared/                 # Constants, types, validation
│
├── package.json                # Root workspace config
└── turbo.json                  # Turborepo config
```

---

## 🚀 Deployment Status

| Service | Platform | Status | URL |
|---------|----------|--------|-----|
| Frontend | Vercel | ✅ Live | *your-domain.vercel.app* |
| Backend | Render (Node) | ✅ Live | *your-api.onrender.com* |
| Database | MongoDB Atlas | ✅ Live | Managed cloud |

### Current Deployment Strategy

- **Frontend**: Vercel auto-deploys from `main` branch
- **Backend**: Render uses **Node.js runtime** (not Docker — yet)
- **Database**: MongoDB Atlas free tier (M0)

---

## 🐳 Docker & DevOps Note

> **Docker is implemented but NOT used in production — this is intentional.**

This project includes a complete Docker setup as part of learning DevOps:

```
apps/backend/
├── Dockerfile           # Production-ready, multi-stage build
├── .dockerignore        # Optimized build context
└── docker/
    ├── Dockerfile.dev       # Development with hot-reload
    ├── docker-compose.yml   # Production stack
    └── docker-compose.dev.yml  # Dev stack + Mongo Express
```

**Why not deploy with Docker yet?**
- Learning step-by-step: master platform-managed deployments first
- Render's Node runtime is simpler for initial deployment
- Docker will be used when moving to VMs or Kubernetes (future roadmap)

**What the Docker setup includes:**
- Multi-stage build for minimal image size
- Non-root user for security
- Health checks
- Volume mounting for development
- MongoDB + Mongo Express for local development

See [`apps/backend/docker/README.md`](./apps/backend/docker/README.md) for full Docker documentation.

---

## 💻 Running Locally

### Prerequisites

- Node.js 18+ and npm 9+
- MongoDB (local or Atlas connection string)
- Git

### Quick Start

```bash
# Clone the repository
git clone https://github.com/antik1108/Terminal-Portfolio-ANTEC.git
cd Terminal-Portfolio-ANTEC

# Install all dependencies (workspaces)
npm install

# Set up backend environment
cp apps/backend/.env.example apps/backend/.env
# Edit .env with your MongoDB URI and JWT secret

# Run both frontend and backend
npm run dev:all

# Or run separately:
npm run dev:web      # Frontend at http://localhost:5173
npm run dev:backend  # Backend at http://localhost:3001
```

### Verify Setup

```bash
# Health check
curl http://localhost:3001/api/health

# Expected response:
# {"status":"OK","message":"ANTEC Backend API is running"}
```

---

## 🗺️ Future Roadmap

This project is being built iteratively. Here's what's planned:

| Phase | Goal | Status |
|-------|------|--------|
| 1 | Core terminal UI + auth | ✅ Complete |
| 2 | Platform deployment (Vercel/Render) | ✅ Complete |
| 3 | Docker implementation | ✅ Complete (not deployed) |
| 4 | CI/CD pipeline (GitHub Actions) | 🔜 Planned |
| 5 | Docker deployment on Render | 🔜 Planned |
| 6 | VM deployment (DigitalOcean/AWS) | 🔜 Planned |
| 7 | Monitoring & logging (Prometheus, Grafana) | 🔜 Planned |
| 8 | Kubernetes exploration | 📋 Future |

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [`apps/web/README.md`](./apps/web/README.md) | Frontend setup, components, auth flow |
| [`apps/backend/README.md`](./apps/backend/README.md) | Backend API, endpoints, security |
| [`apps/backend/docker/README.md`](./apps/backend/docker/README.md) | Docker setup, DevOps learning notes |

---

## 🧑‍💻 Author

**Antik Mondal**

A student developer learning full-stack engineering and DevOps — the right way.

- Building production-grade projects to understand real-world practices
- Focused on security, clean architecture, and deployment workflows
- Learning Docker, CI/CD, and infrastructure step by step

---

## 📄 License

MIT License — feel free to learn from this project.

---

<div align="center">

**Built with ☕ and a love for terminals**

`> echo "Thanks for visiting!" && exit 0`

</div>
