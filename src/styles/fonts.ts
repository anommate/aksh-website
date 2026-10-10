import { Cormorant_Garamond, Manrope } from "next/font/google";

// next/font downloads these at build time and serves them from this site, so
// the browser never contacts a font host. Weights are the ones the design
// specification requires; the fallback stacks live in src/styles/tokens.css.

export const cormorantGaramond = Cormorant_Garamond({
  weight: ["500", "600"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cormorant-garamond",
});

export const manrope = Manrope({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});
