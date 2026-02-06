# AI Agent Marketplace - Frontend

React frontend for the AI Agent Marketplace. A dark-themed, responsive web application for deploying and managing AI agents on isolated cloud environments.

## Features

- **Dashboard** - View and manage your boxes (VPS instances)
- **Agent Marketplace** - Browse and install AI agents into your boxes
- **Web Terminal** - Interact with agents directly from the browser via xterm.js
- **Box Creation** - Select tier, region, and provision with Stripe checkout
- **Settings** - Profile, SSH key management, and billing portal
- **Auth0 Login** - Secure authentication with social providers

## Tech Stack

- **React 18** + **Vite**
- **Tailwind CSS** (dark theme with purple accents)
- **React Router v6**
- **Auth0 React SDK**
- **Axios** (HTTP client)
- **xterm.js** (terminal emulator)
- **Cloudflare Pages** (deployment)

## Project Structure

```
frontend/
├── public/
│   └── agents/              # Agent icons (SVG)
├── src/
│   ├── components/
│   │   ├── boxes/           # TierSelector, RegionSelector
│   │   ├── layout/          # Sidebar, Layout
│   │   ├── modals/          # SettingsModal
│   │   ├── terminal/        # Terminal component (xterm.js)
│   │   └── ui/              # Button, Card, Input, Modal, etc.
│   ├── hooks/               # useApi, useWebSocket
│   ├── pages/
│   │   ├── Dashboard.jsx    # Box list
│   │   ├── BoxDetail.jsx    # Box info + agents + terminal
│   │   ├── BoxCreate.jsx    # Create box with Stripe checkout
│   │   ├── Marketplace.jsx  # Agent catalog
│   │   └── BillingSuccess.jsx
│   ├── services/
│   │   └── api.js           # Axios instance + API helpers
│   ├── utils/               # Region utils, helpers
│   ├── App.jsx              # Routing
│   └── main.jsx             # Entry point
├── package.json
├── tailwind.config.js
├── vite.config.js
└── .env.example
```

## Getting Started

### Prerequisites

- Node.js 18+
- An Auth0 SPA application
- Backend API running

### Installation

```bash
# Clone the repository
git clone https://github.com/helmcode/ai-marketplace.git
cd ai-marketplace

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Auth0 and API values
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Build

```bash
npm run build
npm run preview  # Preview production build locally
```

## Environment Variables

Copy `.env.example` and fill in your values:

| Variable | Description |
|----------|-------------|
| `VITE_AUTH0_DOMAIN` | Auth0 tenant domain (e.g. `your-tenant.auth0.com`) |
| `VITE_AUTH0_CLIENT_ID` | Auth0 SPA application client ID |
| `VITE_AUTH0_AUDIENCE` | Auth0 API audience identifier |
| `VITE_API_URL` | Backend API URL (e.g. `http://localhost:8000`) |

## Deployment

The frontend deploys to Cloudflare Pages:

```bash
# Requires CLOUDFLARE_API_KEY and CLOUDFLARE_EMAIL env vars
npm run deploy
```

## Auth0 Setup

1. Create a **Single Page Application** in Auth0
2. Configure the following URLs in the Auth0 Dashboard:
   - **Allowed Callback URLs**: `http://localhost:5173/callback, https://yourdomain.com/callback`
   - **Allowed Logout URLs**: `http://localhost:5173, https://yourdomain.com`
   - **Allowed Web Origins**: `http://localhost:5173, https://yourdomain.com`
3. Create an **API** in Auth0 with your audience identifier

## Design System

Dark futuristic theme with purple accents:

- **Background**: Deep dark (`#0a0a0f`, `#12121a`)
- **Accent**: Purple gradient (`#8b5cf6` to `#a78bfa`)
- **Cards**: Rounded corners, subtle borders, glass-morphism
- **Terminal**: JetBrains Mono font, purple cursor

## License

This project is licensed under the [GNU Affero General Public License v3.0](LICENSE).
