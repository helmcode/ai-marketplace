# AI Agent Marketplace - Frontend

React-based frontend for the AI Agent Marketplace.

## Tech Stack

- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Authentication**: Auth0 React SDK
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **State Management**: React Context + Hooks

## Design System

### Theme: Dark Futuristic Purple

```css
/* Primary Colors */
--bg-primary: #0a0a0f;        /* Deep dark background */
--bg-secondary: #12121a;      /* Card backgrounds */
--bg-tertiary: #1a1a2e;       /* Elevated elements */

/* Purple Accents */
--accent-primary: #8b5cf6;    /* Primary purple */
--accent-secondary: #a78bfa;  /* Lighter purple */
--accent-glow: #c4b5fd;       /* Glow effects */

/* Text */
--text-primary: #f8fafc;      /* Primary text */
--text-secondary: #94a3b8;    /* Secondary text */
--text-muted: #64748b;        /* Muted text */

/* Status */
--success: #22c55e;
--warning: #eab308;
--error: #ef4444;
```

### Component Style Guidelines

- **Cards**: Rounded corners (lg), subtle border, glass-morphism effect
- **Buttons**: Gradient backgrounds for primary actions, outlined for secondary
- **Inputs**: Dark backgrounds with purple focus rings
- **Animations**: Subtle glow effects, smooth transitions

## Project Structure

```
frontend/
├── CLAUDE.md
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── .env.example
├── .gitignore
│
├── public/
│   └── favicon.svg
│
└── src/
    ├── main.jsx                    # App entry point
    ├── App.jsx                     # Root component with routing
    ├── index.css                   # Global styles + Tailwind
    │
    ├── components/
    │   ├── ui/                     # Reusable UI components
    │   │   ├── Button.jsx
    │   │   ├── Card.jsx
    │   │   ├── Input.jsx
    │   │   ├── Select.jsx
    │   │   ├── Badge.jsx
    │   │   ├── Spinner.jsx
    │   │   └── Modal.jsx
    │   │
    │   ├── layout/
    │   │   ├── Header.jsx          # Top navigation
    │   │   ├── Sidebar.jsx         # Side navigation (dashboard)
    │   │   ├── Footer.jsx
    │   │   └── Layout.jsx          # Main layout wrapper
    │   │
    │   ├── boxes/
    │   │   ├── BoxCard.jsx         # Box preview in dashboard
    │   │   ├── BoxTierSelect.jsx   # Tier selection (basic/medium/pro)
    │   │   ├── CreateBoxModal.jsx  # Modal to create new box
    │   │   └── BoxStatusBadge.jsx  # Box status indicator
    │   │
    │   ├── agents/
    │   │   ├── AgentCard.jsx       # Agent preview in marketplace
    │   │   ├── AgentConfigForm.jsx # Dynamic config form
    │   │   ├── InstalledAgentCard.jsx  # Agent installed in box
    │   │   └── StatusBadge.jsx     # Agent status indicator
    │   │
    │   └── terminal/
    │       ├── Terminal.jsx        # xterm.js terminal component
    │       └── TerminalModal.jsx   # Full-screen terminal modal
    │
    ├── pages/
    │   ├── Home.jsx                # Landing page
    │   ├── Marketplace.jsx         # Agent catalog (browse agents)
    │   ├── AgentDetail.jsx         # Agent detail + install to box
    │   ├── Dashboard.jsx           # User's boxes list
    │   ├── BoxDetail.jsx           # Single box with installed agents
    │   ├── Login.jsx               # Auth0 login redirect
    │   └── Callback.jsx            # Auth0 callback handler
    │
    ├── hooks/
    │   ├── useAuth.js              # Auth0 hook wrapper
    │   ├── useApi.js               # API calls with auth
    │   └── useWebSocket.js         # WebSocket hook for terminal
    │
    ├── services/
    │   └── api.js                  # Axios instance + interceptors
    │
    └── context/
        └── AuthContext.jsx         # Auth state provider
```

## Pages

| Route | Component | Auth Required | Description |
|-------|-----------|---------------|-------------|
| `/` | Home | No | Landing page |
| `/marketplace` | Marketplace | No | Browse available agents |
| `/marketplace/:slug` | AgentDetail | Yes (to install) | Agent detail + install to box |
| `/dashboard` | Dashboard | Yes | User's boxes list |
| `/boxes/:id` | BoxDetail | Yes | Box detail with installed agents + terminal |
| `/login` | Login | No | Redirect to Auth0 |
| `/callback` | Callback | No | Auth0 callback |

## Auth0 Integration

### Setup

1. Create Auth0 Application (Single Page Application)
2. Configure Allowed Callback URLs: `http://localhost:5173/callback`
3. Configure Allowed Logout URLs: `http://localhost:5173`
4. Configure Allowed Web Origins: `http://localhost:5173`

### Environment Variables

```env
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=https://api.yourdomain.com
VITE_API_URL=http://localhost:8000
```

