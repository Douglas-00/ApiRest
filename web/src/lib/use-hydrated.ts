"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * false during SSR and hydration, true afterwards. Use it before rendering
 * data that may already be in the shared query cache: another component
 * (e.g. the header) can resolve the same query before this boundary
 * hydrates, which would make the first client render differ from the HTML.
 */
export function useHydrated() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
