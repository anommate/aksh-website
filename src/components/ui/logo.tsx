import React from "react";
import Image from "next/image";

interface LogoProps {
  size?: "desktop" | "tablet" | "mobile" | "drawer" | "footer";
  priority?: boolean;
  className?: string;
}

/**
 * Reusable AKSH Wellness Logo Component
 *
 * Sizing strategy:
 * `aksh-wellness-logo.jpeg` (1024x787) contains centered artwork (632x336, 1.88:1 aspect ratio)
 * surrounded by ivory whitespace. This component uses an overflow-hidden wrapper with
 * proportional dimensions, non-destructively displaying the complete artwork
 * (stylised A, AKSH lettering, crescent with red dot, underline rules with red dot, and WELLNESS subtext)
 * at crisp, legible scale with balanced clearance while preserving the original source file.
 */
export function Logo({ size = "desktop", priority = true, className = "" }: LogoProps) {
  // Proportional dimensions for the visible artwork container per breakpoint
  const dimensions = {
    desktop: { width: 102, height: 54, imgWidth: 162, imgHeight: 125 },
    tablet: { width: 82, height: 44, imgWidth: 130, imgHeight: 100 },
    mobile: { width: 74, height: 40, imgWidth: 117, imgHeight: 90 },
    drawer: { width: 76, height: 41, imgWidth: 121, imgHeight: 93 },
    // Footer logo band: the same artwork and crop ratios, scaled up.
    footer: { width: 152, height: 80, imgWidth: 240, imgHeight: 184 },
  }[size];

  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center select-none ${className}`}
      style={{
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
      }}
    >
      <Image
        src="/brand/aksh-wellness-logo.jpeg"
        alt="AKSH Wellness"
        width={dimensions.imgWidth}
        height={dimensions.imgHeight}
        priority={priority}
        className="max-w-none shrink-0 object-cover pointer-events-none"
        style={{
          width: `${dimensions.imgWidth}px`,
          height: `${dimensions.imgHeight}px`,
        }}
      />
    </div>
  );
}
