# ANTEC Terminal Portfolio - Monorepo

A professional monorepo structure for the ANTEC Terminal Portfolio, built with industry-standard practices and ready for scaling.

## 🏗️ **Architecture**

```
antec-terminal-portfolio-monorepo/
├── apps/                         ✅ All runnable applications
│   └── web/                      ✅ React + Vite Web App
│       ├── src/                  ✅ Terminal portfolio components
│       ├── public/               ✅ Static assets
│       ├── package.json
│       ├── tsconfig.json
│       └── vite.config.js
│
├── packages/                     ✅ Shared code across apps
│   ├── shared/                   ✅ Types, schemas, constants
│   ├── ui/                       ✅ Shared React components
│   └── api-client/               ✅ Typed API client
│
├── turbo.json                    ✅ Monorepo task runner
├── tsconfig.base.json            ✅ Shared TypeScript config
└── package.json                  ✅ Workspace root
```

## 🚀 **Quick Start**

```bash
# Install all dependencies
npm install

# Start development server
npm run dev

# Build all packages
npm run build

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 📦 **Packages**

### `@antec/web`
The main React application featuring:
- Interactive terminal interface
- Boot sequence animation
- Command system with projects, socials, themes
- Responsive design for all devices
- xterm.js integration

### `@antec/shared`
Shared types, schemas, and constants:
- TypeScript interfaces
- Zod validation schemas
- Brand colors and configuration
- Terminal themes and settings

### `@antec/ui`
Reusable React components:
- Loading spinners
- Buttons and inputs
- Future shared UI elements

### `@antec/api-client`
Typed API client for external services:
- GitHub API integration
- Future backend API methods
- Type-safe HTTP requests

## 🛠️ **Technology Stack**

- **Frontend**: React 19.2.0 + Vite 7.2.4
- **Terminal**: xterm.js 6.0.0
- **Monorepo**: Turbo + npm workspaces
- **TypeScript**: 5.7.2 with strict mode
- **Validation**: Zod schemas
- **Styling**: Pure CSS with responsive design

## 🎯 **Features**

- ✅ **Industry-standard monorepo structure**
- ✅ **Type-safe across all packages**
- ✅ **Shared code reusability**
- ✅ **Fast builds with Turbo**
- ✅ **Ready for backend integration**
- ✅ **Mobile responsive**
- ✅ **Professional terminal experience**

## 🔮 **Future Roadmap**

- [ ] Add `apps/backend/` with Express + Socket.IO
- [ ] Add `apps/mobile/` with React Native
- [ ] Real-time features and user authentication
- [ ] Database integration
- [ ] CI/CD pipeline with GitHub Actions

## 🌐 **Deployment**

The web app is ready for deployment on:
- **Vercel** (recommended)
- **Netlify**
- **GitHub Pages**

```bash
# Build for production
npm run build

# Preview production build
cd apps/web && npm run preview
```

## 🤝 **Contributing**

This monorepo follows industry best practices:
- Conventional commits
- TypeScript strict mode
- ESLint configuration
- Shared tooling configuration

---

Built with ❤️ by Antik Mondal | [GitHub](https://github.com/antik1108) | [Portfolio](https://terminal-antec.tech)