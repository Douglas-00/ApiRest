import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";

export function renderWithQuery(ui: ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

/** Stubs global fetch with a handler keyed by "METHOD /path". */
export function mockFetch(handler: (method: string, url: string, body?: unknown) => [number, unknown]) {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
    const method = init?.method ?? "GET";
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;
    const [status, json] = handler(method, String(input), body);
    return new Response(JSON.stringify(json), { status, headers: { "content-type": "application/json" } });
  });
}
