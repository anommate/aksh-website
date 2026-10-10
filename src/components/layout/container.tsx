import type { ComponentProps } from "react";

// Page container: min(1280px, 100% minus the responsive gutters), centred.
// Gutters come from --container-gutter (20/16px mobile, 32px tablet, 48px desktop).
export function Container({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={className ? `aksh-container ${className}` : "aksh-container"}
    />
  );
}
