# 🖥️ ANTEC Web (Frontend)

The frontend for ANTEC Terminal Portfolio — a React application that renders a fully interactive terminal experience in the browser.

---

## 📋 Overview

This frontend delivers:
- **Terminal UI**: Authentic Linux-style terminal powered by xterm.js
- **Boot sequence**: Animated startup with ASCII art and system messages
- **Command system**: Built-in commands (`help`, `whoami`, `projects`, `theme`, etc.)
- **Authentication**: Interactive `antec login` / `antec signup` flows
- **Multiple themes**: Dark, light, green-goblin, ubuntu, espresso, and more

Type commands. Get responses. Feel like you're SSHing into a server.

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | React 19 |
| Build Tool | Vite 7 |
| Terminal | xterm.js + addons |
| Styling | CSS (no framework) |
| API Client | `@antec/api-client` (monorepo package) |

---

## 🚀 Running Locally

### Prerequisites

- Node.js 18+
- npm 9+
- Backend API running (see `apps/backend/README.md`)

### Setup

```bash
# From repo root
cd apps/web

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173 in your browser.

### With Backend

```bash
# From repo root — run both
npm run dev:all
```

---

## ⌨️ Available Commands

Type `help` in the terminal to see all commands:

| Command | Description |
|---------|-------------|
| `help` | Show all available commands |
| `whoami` | Display current user |
| `about` | About the developer |
| `projects` | List portfolio projects |
| `skills` | Technical skills |
| `contact` | Contact information |
| `theme <name>` | Change terminal theme |
| `clear` | Clear the terminal |
| `antec login` | Log in to account |
| `antec signup` | Create new account |
| `antec logout` | Log out |
| `antec status` | Show auth status |

---

## 🎨 Themes

Change themes with `theme <name>`:

- `dark` (default)
- `light`
- `green-goblin`
- `ubuntu`
- `blue-matrix`
- `espresso`

---

## 🔐 Authentication Flow

1. User types `antec signup` or `antec login`
2. Terminal prompts for credentials (interactive input)
3. Frontend calls backend via `@antec/api-client`
4. On success: JWT stored in localStorage, prompt updates to show username
5. On logout: Token cleared, returns to guest prompt

```
guest@antec:~$ antec login
Email or username: myuser
Password: ********
✓ Login successful!

myuser@antec:~$ whoami
myuser
```

---

## 📁 Folder Structure

```
src/
├── main.jsx              # App entry point
├── App.jsx               # Root component
├── App.css               # Global styles
├── index.css             # Base styles
├── components/
│   ├── TerminalPortfolio.jsx  # Main terminal UI
│   ├── BootSequence.jsx       # Startup animation
│   ├── BootSequence.css       # Boot styles
│   ├── ASCIILogo.jsx          # ASCII art logo
│   ├── BootMessages.jsx       # System boot messages
│   └── LoadingCursor.jsx      # Blinking cursor
├── contexts/
│   └── AuthContext.jsx        # React auth state
└── utils/
    ├── authCommands.js        # Auth command handlers
    ├── passwordInput.js       # Secure password input
    └── promptManager.js       # Dynamic prompt updates
```

---

## 🔧 Configuration

### API Endpoint

The API URL is configured in `packages/shared/src/index.js`:

```javascript
export const API_ENDPOINTS = {
  BASE_URL: 'http://localhost:3001/api',
  // ...
}
```

For production, this should point to your deployed backend.

### Vite Config

```javascript
// vite.config.js
export default {
  server: {
    port: 5173,
    host: true
  }
}
```

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| `whoami` shows guest after login | Refresh page — session restores from localStorage |
| API connection failed | Ensure backend is running on port 3001 |
| CORS errors | Check `CORS_ORIGIN` in backend `.env` |
| Terminal not rendering | Check browser console for xterm.js errors |

---

## 📦 Dependencies on Monorepo Packages

This frontend uses shared packages:

```
packages/
├── api-client/   # HTTP client for backend calls
└── shared/       # Constants, types, validation
```

These are linked via npm workspaces — no manual linking needed.

---

## 📄 License

MIT
