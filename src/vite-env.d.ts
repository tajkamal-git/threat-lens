/// <reference types="vite/client" />

/**
 * ThreatLens — Vite Environment Type Declarations
 *
 * Extends Vite's ImportMetaEnv to add types for all VITE_-prefixed
 * environment variables used by the ThreatLens frontend.
 *
 * Only VITE_-prefixed variables are safe to reference in client code.
 * Server-side secrets (SPLUNK_*, OPENAI_*, etc.) must never be VITE_ prefixed
 * and should only exist in the backend API service (Phase 1+).
 */
interface ImportMetaEnv {
  /** Base URL of the ThreatLens API service (Phase 1+). Empty = same origin. */
  readonly VITE_API_URL?: string;

  /** Environment label displayed in the topbar (e.g. "development", "staging"). */
  readonly VITE_ENVIRONMENT?: string;

  /** Standard Vite built-ins */
  readonly MODE: string;
  readonly BASE_URL: string;
  readonly PROD: boolean;
  readonly DEV: boolean;
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
