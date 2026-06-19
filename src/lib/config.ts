/**
 * ThreatLens — Backend Configuration Reference
 *
 * This file documents the environment variables consumed by the future
 * ThreatLens API backend. In SPA Phase 0, there is no server-side code —
 * all data is client-side mock. This file is kept as an architectural
 * reference and will be populated in Phase 1 (Splunk integration).
 *
 * Phase 1 backend setup:
 *   The ThreatLens API will be a separate Express/Fastify service that:
 *   1. Authenticates with Splunk Enterprise REST API
 *   2. Translates frontend queries into SPL (Splunk Processing Language)
 *   3. Returns normalized JSON to the React frontend
 *   4. Runs as a Vercel Serverless Function or a standalone Node.js server
 *
 * Environment variable conventions:
 *   VITE_API_URL    — Public frontend config (base URL of the API service)
 *   SPLUNK_*        — Splunk credentials (server-side only, never VITE_ prefixed)
 *   OPENAI_*        — AI service keys (server-side only)
 *   THREATLENS_*    — Platform settings
 */

/**
 * Public configuration accessible in the browser.
 * Only VITE_-prefixed variables are injected by Vite into the client bundle.
 */
export const clientConfig = {
  /** Base URL of the ThreatLens API service. Defaults to same-origin for development. */
  apiBaseUrl: import.meta.env.VITE_API_URL ?? "",

  /** Whether to enable verbose debug logging in the console. */
  debugMode: import.meta.env.DEV,

  /** Environment label for display in the topbar. */
  environment: import.meta.env.VITE_ENVIRONMENT ?? "development",
} as const;
