# ANTEC Web (Frontend)

This is the frontend for the ANTEC Terminal Portfolio — a React (Vite) app that provides a terminal-style UI for the portfolio. It integrates authentication with the backend API and presents an interactive terminal powered by `xterm.js`.

This README is a concise guide to get the frontend running and to explain how it connects to the backend, written so someone with minimal experience can follow it.

## What this app does (simple)
- Shows a terminal-like experience in the browser where you can type commands (help, whoami, projects, antec login, antec signup, etc.).
- Provides interactive signup/login flows that call the backend API and store tokens locally for session persistence.
- Uses `@antec/api-client` (a small package in `packages/`) to talk to the backend.

## Prerequisites
- Node.js (v18+ recommended)
- npm
- A running backend API (see `apps/backend/README.md`) — by default the frontend expects the API at `http://localhost:3001/api`.

## Quick start (local)
1. Copy example env file (if present) and confirm the backend URL is correct in `packages/shared/src/index.js` (API_ENDPOINTS.BASE_URL is `http://localhost:3001/api` by default).

```bash
# from repo root
cd apps/web
npm install
npm run dev
```

2. Open your browser at the Vite dev server address (usually `http://localhost:5173`).

## How authentication works (high-level)
1. In the terminal UI you run `antec signup` or `antec login`.
2. A small interactive form in the terminal collects credentials.
3. The frontend calls the backend API (`/api/auth/signup` or `/api/auth/login`) using `@antec/api-client`.
4. On success, the backend returns a JWT access token (and a refresh token). The frontend stores the token and user in `localStorage` and updates the UI to show the logged-in user.
5. Protected operations use the stored token in the `Authorization: Bearer <token>` header.

If you logout (`antec logout`), the frontend will call the backend logout endpoint and clear local storage so the terminal returns to a guest prompt.

## Important files to know
- `src/components/TerminalPortfolio.jsx` — Terminal UI, command handling, and integration with auth.
- `src/contexts/AuthContext.jsx` — React context that holds auth state and exposes `login`, `signup`, `logout` functions for the app.
- `src/utils/authCommands.js` — Terminal command handlers for signup/login/logout flows.
- `packages/api-client/src/index.js` — HTTP client wrapper used by the frontend to call the backend and handle tokens.
- `packages/shared/src/index.js` — Shared constants (API endpoints, messages, validation helpers).

## Common developer tasks
- Change API endpoint: edit `API_ENDPOINTS.BASE_URL` in `packages/shared/src/index.js` or set a proxy in Vite if you prefer.
- Reset local session: open DevTools → Application → Local Storage and remove `antec_auth_token` and `antec_user`, or use the `antec logout` command.

## Troubleshooting
- If `whoami` shows `guest` after login, try refreshing the page — the app reads the stored token on load and restores the session. The code includes logic to re-sync state immediately after login, but timing differences can occur during development.
- If the terminal commands are unresponsive, open DevTools console to see errors. Missing dependencies or mismatched package versions can cause issues.

## Next steps (optional enhancements)
- Add E2E tests (Playwright / Cypress) to record and verify typical flows (signup/login/logout/whoami).
- Use httpOnly secure cookies for refresh tokens in production to improve security.

If you want, I can expand either README with curl examples, screenshots, or a short video walkthrough.
