# Deploying ANTEC Backend with Docker (Render)

This guide shows how to build and run the backend locally with Docker and how to deploy the Dockerized app to Render. It's written for learning and reproducibility.

## Prerequisites

- Docker installed (Docker Desktop) — https://www.docker.com/get-started
- A Render account (https://render.com) connected to your GitHub repo
- Environment variables for production (MONGODB_URI, JWT_SECRET, CORS_ORIGIN, etc.)

## Files of interest

- `Dockerfile` — already present at `apps/backend/Dockerfile`
- `src/index.js` — app entrypoint (listens on `process.env.PORT`)
- `.dockerignore` — added to reduce image size

## Local Docker workflow (build & test)

1. Build the image from the `apps/backend` folder:

```bash
cd apps/backend
docker build -t antec-backend:local .
```

2. Run the image, passing required env vars (example):

```bash
docker run -p 3001:3001 \
  -e MONGODB_URI="your_mongo_uri" \
  -e JWT_SECRET="devsecret" \
  -e CORS_ORIGIN="http://localhost:5173" \
  antec-backend:local
```

3. Quick health check (in another terminal):

```bash
curl http://localhost:3001/api/health
```

If you get JSON with status `OK`, the container is working.

## Push an image to Docker Hub (optional)

If you prefer Render to pull your Docker image from a registry (optional):

```bash
# tag the image
docker tag antec-backend:local yourdockerhubusername/antec-backend:latest

# login
docker login

# push
docker push yourdockerhubusername/antec-backend:latest
```

## Deploying to Render using Docker (recommended for learning)

1. On Render dashboard, click **New** → **Web Service**.
2. Connect your GitHub repository and choose the `main` branch (or whichever branch).
3. Under **Environment**, choose **Docker**.
4. Set the **Root Directory** to `apps/backend`.
5. Ensure Render will use the `Dockerfile` located at `apps/backend/Dockerfile` (the UI typically detects this when using a repo root). If asked, set the Dockerfile path accordingly.
6. Set the **Start Command** to:

```
node src/index.js
```

7. Add required Environment Variables in Render (Dashboard → Environment):

- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — JWT signing secret
- `CORS_ORIGIN` — e.g. `https://your-frontend.vercel.app`
- Any other RATE_LIMIT_* values if you tuned them

8. Deploy and watch the logs in Render. The service will be reachable at the provided URL (for example `https://antec-backend.onrender.com`).

Notes:
- Render will build the Docker image from your `Dockerfile` inside `apps/backend`. Use `docker` environment for full container parity.
- If you pushed an image to Docker Hub you can also create a Docker-backed service by telling Render to pull from your registry.

## After deploy

- Update your frontend environment variable (Vite uses `VITE_` prefix) to point to your backend API. Example:

```
VITE_API_URL=https://<your-render-service>.onrender.com/api
```

- Redeploy your frontend on Vercel so it picks up the new API URL (if it’s build-time variable).

## Debugging tips

- If the container fails on start, check Render logs for errors. Common causes:
  - Missing env var (MONGODB_URI, JWT_SECRET)
  - MongoDB IP access not allowed (if using Atlas, add Render's egress IPs or allow access from anywhere while testing)
- If Mongo connection fails locally, try connecting to a local Mongo (mongodb://host.docker.internal:27017) or use Atlas.

## Learning steps

- Try modifying the app and rebuilding locally with Docker to see the container lifecycle.
- Inspect the image layers with `docker history antec-backend:local` to learn what each Dockerfile line contributes.

---

If you want, I can also add a `render.yaml` blueprint for automatic Render creation — say the word and I will add it.
