# ThreatLens — Enterprise SOC Analytics Platform

> An enterprise-grade Security Operations Center analytics and threat detection platform demonstrating real-world SOC workflows, SIEM integration architecture, behavioral analytics, MITRE ATT&CK mapping, and AI-assisted incident investigation.

---

## Overview

ThreatLens is built as a portfolio-quality project that closely resembles a professional commercial security product. It is designed to be evaluated by cybersecurity professionals, software engineers, and hiring managers looking for evidence of production-level engineering across the full stack.

Every architectural decision reflects real Security Operations Center environments — the UI prioritises analyst workflow efficiency, critical alerts are immediately visible, and the data model is designed for future Splunk Enterprise integration without requiring a frontend redesign.

---

## Feature Areas

| Area | Status | Phase |
|---|---|---|
| SOC Dashboard (KPIs, attack timeline, world map, live feed) | ✅ Complete | Pre-phase |
| Alert Management (filter, triage, assign, bulk actions) | ✅ Complete | Pre-phase |
| Incident Management (investigation panel, evidence, timeline) | ✅ Complete | Pre-phase |
| MITRE ATT&CK Matrix (coverage view, technique detail) | ✅ Complete | Pre-phase |
| User Behavior Analytics (risk scoring, anomaly chart) | ✅ Complete | Pre-phase |
| IOC Intelligence (type filtering, confidence scoring) | ✅ Complete | Pre-phase |
| Live Log Stream (real-time event feed with filtering) | ✅ Complete | Pre-phase |
| Authentication Analytics | ✅ Complete | Pre-phase |
| Endpoint Security | ✅ Complete | Pre-phase |
| Network Monitoring | ✅ Complete | Pre-phase |
| AI-Assisted Investigation | ✅ Complete | Pre-phase |
| Detection Rules Engine | ✅ Complete | Pre-phase |
| Case Management | ✅ Complete | Pre-phase |
| Threat Intelligence | ✅ Complete | Pre-phase |
| **Splunk Enterprise Integration** | 🔄 Planned | Phase 1 |
| **Real-time Log Streaming** | 🔄 Planned | Phase 2 |
| **Detection Engine (live rules)** | 🔄 Planned | Phase 3 |
| **Event Correlation + Risk Scoring** | 🔄 Planned | Phase 4 |
| **MITRE Auto-mapping** | 🔄 Planned | Phase 5 |
| **UBA Baselines** | 🔄 Planned | Phase 6 |
| **IOC Enrichment** | 🔄 Planned | Phase 7 |
| **AI Investigation API** | 🔄 Planned | Phase 8 |
| **Case Management Backend** | 🔄 Planned | Phase 9 |
| **Enterprise Hardening** | 🔄 Planned | Phase 10 |

---

## Technology Stack

### Frontend
- **React 19** with TypeScript — component-based SOC UI
- **TanStack Router** — type-safe file-based routing with SSR
- **TanStack Start** — full-stack SSR framework with server functions
- **TanStack Query** — async state management with caching
- **Tailwind CSS v4** — utility-first styling with a custom dark SOC theme
- **Radix UI / shadcn** — accessible, composable UI primitives
- **Recharts** — interactive, responsive chart library
- **Lucide React** — consistent SOC-appropriate icon set
- **Sonner** — enterprise toast notifications

### Backend (Current — Server Functions)
- **TanStack Start Server Functions** — type-safe RPC, runs on Node/Cloudflare
- **Zod** — runtime input validation for all server functions
- **Nitro** — universal server runtime (targets Node, Cloudflare Workers, etc.)

### Planned Backend (Phase 1+)
- **Splunk Enterprise REST API** — primary log source and SIEM backbone
- **PostgreSQL** — persistent incident and case data (Phase 9)
- **Redis** — real-time event pub/sub for streaming dashboards (Phase 2)
- **OpenAI / LLM** — AI investigation summarisation (Phase 8)

---

## Project Structure

