import { createRouter } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";

import { routeTree } from "./routeTree.gen";

export const router = createRouter({
  routeTree,
  context: {
    // Populated by RouterProvider context prop in main.tsx
    queryClient: undefined! as QueryClient,
  },
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
