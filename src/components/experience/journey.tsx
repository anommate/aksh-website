import type { JourneyStep } from "@/content/experience";
import { JourneyIllustration } from "@/components/experience/journey-illustration";

/**
 * The five journey steps as one ordered list. Below the wide breakpoint they
 * form a vertical timeline; at wide widths five cards share one row under a
 * horizontal rail. The rail and its red milestone dots are drawn in
 * globals.css ([data-journey]) and are decorative.
 */
export function Journey({ steps, className }: { steps: readonly JourneyStep[]; className?: string }) {
  return (
    <ol data-journey className={className}>
      {steps.map((step) => (
        <JourneyStepItem key={step.number} step={step} />
      ))}
    </ol>
  );
}

/**
 * One step card: number, illustration, H3 title and description. Stacked on
 * mobile, illustration beside the text on tablet and narrower desktops. In the
 * compact five-card row at wide widths the 72px illustration shares the top
 * row with the number, and the title and description run full width below.
 */
export function JourneyStepItem({ step }: { step: JourneyStep }) {
  return (
    <li data-journey-step>
      <span
        data-journey-dot
        aria-hidden="true"
        className="size-(--signal-dot-size) rounded-circle bg-signal-red shrink-0"
      />
      <div className="relative h-full p-(--card-padding) bg-brand-ivory border border-warm-stone rounded-card tablet:grid tablet:grid-cols-[auto_1fr] tablet:grid-rows-[auto_auto_1fr] tablet:gap-x-24 wide:p-16 wide:gap-x-12">
        <p
          aria-hidden="true"
          className="font-ui text-label text-muted-text tabular-nums tablet:col-start-2 tablet:row-start-1 wide:justify-self-end"
        >
          {step.number}
        </p>
        <JourneyIllustration
          animation={step.illustration.animation}
          poster={step.illustration.poster}
          className="mt-16 size-80 tablet:mt-0 tablet:size-96 tablet:col-start-1 tablet:row-start-1 tablet:row-span-3 wide:size-72 wide:row-span-1"
        />
        <h3 className="mt-16 font-display text-card-heading text-logo-black tablet:mt-8 tablet:col-start-2 tablet:row-start-2 wide:mt-12 wide:col-start-1 wide:col-span-2">
          {step.title}
        </h3>
        <p className="mt-(--space-card-heading-description) font-body text-body text-soft-charcoal max-w-(--measure-prose) tablet:col-start-2 tablet:row-start-3 wide:mt-8 wide:col-start-1 wide:col-span-2 wide:text-body-small">
          {step.description}
        </p>
      </div>
    </li>
  );
}
