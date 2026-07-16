"use client";

import React, { createContext, useCallback, useContext, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "error" | "info";
interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

const ToastContext = createContext<{ push: (message: string, tone?: ToastTone) => void } | null>(null);

let idCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback((message: string, tone: ToastTone = "success") => {
    const id = ++idCounter;
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);

  const dismiss = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  const icons: Record<ToastTone, React.ReactNode> = {
    success: <CheckCircle2 className="h-4 w-4 text-success" />,
    error: <AlertTriangle className="h-4 w-4 text-critical" />,
    info: <Info className="h-4 w-4 text-info" />,
  };

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} icons={icons} />
    </ToastContext.Provider>
  );
}

function ToastContainer({
  toasts,
  dismiss,
  icons,
}: {
  toasts: ToastItem[];
  dismiss: (id: number) => void;
  icons: Record<ToastTone, React.ReactNode>;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed bottom-4 right-4 z-[100] flex w-80 flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex items-start gap-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest p-3.5 shadow-tile-hover"
          )}
        >
          {icons[t.tone]}
          <p className="flex-1 text-body-sm text-on-surface">{t.message}</p>
          <button onClick={() => dismiss(t.id)} className="text-on-surface-variant hover:text-on-surface">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
