import type { Metadata } from "next";
import { SkipLink } from "@/components/layout/skip-link";
import { Header } from "@/components/layout/header";
import { DevelopmentNoticeProvider } from "@/components/ui/development-modal";
import { cormorantGaramond, manrope } from "@/styles/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "AKSH — Wellness, Reimagined Around You",
  description:
    "Explore biohacking, recovery, body contouring and skin treatments at AKSH. A considered approach to your wellbeing.",
};

const MAIN_CONTENT_ID = "main-content";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cormorantGaramond.variable} ${manrope.variable}`}
    >
      <body className="min-h-screen bg-brand-ivory text-soft-charcoal flex flex-col antialiased">
        <DevelopmentNoticeProvider>
          <SkipLink targetId={MAIN_CONTENT_ID} />
          <Header />
          <main id={MAIN_CONTENT_ID} tabIndex={-1} data-focus-target className="flex-1">
            {children}
          </main>
        </DevelopmentNoticeProvider>
      </body>
    </html>
  );
}
