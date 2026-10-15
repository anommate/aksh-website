"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * The copyright year. Server markup carries the build year, so the page stays
 * fully static; after hydration the browser's own year replaces it, so the
 * footer is current even if the site was built in an earlier year.
 */
export function CopyrightYear({ buildYear }: { buildYear: number }) {
  const year = useSyncExternalStore(subscribe, () => new Date().getFullYear(), () => buildYear);
  return <>{year}</>;
}
