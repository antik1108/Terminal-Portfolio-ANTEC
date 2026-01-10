# ANTEC Backend (API)

This is the backend API for the ANTEC Terminal Portfolio. It is a small Express.js server that provides authentication endpoints and a user model stored in MongoDB. The API is intentionally simple and secure by default (JWT authentication, rate limiting, input validation, and safe defaults).

This README explains what the backend does and how to run it locally in a way that's approachable even if you're not an expert.

## What this service does
- Stores user accounts (username, email, password) in MongoDB.
- Provides authentication endpoints: signup, login, logout, refresh token, and get current user (`/api/auth/*`).
- Issues JSON Web Tokens (JWT) for authentication and supports refresh tokens.
- Includes security features like helmet headers, rate limiting, and password strength checks.

## Key concepts (simple)
- MongoDB: a database used to store users.
- JWT (JSON Web Token): a secure token the server gives to a user after they sign in; the token is sent with requests to prove identity.
- Refresh token: a longer-lived token used only to request a new access token.

## Prerequisites
- Node.js (v18+ recommended)
- npm
- MongoDB running locally or a MongoDB connection string

## Quick start (local)
1. Copy the example env file and fill it in with your values:

```bash
cp .env.example .env
# Edit .env and provide a secure JWT_SECRET and a valid MONGODB_URI
```

2. Install dependencies and start the server in development mode:

```bash
cd apps/backend
npm install
npm run dev
```

The server will start on the port defined in your `.env` (default `3001`) and expose the API under `/api`.

## Useful endpoints
- POST `/api/auth/signup` — Create a new account. Expects `username`, `email`, `password`, `confirmPassword`.
- POST `/api/auth/login` — Log in. Expects `emailOrUsername`, `password`. Returns `token` (access token) and `refreshToken`.
- POST `/api/auth/logout` — Log out. Requires Authorization header with Bearer token.
- POST `/api/auth/refresh` — Exchange a refresh token for a new access token.
- GET `/api/auth/me` — Get current logged-in user. Requires Authorization header.

Responses are JSON with success flags and helpful error messages. Validation errors return structured `errors` describing fields.

## Environment variables (from `.env.example`)
- `PORT` — Server port (default 3001)
- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — Secret used to sign JWTs (must be strong and kept secret)
- `JWT_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` — Token expiry settings
- `BCRYPT_ROUNDS` — Number of salt rounds for password hashing
- `CORS_ORIGIN` — Allowed origins for CORS

Important: Never commit your real `.env` file — use `.env.example` for documentation and keep secrets local or in CI.

## Security notes
- The project uses `bcrypt` for password hashing and `jsonwebtoken` for tokens.
- Tokens include a unique `jti` and are validated with issuer/audience claims.
- There is an in-memory blacklist for revoked tokens — for production use a shared store like Redis to support multiple server instances.

## Troubleshooting
- If you see MongoDB connection errors, verify `MONGODB_URI` and that MongoDB is running.
- If token errors appear, ensure `JWT_SECRET` matches between environments and is at least 32 characters.

## Where to look in the codebase
- `src/index.js` — App entry: middleware, helmet, rate limiting and route mounting.
- `src/config/database.js` — MongoDB connection logic.
- `src/controllers/authController.js` — Signup/login/logout/refresh logic.
- `src/utils/jwtUtils.js` — Token creation, verification and blacklist helpers.
- `src/models/User.js` — Mongoose user schema and validation.

If you want, I can add a short API examples section with curl or Postman snippets.
