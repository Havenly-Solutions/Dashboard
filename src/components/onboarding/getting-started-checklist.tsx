"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChecklistTask {
  label: string;
  done: boolean;
  href?: string;
}

const dismissedKey = (userId: string) => `havenly-checklist-dismissed:${userId}`;

export function GettingStartedChecklist({ userId, tasks }: { userId: string; tasks: ChecklistTask[] }) {
  const [dismissed, setDismissed] = useState(true); // default hidden until we know localStorage state, avoids a flash

  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem(dismissedKey(userId)) === "1");
    } catch {
      setDismissed(false);
    }
  }, [userId]);

  const doneCount = tasks.filter((t) => t.done).length;
  const allDone = doneCount === tasks.length;

  if (dismissed || tasks.length === 0) return null;

  const dismiss = () => {
    try {
      window.localStorage.setItem(dismissedKey(userId), "1");
    } catch {
      // ignore
    }
    setDismissed(true);
  };

  return (
    <div className="tile mb-widget-gap flex flex-col gap-4 p-container-padding sm:flex-row sm:items-center">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary">
        <Sparkles className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-headline-md text-on-surface">Getting started</h3>
          <button onClick={dismiss} aria-label="Dismiss" className="text-on-surface-variant hover:text-on-surface">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-1 mb-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
          <div
            className={cn("h-full rounded-full transition-all", allDone ? "bg-success" : "bg-secondary")}
            style={{ width: `${tasks.length ? (doneCount / tasks.length) * 100 : 0}%` }}
          />
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {tasks.map((t) => {
            const content = (
              <span className={cn("flex items-center gap-1.5 text-body-sm", t.done ? "text-on-surface-variant line-through" : "text-on-surface")}>
                {t.done ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Circle className="h-4 w-4 text-on-surface-variant" />}
                {t.label}
              </span>
            );
            return <li key={t.label}>{t.href && !t.done ? <Link href={t.href}>{content}</Link> : content}</li>;
          })}
        </ul>
      </div>
    </div>
  );
}
