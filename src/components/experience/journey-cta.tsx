"use client";

import { Button } from "@/components/ui/button";
import { useDevelopmentNotice } from "@/components/ui/development-modal";
import type { ExperienceContent } from "@/content/experience";

/**
 * "Begin Your Journey" CTA. Uses the header's Book a Consultation
 * destination; the booking page is not built yet, so it opens the
 * development notice instead of a form.
 */
export function JourneyCta({ label, destinationName, href }: ExperienceContent["cta"]) {
  const { openUnavailableNotice } = useDevelopmentNotice();

  return (
    <Button
      variant="primary"
      aria-haspopup="dialog"
      onClick={() => openUnavailableNotice(destinationName, href)}
      className="w-full tablet:w-auto"
    >
      <span>{label}</span>
      <span aria-hidden="true">&rarr;</span>
    </Button>
  );
}
