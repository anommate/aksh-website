import React, {
  forwardRef,
  type ButtonHTMLAttributes,
  type AnchorHTMLAttributes,
} from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "inverse-primary"
  | "inverse-secondary";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  href?: string;
  asAnchor?: boolean;
}

export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps & AnchorHTMLAttributes<HTMLAnchorElement>
>(function Button(
  {
    variant = "primary",
    href,
    asAnchor,
    className = "",
    children,
    ...props
  },
  ref
) {
  // Base button styles per AKSH_DESIGN.md:
  // - Minimum height 52px (--control-min-height)
  // - Pill radius (--radius-button: 9999px)
  // - Manrope Semibold 14/20px desktop/tablet, 16/24px mobile (--text-button)
  // - Inset padding: 15px 24px desktop/tablet, 13px 24px mobile
  // - 1px border included in border-box
  // - 44px minimum touch target
  const baseClasses =
    "inline-flex items-center justify-center gap-8 min-h-(--control-min-height) px-(--button-padding-inline) py-(--button-padding-block) rounded-button font-ui text-button font-weight-semibold text-center transition-colors duration-standard ease-standard focus-visible:outline-none cursor-pointer disabled:cursor-not-allowed disabled:bg-warm-stone disabled:text-muted-text disabled:border-transparent select-none";

  let variantClasses = "";
  switch (variant) {
    case "primary":
      // Black fill / ivory label, hover charcoal fill
      variantClasses =
        "bg-logo-black text-brand-ivory border border-logo-black hover:bg-soft-charcoal hover:border-soft-charcoal active:bg-logo-black";
      break;
    case "secondary":
      // Transparent fill / charcoal outline / charcoal label, hover subtle tint
      variantClasses =
        "bg-transparent text-soft-charcoal border border-soft-charcoal hover:bg-soft-charcoal/10 active:bg-soft-charcoal/20";
      break;
    case "inverse-primary":
      // On dark surfaces: Ivory fill / black label, hover warm stone fill
      variantClasses =
        "bg-brand-ivory text-logo-black border border-brand-ivory hover:bg-warm-stone hover:border-warm-stone active:bg-brand-ivory";
      break;
    case "inverse-secondary":
      // On dark surfaces: Transparent fill / ivory outline / ivory label, hover translucent fill
      variantClasses =
        "bg-transparent text-brand-ivory border border-brand-ivory/60 hover:border-brand-ivory hover:bg-brand-ivory/10 active:bg-brand-ivory/20";
      break;
  }

  const combinedClasses = `${baseClasses} ${variantClasses} ${className}`.trim();

  if (asAnchor || href) {
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href || "#"}
        className={combinedClasses}
        {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={props.type || "button"}
      className={combinedClasses}
      {...props}
    >
      {children}
    </button>
  );
});
