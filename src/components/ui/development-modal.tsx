"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/button";

interface DevelopmentModalContextType {
  openUnavailableNotice: (destinationName: string, path?: string) => void;
  closeModal: () => void;
}

const DevelopmentModalContext = createContext<DevelopmentModalContextType | null>(null);

export function useDevelopmentNotice() {
  const context = useContext(DevelopmentModalContext);
  if (!context) {
    throw new Error("useDevelopmentNotice must be used within DevelopmentNoticeProvider");
  }
  return context;
}

interface DevelopmentNoticeProviderProps {
  children: ReactNode;
}

export function DevelopmentNoticeProvider({ children }: DevelopmentNoticeProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [destination, setDestination] = useState({ name: "", path: "" });
  const triggerRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const openUnavailableNotice = useCallback((destinationName: string, path?: string) => {
    triggerRef.current = document.activeElement as HTMLElement | null;
    setDestination({ name: destinationName, path: path || "" });
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    // Return focus to trigger element
    if (triggerRef.current && typeof triggerRef.current.focus === "function") {
      triggerRef.current.focus();
    }
  }, []);

  // Handle Escape key and focus trap
  useEffect(() => {
    if (!isOpen) return;

    // Prevent body scrolling
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus close button on mount
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeModal();
        return;
      }

      // Focus trap
      if (e.key === "Tab" && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
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
  }, [isOpen, closeModal]);

  return (
    <DevelopmentModalContext.Provider value={{ openUnavailableNotice, closeModal }}>
      {children}

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-20 bg-logo-black/50 backdrop-blur-xs"
          onClick={closeModal}
          aria-hidden={!isOpen}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Development Preview: ${destination.name || "Destination Unavailable"}`}
            aria-describedby="dev-modal-desc"
            className="relative w-full max-w-[520px] bg-brand-ivory text-soft-charcoal rounded-card border border-warm-stone p-28 tablet:p-32 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Badge */}
            <div className="flex items-center gap-8 mb-16">
              <span
                className="size-(--signal-dot-size) rounded-circle bg-signal-red inline-block shrink-0"
                aria-hidden="true"
              />
              <span className="font-ui text-eyebrow font-weight-semibold uppercase tracking-eyebrow text-muted-text">
                Development Preview
              </span>
            </div>

            {/* Title */}
            <h2
              id="dev-modal-title"
              className="font-display text-card-heading font-weight-semibold text-logo-black mb-12"
            >
              {destination.name || "Destination Unavailable"}
            </h2>

            {/* Description */}
            <div id="dev-modal-desc" className="font-body text-body-small text-soft-charcoal space-y-12 mb-28">
              <p>This destination is still in development and is not available yet.</p>
              {destination.path && (
                <p className="font-mono text-xs bg-warm-stone/50 px-12 py-8 rounded-panel border border-warm-stone">
                  Route destination: <span className="font-bold">{destination.path}</span>
                </p>
              )}
              <div className="p-12 rounded-panel bg-warm-stone/30 border border-warm-stone text-xs text-soft-charcoal">
                <span className="font-semibold">Note on appointments:</span> No appointment has been
                confirmed or scheduled.
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-12">
              <Button
                ref={closeButtonRef}
                variant="primary"
                onClick={closeModal}
                className="w-full tablet:w-auto"
              >
                Understood
              </Button>
            </div>
          </div>
        </div>
      )}
    </DevelopmentModalContext.Provider>
  );
}
