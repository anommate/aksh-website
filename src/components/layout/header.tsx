"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { useDevelopmentNotice } from "@/components/ui/development-modal";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const { openUnavailableNotice } = useDevelopmentNotice();

  const handleNavClick = (e: React.MouseEvent, name: string, path: string) => {
    e.preventDefault();
    openUnavailableNotice(name, path);
  };

  return (
    <>
      <header
        role="banner"
        className="w-full bg-brand-ivory border-b border-warm-stone sticky top-0 z-40 transition-colors"
      >
        <Container>
          {/* =========================================================================
              Desktop Navigation (>= 1024px): 80px height, 3-column grid
              Ensures centered logo is mathematically centered regardless of left/right lengths
              ========================================================================= */}
          <div className="hidden desktop:grid grid-cols-[1fr_auto_1fr] items-center h-80">
            {/* Left Nav Group */}
            <nav
              aria-label="Main navigation left"
              className="flex items-center gap-28 justify-self-start"
            >
              <a
                href="#about-aksh"
                className="inline-flex items-center min-h-44 px-4 font-ui text-nav font-weight-medium text-soft-charcoal hover:text-logo-black transition-colors cursor-pointer"
              >
                About AKSH
              </a>
              <button
                type="button"
                onClick={(e) => handleNavClick(e, "Treatments Directory", "/treatments")}
                className="inline-flex items-center min-h-44 px-4 font-ui text-nav font-weight-medium text-soft-charcoal hover:text-logo-black transition-colors cursor-pointer"
              >
                Treatments
              </button>
              <button
                type="button"
                onClick={(e) => handleNavClick(e, "Our Experience", "/how-it-works")}
                className="inline-flex items-center min-h-44 px-4 font-ui text-nav font-weight-medium text-soft-charcoal hover:text-logo-black transition-colors cursor-pointer"
              >
                Our Experience
              </button>
            </nav>

            {/* Centered Logo Artwork */}
            <div className="justify-self-center px-24 flex items-center justify-center h-full overflow-hidden">
              <Link
                href="/"
                className="inline-flex items-center justify-center p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-logo-black rounded-panel"
                aria-label="AKSH Wellness - Return to home"
              >
                <Logo size="desktop" priority />
              </Link>
            </div>

            {/* Right Nav Group & Primary CTA */}
            <div className="flex items-center gap-24 justify-self-end">
              <button
                type="button"
                onClick={(e) => handleNavClick(e, "AKSH Journal", "/journal")}
                className="inline-flex items-center min-h-44 px-4 font-ui text-nav font-weight-medium text-soft-charcoal hover:text-logo-black transition-colors cursor-pointer"
              >
                Journal
              </button>
              <button
                type="button"
                onClick={(e) => handleNavClick(e, "Contact", "/contact")}
                className="inline-flex items-center min-h-44 px-4 font-ui text-nav font-weight-medium text-soft-charcoal hover:text-logo-black transition-colors cursor-pointer"
              >
                Contact
              </button>
              <Button
                variant="primary"
                onClick={(e) => handleNavClick(e, "Book a Consultation", "/book")}
                className="ml-8"
              >
                Book a Consultation
              </Button>
            </div>
          </div>

          {/* =========================================================================
              Tablet Navigation (768px - 1023px): 64px height, 3-column grid
              Left: Menu Button, Center: Logo, Right: Book CTA
              ========================================================================= */}
          <div className="hidden tablet:grid desktop:hidden grid-cols-[1fr_auto_1fr] items-center h-64">
            {/* Tablet Menu Trigger */}
            <div className="justify-self-start">
              <button
                ref={mobileMenuButtonRef}
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={isMobileMenuOpen}
                className="inline-flex items-center justify-center w-44 h-44 rounded-panel text-soft-charcoal hover:text-logo-black hover:bg-warm-stone/40 transition-colors cursor-pointer"
              >
                <svg
                  className="w-20 h-20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </svg>
              </button>
            </div>

            {/* Centered Logo */}
            <div className="justify-self-center flex items-center justify-center h-full overflow-hidden">
              <Link
                href="/"
                className="inline-flex items-center justify-center p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-logo-black rounded-panel"
                aria-label="AKSH Wellness - Return to home"
              >
                <Logo size="tablet" priority />
              </Link>
            </div>

            {/* Right Tablet CTA */}
            <div className="justify-self-end">
              <Button
                variant="primary"
                onClick={(e) => handleNavClick(e, "Book a Consultation", "/book")}
                className="text-xs px-16 py-10 min-h-44"
              >
                Book a Consultation
              </Button>
            </div>
          </div>

          {/* =========================================================================
              Mobile Navigation (< 768px): 64px height, Flex Layout
              Left: Logo, Right: Menu Button
              ========================================================================= */}
          <div className="flex tablet:hidden items-center justify-between h-64">
            {/* Mobile Logo */}
            <Link
              href="/"
              className="inline-flex items-center justify-center p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-logo-black rounded-panel overflow-hidden"
              aria-label="AKSH Wellness - Return to home"
            >
              <Logo size="mobile" priority />
            </Link>

            {/* Mobile Hamburger Menu Button */}
            <button
              ref={mobileMenuButtonRef}
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={isMobileMenuOpen}
              className="inline-flex items-center justify-center w-44 h-44 rounded-panel text-soft-charcoal hover:text-logo-black hover:bg-warm-stone/40 transition-colors cursor-pointer"
            >
              <svg
                className="w-20 h-20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            </button>
          </div>
        </Container>
      </header>

      {/* Mobile / Tablet Navigation Overlay Drawer */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        triggerRef={mobileMenuButtonRef}
      />
    </>
  );
}
