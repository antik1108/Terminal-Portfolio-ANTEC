# 🐳 Docker Setup — Learning & Future Deployment

This folder contains Docker configurations for the ANTEC backend. These files exist as part of a **learning journey into DevOps** and are prepared for future deployment scenarios.

---

## 📌 Important: Current Status

| Aspect | Status |
|--------|--------|
| Docker implemented | ✅ Yes |
| Docker used in production | ❌ No |
| Current deployment | Render Node.js runtime |
| Purpose | Learning + future-ready |

**This is intentional.** The goal is to learn DevOps step by step:

1. ✅ First: Deploy using platform-managed runtimes (Vercel, Render)
2. 🔜 Next: Deploy using Docker on platforms
3. 🔜 Later: Deploy Docker on VMs (DigitalOcean, AWS EC2)
4. 📋 Future: Explore Kubernetes

---

## 🎯 Purpose of Docker in This Project

Docker is implemented here to:

- **Learn containerization** — understand how production apps are packaged
- **Ensure reproducibility** — same environment everywhere
- **Prepare for VM deployment** — Docker is essential when moving off managed platforms
- **Practice DevOps workflows** — multi-stage builds, health checks, non-root users

This setup is **real and production-grade** — it's just not deployed yet.

---

## 📁 File Overview

### In Parent Directory (`apps/backend/`)

| File | Purpose | Used Now? |
|------|---------|-----------|
| `Dockerfile` | Production multi-stage build | ✅ Ready (not deployed) |
| `.dockerignore` | Exclude unnecessary files from build | ✅ Active |

### In This Folder (`apps/backend/docker/`)

| File | Purpose | Used Now? |
|------|---------|-----------|
| `Dockerfile.dev` | Development build with nodemon | ❌ Local dev only |
| `docker-compose.yml` | Production stack (backend + MongoDB) | ❌ Local/future |
| `docker-compose.dev.yml` | Dev stack + Mongo Express UI | ❌ Local dev only |

---

## 🔍 What Each File Does

### `Dockerfile` (Production)

```dockerfile
# Multi-stage build
FROM node:20-alpine AS deps    # Stage 1: Install dependencies
FROM node:20-alpine AS production  # Stage 2: Production image
```

**Features:**
- Multi-stage build for smaller image (~150MB vs ~500MB)
- Non-root user (`nodejs`) for security
- Only production dependencies in final image
- Health check built-in
- No hardcoded PORT (platform injects it)

### `Dockerfile.dev` (Development)

- Includes `nodemon` for hot-reload
- All dependencies (dev + prod)
- Optimized for local development speed

### `docker-compose.yml` (Production Stack)

```yaml
services:
  backend:    # Express.js API
  mongo:      # MongoDB 7
```

**When to use:** Local production testing, or deploying to a VM.

### `docker-compose.dev.yml` (Development Stack)

```yaml
services:
  backend:       # Express.js with hot-reload
  mongo:         # MongoDB 7
  mongo-express: # Web UI for MongoDB
```

**When to use:** Local development with full stack.

---

## 🧑‍💻 How to Use (Local Development)

### Option 1: Development with Hot-Reload

```bash
cd apps/backend
docker-compose -f docker/docker-compose.dev.yml up
```

**Services:**
- Backend: http://localhost:3001
- Mongo Express: http://localhost:8081 (admin/admin123)

### Option 2: Production-like Local Test

```bash
cd apps/backend
docker-compose -f docker/docker-compose.yml up
```

### Option 3: Just Build the Image

```bash
cd apps/backend
docker build -t antec-backend .
docker run -p 3001:3001 --env-file .env antec-backend
```

---

## 🗺️ When Will Docker Be Used in Production?

| Scenario | Docker Needed? | Timeline |
|----------|----------------|----------|
| Current (Render Node runtime) | No | Now |
| Render Docker deployment | Yes | When ready to switch |
| DigitalOcean Droplet | Yes | Future learning |
| AWS EC2 / ECS | Yes | Future learning |
| Kubernetes | Yes | Long-term goal |

**The Dockerfile is ready.** Switching Render from "Node" to "Docker" is a one-click change when the time comes.

---

## 🎓 Real-World DevOps Mapping

This Docker setup mirrors professional practices:

| Practice | Implementation |
|----------|----------------|
| Multi-stage builds | ✅ Deps stage + production stage |
| Security | ✅ Non-root user, minimal image |
| Health checks | ✅ Built into Dockerfile |
| Dev/Prod parity | ✅ Same base, different configs |
| Environment separation | ✅ `.env` files, not hardcoded |
| Build optimization | ✅ `.dockerignore`, layer caching |

---

## 📝 Commands Reference

```bash
# Build production image
docker build -t antec-backend .

# Run with environment file
docker run -p 3001:3001 --env-file .env antec-backend

# Start dev stack
docker-compose -f docker/docker-compose.dev.yml up

# Start production stack
docker-compose -f docker/docker-compose.yml up -d

# View logs
docker-compose -f docker/docker-compose.yml logs -f backend

# Stop and cleanup
docker-compose -f docker/docker-compose.yml down

# Stop and remove volumes (⚠️ deletes data)
docker-compose -f docker/docker-compose.yml down -v
```

---

## 🧠 Why Document All This?

This README exists because:

1. **Honesty matters** — No fake "production Kubernetes cluster" claims
2. **Learning is visible** — Shows progression from managed → Docker → VMs
3. **For recruiters** — Demonstrates understanding, not just copy-paste
4. **For future me** — Clear docs when it's time to deploy

---

## 📄 License

MIT