```
threatlens/
├── src/
│   ├── components/
│   │   ├── ui/                   # Radix/shadcn primitive components
│   │   ├── app-sidebar.tsx       # Navigation sidebar
│   │   ├── topbar.tsx            # Header with search, alerts, user
│   │   └── shared.tsx            # Reusable SOC UI components
│   │
│   ├── hooks/
│   │   └── use-mobile.tsx        # Responsive layout hook
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   └── server.functions.ts  # TanStack Start server functions
│   │   ├── config.server.ts      # Server-only config (secrets, env vars)
│   │   ├── constants.ts          # Platform-wide constants
│   │   ├── error-capture.ts      # Global error capture for SSR
│   │   ├── error-page.ts         # SSR error page renderer
│   │   ├── mock.ts               # Mock SOC data (replaced in Phase 1)
│   │   ├── types.ts              # Shared TypeScript type definitions
│   │   └── utils.ts              # General utilities (cn, etc.)
│   │
│   ├── routes/
│   │   ├── __root.tsx            # App shell, providers, layout
│   │   ├── index.tsx             # SOC Mission Control dashboard
│   │   ├── alerts.tsx            # Alert triage and management
│   │   ├── incidents.tsx         # Incident investigation
│   │   ├── analytics.tsx         # Security analytics
│   │   ├── mitre.tsx             # MITRE ATT&CK coverage matrix
│   │   ├── uba.tsx               # User Behavior Analytics
│   │   ├── ioc.tsx               # IOC Intelligence
│   │   ├── live-logs.tsx         # Real-time log stream
│   │   ├── authentication.tsx    # Auth event analytics
│   │   ├── endpoint.tsx          # Endpoint security overview
│   │   ├── network.tsx           # Network monitoring
│   │   ├── fim.tsx               # File Integrity Monitoring
│   │   ├── rules.tsx             # Detection rule management
│   │   ├── cases.tsx             # Case management
│   │   ├── reports.tsx           # Reporting
│   │   ├── search.tsx            # Universal search
│   │   ├── threat-intel.tsx      # Threat intelligence
│   │   ├── ai-analysis.tsx       # AI investigation assistant
│   │   ├── integrations.tsx      # Data source integrations
│   │   ├── settings.tsx          # Platform settings
│   │   ├── profile.tsx           # Analyst profile
│   │   └── help.tsx              # Help and documentation
│   │
│   ├── router.tsx                # TanStack Router configuration
│   ├── routeTree.gen.ts          # Auto-generated route tree (do not edit)
│   ├── server.ts                 # SSR server entry with error handling
│   ├── start.ts                  # TanStack Start middleware
│   └── styles.css                # Global styles + Tailwind configuration
│
├── .env.example                  # Environment variable template
├── .gitignore
├── components.json               # shadcn/ui configuration
├── eslint.config.js
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Getting Started

### Prerequisites

- Node.js 20+ or Bun 1.x
- (Phase 1+) Splunk Enterprise 9.x with REST API access
- (Phase 1+) A Splunk Universal Forwarder configured on your SOC endpoints

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/threatlens.git
cd threatlens

# Install dependencies
bun install
# or: npm install

# Copy environment template
cp .env.example .env.local
# Edit .env.local with your values (Splunk credentials, etc.)

# Start development server
bun run dev
# or: npm run dev
```

The application runs at `http://localhost:3000`.

### Build

```bash
# Production build (Nitro — targets Node by default)
bun run build

# Preview production build locally
bun run preview
```

---

## Design System

ThreatLens uses a purpose-built dark SOC theme:

- **Background**: Deep navy-slate (`oklch(0.16 0.02 250)`)
- **Primary**: Cyan (`oklch(0.72 0.16 200)`) — actions, highlights
- **Critical**: Deep red (`oklch(0.62 0.24 18)`) — P1 alerts, ransomware
- **High**: Orange (`oklch(0.70 0.20 40)`) — P2 alerts, lateral movement
- **Medium**: Amber (`oklch(0.78 0.17 85)`) — P3 alerts
- **Low**: Cyan-low (`oklch(0.72 0.15 200)`) — informational
- **Success**: Green (`oklch(0.70 0.18 150)`) — resolved, healthy
- **Typography**: Inter (UI) + JetBrains Mono (data, IDs, hashes)
- **Glass effect**: `backdrop-filter: blur(12px)` on panels
- **Grid background**: Subtle 32px grid for dashboard areas

---

## Development Roadmap

The project follows a ten-phase development plan:

1. **Splunk Integration** — Connect to Splunk REST API, replace mock data
2. **Real-time Streaming** — WebSocket/SSE for live dashboard updates
3. **Detection Engine** — Modular, configurable rule execution
4. **Event Correlation** — Multi-event attack narrative construction
5. **MITRE Auto-mapping** — Automatic technique tagging for detections
6. **User Behavior Analytics** — Baseline computation and anomaly detection
7. **IOC Intelligence** — Threat intel enrichment (MISP, OTX, Recorded Future)
8. **AI Investigation** — LLM-powered summarisation and recommendations
9. **Case Management** — Full IR workflow with backend persistence
10. **Enterprise Hardening** — Auth, RBAC, performance, documentation, testing

---

## Security Notes

- All secrets are server-side only (`.server.ts` modules, Zod-validated)
- `VITE_*` variables are the only values that reach the browser bundle
- SSL verification for Splunk is enabled by default
- The `.env.local` file is gitignored — never commit credentials

---

## License

This project is for portfolio and educational purposes. All mock data is
synthetic and does not represent any real organisation, individual, or
security incident.

Third-party component licenses are preserved in their respective source files.
