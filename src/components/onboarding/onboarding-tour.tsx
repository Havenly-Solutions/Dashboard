"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import {
  TOUR_STEPS,
  markTourCompleted,
  markTourDismissed,
  shouldAutoStartTour,
} from "@/lib/onboarding";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function OnboardingTour() {
  const { user } = useAuth();
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  // Auto-start right after first login (see /welcome/set-password), and
  // allow manual restart from Settings via a plain DOM event so this
  // component doesn't need a dedicated global context.
  useEffect(() => {
    if (user && shouldAutoStartTour(user)) {
      setStepIndex(0);
      setActive(true);
    }
    const onManualStart = () => {
      setStepIndex(0);
      setActive(true);
    };
    window.addEventListener("havenly:start-tour", onManualStart);
    return () => window.removeEventListener("havenly:start-tour", onManualStart);
  }, [user]);

  const step = TOUR_STEPS[stepIndex];

  useEffect(() => {
    if (!active || !step?.target) {
      setRect(null);
      return;
    }
    const measure = () => {
      const el = document.querySelector(`[data-tour="${step.target}"]`);
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [active, step]);

  if (!active || !user || !step || typeof document === "undefined") return null;

  const finish = async () => {
    markTourCompleted(user.id);
    setActive(false);
    try {
      await api.post("/auth/complete-onboarding");
    } catch {
      // best-effort
    }
  };
  const skip = async () => {
    markTourDismissed(user.id);
    setActive(false);
    try {
      await api.post("/auth/complete-onboarding");
    } catch {
      // best-effort
    }
  };
  const next = () => {
    if (stepIndex === TOUR_STEPS.length - 1) finish();
    else setStepIndex((i) => i + 1);
  };
  const back = () => setStepIndex((i) => Math.max(0, i - 1));

  const cardStyle = rect ? cardPositionStyle(rect, step.placement) : undefined;

  return createPortal(
    <div className="fixed inset-0 z-[200]">
      {rect ? (
        // Box-shadow spotlight cutout \u2014 a giant shadow spread creates the
        // dimmed backdrop everywhere except this element's bounds.
        <div
          className="pointer-events-none fixed rounded-lg transition-all duration-300"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
            boxShadow: "0 0 0 9999px rgba(11, 12, 14, 0.65)",
            outline: "2px solid rgb(var(--color-secondary))",
            outlineOffset: "2px",
          }}
        />
      ) : (
        <div className="fixed inset-0 bg-[rgba(11,12,14,0.65)]" />
      )}

      <div
        role="dialog"
        aria-modal="true"
        aria-label={step.title}
        className="fixed z-[201] w-[320px] rounded-lg bg-surface-container-lowest p-5 shadow-tile-hover"
        style={cardStyle ?? { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="text-label-caps text-secondary">
            Step {step.step} of {TOUR_STEPS.length}
          </span>
          <button onClick={skip} aria-label="Skip tour" className="text-on-surface-variant hover:text-on-surface">
            <X className="h-4 w-4" />
          </button>
        </div>
        <h3 className="text-headline-md text-on-surface">{step.title}</h3>
        <p className="mt-1.5 text-body-sm text-on-surface-variant">{step.body}</p>

        <div className="mt-5 flex items-center justify-between">
          <button onClick={skip} className="text-label-md font-medium text-on-surface-variant hover:text-on-surface">
            Skip tour
          </button>
          <div className="flex gap-2">
            {stepIndex > 0 && (
              <Button variant="outline" size="sm" onClick={back}>
                Back
              </Button>
            )}
            <Button size="sm" onClick={next}>
              {stepIndex === TOUR_STEPS.length - 1 ? "Finish" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function cardPositionStyle(rect: Rect, placement: "right" | "bottom" | "top" | "center"): React.CSSProperties {
  const margin = 16;
  switch (placement) {
    case "right":
      return { top: Math.max(16, rect.top), left: rect.left + rect.width + margin };
    case "bottom":
      return { top: rect.top + rect.height + margin, left: Math.min(rect.left, window.innerWidth - 340) };
    case "top":
      return { top: Math.max(16, rect.top - 200), left: Math.min(rect.left, window.innerWidth - 340) };
    default:
      return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  }
}
