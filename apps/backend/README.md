# 🔧 ANTEC Backend API

The backend service for ANTEC Terminal Portfolio — a secure Express.js REST API providing authentication and user management.

---

## 📋 Overview

This backend handles:
- **User authentication**: Signup, login, logout, token refresh
- **Session management**: JWT access tokens + refresh tokens
- **Security**: Password hashing, rate limiting, security headers
- **Data persistence**: MongoDB with Mongoose ODM

The API is intentionally minimal and secure by default — no unnecessary endpoints, no bloat.

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js 20 (ES Modules) |
| Framework | Express.js 4.x |
| Database | MongoDB 7 + Mongoose 8 |
| Auth | JWT (jsonwebtoken) + bcrypt |
| Security | Helmet, express-rate-limit, CORS |
| Validation | express-validator |

---

## 📡 API Overview

Base URL: `/api`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/auth/signup` | Create new account | No |
| `POST` | `/auth/login` | Authenticate user | No |
| `POST` | `/auth/logout` | Invalidate token | Yes |
| `POST` | `/auth/refresh` | Get new access token | Refresh token |
| `GET` | `/auth/me` | Get current user | Yes |
| `GET` | `/health` | Health check | No |

### Response Format

All responses follow this structure:

```json
{
  "success": true,
  "message": "Operation completed",
  "user": { ... },
  "token": "eyJhbG..."
}
```

Error responses include validation details:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

---

## 🔐 Environment Variables

Create a `.env` file from the example:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3001` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/antec-terminal` |
| `JWT_SECRET` | Secret for signing tokens | *required* |
| `JWT_EXPIRES_IN` | Access token expiry | `24h` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `7d` |
| `BCRYPT_ROUNDS` | Password hash rounds | `14` |
| `CORS_ORIGIN` | Allowed origins | `http://localhost:5173` |

⚠️ **Never commit `.env` files** — use `.env.example` for documentation.

---

## 🚀 Running Locally

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB (local or connection string)

### Setup

```bash
# From repo root
cd apps/backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your values

# Start development server (with hot-reload)
npm run dev

# Or start production server
npm start
```

### Verify

```bash
curl http://localhost:3001/api/health
# {"status":"OK","message":"ANTEC Backend API is running"}
```

---

## 🐳 Docker Note

This backend includes a production-ready Dockerfile:

```
apps/backend/
├── Dockerfile        # Production build (used by Render if needed)
├── .dockerignore     # Optimized build context
└── docker/           # Additional configs for local dev
```

**Current deployment**: Render Node.js runtime (not Docker)

**Docker status**: Implemented for learning, ready for future use

See [`docker/README.md`](./docker/README.md) for Docker documentation.

---

## 🛡️ Security Considerations

| Feature | Implementation |
|---------|----------------|
| Password hashing | bcrypt with configurable rounds |
| Token security | JWT with `jti`, issuer, audience claims |
| Rate limiting | 100 req/15min general, 10 req/15min for auth |
| Security headers | Helmet (HSTS, CSP, X-Frame-Options, etc.) |
| CORS | Configurable allowed origins |
| Input validation | express-validator on all inputs |
| Token revocation | In-memory blacklist (use Redis for production scale) |

---

## 📁 Folder Structure

```
src/
├── index.js              # Entry point, middleware setup
├── config/
│   └── database.js       # MongoDB connection
├── controllers/
│   └── authController.js # Signup, login, logout logic
├── middleware/
│   ├── auth.js           # JWT verification middleware
│   └── errorHandler.js   # Global error handler
├── models/
│   └── User.js           # Mongoose user schema
├── routes/
│   └── auth.js           # Auth route definitions
└── utils/
    ├── jwtUtils.js       # Token generation, verification
    └── passwordValidator.js # Password strength rules
```

---

## 🏥 Health Check

```bash
GET /api/health
```

Response:
```json
{
  "status": "OK",
  "message": "ANTEC Backend API is running"
}
```

Use this endpoint for:
- Load balancer health checks
- Docker HEALTHCHECK
- Monitoring uptime

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection failed | Check `MONGODB_URI`, ensure MongoDB is running |
| JWT errors | Verify `JWT_SECRET` is set and ≥32 characters |
| CORS blocked | Add your frontend URL to `CORS_ORIGIN` |
| Rate limited | Wait 15 minutes or increase limits in dev |

---

## 📄 License

MIT
