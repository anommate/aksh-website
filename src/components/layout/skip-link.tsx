type SkipLinkProps = {
  targetId: string;
};

// First focusable element on every page. Hidden until focused, then shown as
// a primary-style control aligned with the container's start edge (the
// gutter, or the centring margin once the 1280px maximum applies).
export function SkipLink({ targetId }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:fixed focus:top-16 focus:left-[max(var(--container-gutter),(100%_-_var(--container-max))/2)] focus:z-50 focus:inline-flex focus:items-center focus:min-h-(--control-min-height) focus:px-(--button-padding-inline) focus:py-(--button-padding-block) focus:rounded-button focus:bg-logo-black focus:text-brand-ivory focus:font-ui focus:text-button hover:bg-soft-charcoal"
    >
      Skip to main content
    </a>
  );
}