### Auth Flow

```jsx
// Protected route example
import { withAuthenticationRequired } from '@auth0/auth0-react';

const ProtectedRoute = ({ component }) => {
  const Component = withAuthenticationRequired(component);
  return <Component />;
};
```

## API Integration

### Axios Setup

```javascript
// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Auth interceptor adds JWT token
api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### API Endpoints Used

```javascript
// Agents catalog
GET  /api/agents                    // List all agents
GET  /api/agents/:slug              // Get agent details (install_command, tui_command)

// Boxes
GET  /api/boxes                     // User's boxes
POST /api/boxes                     // Create new box
GET  /api/boxes/:id                 // Get box details with agents
DELETE /api/boxes/:id               // Delete box

// Box Agents
GET  /api/boxes/:boxId/agents       // List agents in box
POST /api/boxes/:boxId/agents       // Install agent in box
PUT  /api/boxes/:boxId/agents/:id/config  // Update agent config
DELETE /api/boxes/:boxId/agents/:id // Uninstall agent

// Agent Terminal (restricted - only runs agent's tui_command)
WS   /api/boxes/:boxId/agents/:agentId/terminal  // WebSocket for agent TUI

// User
GET  /api/users/me                  // Current user profile
PUT  /api/users/me                  // Update profile (SSH key)
```

## Dynamic Config Form

The agent's `config_schema` (JSON Schema) drives the configuration form:

```json
{
  "type": "object",
  "properties": {
    "provider": {
      "type": "string",
      "enum": ["anthropic", "openai", "openrouter"],
      "title": "AI Provider"
    },
    "api_key": {
      "type": "string",
      "title": "API Key",
      "format": "password"
    },
    "model": {
      "type": "string",
      "title": "Model",
      "dependsOn": "provider"
    }
  }
}
```

The `AgentConfigForm` component parses this schema and renders appropriate inputs.

## Agent Terminal (Restricted)

The Agent Terminal allows users to interact with agents directly from the browser.

**Important**: This is a **restricted terminal** - it only runs the agent's `tui_command`. Users cannot execute arbitrary commands. For full shell access, they must SSH from their own machine.

### Dependencies

```bash
npm install xterm xterm-addon-fit xterm-addon-web-links
```

### Terminal Component

```jsx
// src/components/terminal/AgentTerminal.jsx
import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { useWebSocket } from '../../hooks/useWebSocket';

export function AgentTerminal({ boxId, agentId, onClose }) {
  const terminalRef = useRef(null);
  const { sendMessage, lastMessage, connect, disconnect } = useWebSocket(
    `/api/boxes/${boxId}/agents/${agentId}/terminal`
  );

  useEffect(() => {
    const term = new XTerm({
      theme: {
        background: '#0a0a0f',
        foreground: '#f8fafc',
        cursor: '#8b5cf6',
      },
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 14,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    // Send input to WebSocket (user typing in agent TUI)
    term.onData((data) => sendMessage(data));

    connect();

    return () => {
      disconnect();
      term.dispose();
    };
  }, [boxId, agentId]);

  return <div ref={terminalRef} className="h-full w-full" />;
}
```

### Usage Flow

1. User opens BoxDetail page
2. Sees list of installed agents with "Chat" button
3. Clicks "Chat" on an agent (e.g., OpenClaw)
4. Terminal modal opens, backend automatically runs `tui_command` (e.g., `openclaw tui`)
5. User interacts with agent in real-time
6. User closes modal when done

### Access Model

| Access Type | What User Can Do | How |
|-------------|------------------|-----|
| UI Terminal | Interact with agent TUI only | "Chat" button in BoxDetail |
| Full SSH | Any command, full control | SSH from user's own machine |

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

## Component Examples

### Button Component

```jsx
// Primary button with glow effect
<Button variant="primary" size="lg">
  Deploy Agent
</Button>

// Outline button
<Button variant="outline">
  Learn More
</Button>
```

### Agent Card

```jsx
<AgentCard
  name="OpenClaw"
  description="Autonomous AI agent with multi-channel support"
  icon="/agents/openclaw.svg"
  price={29}
  slug="openclaw"
/>
```

## Testing

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage
```

## Deployment

The frontend is deployed to **Cloudflare Pages** using wrangler.

### Required Environment Variables

Cloudflare credentials must be set before deploying:

```bash
export CLOUDFLARE_API_KEY="your-api-key"
export CLOUDFLARE_EMAIL="your-email@example.com"
```

These are typically stored in `~/.bashrc` or `~/.zshrc`.

### Deploy Command

```bash
# Set environment variables and deploy
export CLOUDFLARE_API_KEY="<api-key>" && export CLOUDFLARE_EMAIL="<email>" && npm run deploy
```

### Production URLs

- **Main URL**: https://ai-marketplace-gsh.pages.dev
- **Preview deploys**: https://<commit-hash>.ai-marketplace-gsh.pages.dev
