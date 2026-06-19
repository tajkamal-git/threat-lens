/**
 * ThreatLens — Frontend API Client
 *
 * A thin fetch wrapper consumed by all React Query hooks.
 * Provides consistent error handling, JSON parsing, and
 * AbortSignal passthrough for React Query cancellation support.
 */

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Fetches a JSON resource from the ThreatLens API.
 * Throws ApiError on non-2xx responses.
 */
export async function apiFetch<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
  signal?: AbortSignal,
): Promise<T> {
  const url = new URL(path, window.location.origin);

  if (params) {
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== "") {
        url.searchParams.set(key, String(val));
      }
    }
  }

  const res = await fetch(url.toString(), {
    signal,
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    let message = `API error ${res.status}`;
    try {
      const body = await res.json();
      if (typeof body.error === "string") message = body.error;
    } catch {
      // Ignore JSON parse errors on error responses
    }
    throw new ApiError(res.status, message);
  }

  return res.json() as Promise<T>;
}
