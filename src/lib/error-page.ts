/**
 * ThreatLens — Error Page Utility
 *
 * Renders a minimal HTML error page as a string for catastrophic failures.
 * In SPA mode, this is used as a static fallback only — React's error
 * boundary (in __root.tsx) handles runtime errors gracefully.
 *
 * If a future server-side API layer is introduced (Phase 1+), this module
 * can be re-used by the API error handler.
 */
export function renderErrorPage(title = "Something went wrong"): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${title} — ThreatLens</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body {
        font: 15px/1.5 system-ui, -apple-system, sans-serif;
        background: #0e1117;
        color: #e2e8f0;
        display: grid;
        place-items: center;
        min-height: 100vh;
        margin: 0;
        padding: 1.5rem;
      }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: #94a3b8; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button {
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        font: inherit;
        cursor: pointer;
        text-decoration: none;
        border: 1px solid transparent;
      }
      .primary { background: #00b4d8; color: #0e1117; }
      .secondary { background: transparent; color: #e2e8f0; border-color: #334155; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>${title}</h1>
      <p>An error occurred. You can try refreshing or return to the dashboard.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Try again</button>
        <a class="secondary" href="/">Dashboard</a>
      </div>
    </div>
  </body>
</html>`;
}
