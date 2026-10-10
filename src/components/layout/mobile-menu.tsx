"use client";

import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { useDevelopmentNotice } from "@/components/ui/development-modal";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

export function MobileMenu({ isOpen, onClose, triggerRef }: MobileMenuProps) {
  const { openUnavailableNotice } = useDevelopmentNotice();
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const activeTriggerRef = useRef<HTMLElement | null>(null);

  // Focus return when closed
  const handleClose = React.useCallback(() => {
    onClose();
    setTimeout(() => {
      const target = triggerRef?.current || activeTriggerRef.current;
      if (target && typeof target.focus === "function") {
        target.focus();
      }
    }, 10);
  }, [onClose, triggerRef]);

  // Focus containment, Escape key handling, and background scroll locking
  useEffect(() => {
    if (!isOpen) return;

    // Save current active element as trigger
    activeTriggerRef.current = (triggerRef?.current || document.activeElement) as HTMLElement | null;

    // Lock scroll on background
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Move focus to close button when opened
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
        return;
      }

      // Focus trap within drawer
      if (e.key === "Tab" && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleClose, triggerRef]);

  const handleNavClick = (name: string, path: string) => {
    onClose();
    openUnavailableNotice(name, path);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-logo-black/50 backdrop-blur-xs transition-opacity"
      onClick={handleClose}
      aria-hidden={!isOpen}
    >
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
        className="w-full max-w-[360px] h-full bg-brand-ivory text-soft-charcoal flex flex-col shadow-2xl overflow-y-auto shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between h-64 px-20 border-b border-warm-stone shrink-0">
          <div className="flex items-center">
            <Logo size="drawer" priority />
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={handleClose}
            aria-label="Close navigation menu"
            className="inline-flex items-center justify-center w-44 h-44 rounded-panel text-soft-charcoal hover:text-logo-black hover:bg-warm-stone/50 transition-colors focus-visible:outline-none cursor-pointer"
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Drawer Body / Navigation Links */}
        <nav
          aria-label="Mobile Navigation"
          className="flex-1 px-20 py-24 flex flex-col justify-between"
        >
          <div className="space-y-8">
            <a
              href="#about-aksh"
              onClick={handleClose}
              className="w-full flex items-center min-h-52 px-12 py-12 rounded-panel font-ui text-nav font-weight-medium text-soft-charcoal hover:text-logo-black hover:bg-warm-stone/40 transition-colors text-left cursor-pointer"
            >
              About AKSH
            </a>

            <div className="pt-4 pb-4">
              <button
                type="button"
                onClick={() => handleNavClick("Treatments Directory", "/treatments")}
                className="w-full flex items-center justify-between min-h-52 px-12 py-12 rounded-panel font-ui text-nav font-weight-medium text-soft-charcoal hover:text-logo-black hover:bg-warm-stone/40 transition-colors text-left cursor-pointer"
              >
                <span>Treatments</span>
                <span className="font-ui text-eyebrow text-muted-text font-weight-semibold uppercase tracking-eyebrow">
                  4 Pillars
                </span>
              </button>

              <div className="pl-24 pr-12 py-4 space-y-4 border-l border-warm-stone ml-16 mt-4">
                <button
                  type="button"
                  onClick={() =>
                    handleNavClick("Biohacking Treatments", "/treatments/biohacking")
                  }
                  className="w-full flex items-center min-h-44 px-8 py-8 rounded-panel text-body-small text-muted-text hover:text-logo-black hover:bg-warm-stone/30 transition-colors text-left cursor-pointer"
                >
                  Biohacking
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleNavClick("Recovery Treatments", "/treatments/recovery")
                  }
                  className="w-full flex items-center min-h-44 px-8 py-8 rounded-panel text-body-small text-muted-text hover:text-logo-black hover:bg-warm-stone/30 transition-colors text-left cursor-pointer"
                >
                  Recovery
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleNavClick("Body Contouring Treatments", "/treatments/body-contouring")
                  }
                  className="w-full flex items-center min-h-44 px-8 py-8 rounded-panel text-body-small text-muted-text hover:text-logo-black hover:bg-warm-stone/30 transition-colors text-left cursor-pointer"
                >
                  Body Contouring
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleNavClick("Skin Treatments", "/treatments/skin")
                  }
                  className="w-full flex items-center min-h-44 px-8 py-8 rounded-panel text-body-small text-muted-text hover:text-logo-black hover:bg-warm-stone/30 transition-colors text-left cursor-pointer"
                >
                  Skin Treatments
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleNavClick("Our Experience", "/how-it-works")}
              className="w-full flex items-center min-h-52 px-12 py-12 rounded-panel font-ui text-nav font-weight-medium text-soft-charcoal hover:text-logo-black hover:bg-warm-stone/40 transition-colors text-left cursor-pointer"
            >
              Our Experience
            </button>

            <button
              type="button"
              onClick={() => handleNavClick("AKSH Journal", "/journal")}
              className="w-full flex items-center min-h-52 px-12 py-12 rounded-panel font-ui text-nav font-weight-medium text-soft-charcoal hover:text-logo-black hover:bg-warm-stone/40 transition-colors text-left cursor-pointer"
            >
              Journal
            </button>

            <button
              type="button"
              onClick={() => handleNavClick("Contact", "/contact")}
              className="w-full flex items-center min-h-52 px-12 py-12 rounded-panel font-ui text-nav font-weight-medium text-soft-charcoal hover:text-logo-black hover:bg-warm-stone/40 transition-colors text-left cursor-pointer"
            >
              Contact
            </button>
          </div>

          {/* Drawer Footer CTA */}
          <div className="pt-24 mt-24 border-t border-warm-stone">
            <Button
              variant="primary"
              className="w-full min-h-52 justify-center"
              onClick={() => handleNavClick("Book a Consultation", "/book")}
            >
              Book a Consultation
            </Button>
          </div>
        </nav>
      </div>
    </div>
  );
}
