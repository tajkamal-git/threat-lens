/**
 * ThreatLens — Vite Configuration
 *
 * Pure Vite SPA targeting static hosting on Vercel.
 * TanStack Router (file-based routing, no SSR) + Tailwind CSS v4.
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    // Router plugin MUST precede React plugin
    TanStackRouterVite({ autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  server: {
    port: 3000,
    host: true,
  },
  preview: {
    port: 4000,
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react":  ["react", "react-dom"],
          "vendor-router": ["@tanstack/react-router", "@tanstack/react-query"],
          "vendor-charts": ["recharts"],
          "vendor-radix":  [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
            "@radix-ui/react-tooltip",
          ],
        },
      },
    },
  },
});
