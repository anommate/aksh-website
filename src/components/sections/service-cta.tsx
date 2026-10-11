"use client";

import { Button } from "@/components/ui/button";
import { useDevelopmentNotice } from "@/components/ui/development-modal";
import type { ServiceCategory } from "@/content/services";

/**
 * Category CTA. Category pages are not built yet, so the action opens the
 * development notice for the planned route instead of linking to a dead page.
 */
export function ServiceCta({ label, destinationName, href }: ServiceCategory["cta"]) {
  const { openUnavailableNotice } = useDevelopmentNotice();

  return (
    <Button
      variant="secondary"
      aria-haspopup="dialog"
      onClick={() => openUnavailableNotice(destinationName, href)}
      className="w-full tablet:w-auto"
    >
      <span>{label}</span>
      <span aria-hidden="true">&rarr;</span>
    </Button>
  );
}
