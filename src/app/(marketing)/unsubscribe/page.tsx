"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    // We'll let the user choose a reason or click a button instead of auto-unsubscribing
  }, [email]);

  const handleUnsubscribe = async (reason?: string) => {
    if (!email) return;
    setStatus("loading");
    try {
      await api.post("/marketing/unsubscribe", { email, reason, source: "email_link" });
      setStatus("success");
    } catch (err) {
      console.error("Unsubscribe error:", err);
      setStatus("error");
    }
  };

  const reasons = [
    "I receive too many emails",
    "The content is not relevant to me",
    "I never signed up for this list",
    "Other"
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-container-lowest p-6 text-center">
      <div className="mb-8">
        <Image src="/havenly-logo.png" alt="Havenly Solutions" width={48} height={48} className="rounded-lg" />
      </div>

      <div className="max-w-md w-full rounded-2xl border border-outline-variant bg-surface-container-low p-8 shadow-tile">
        {status === "idle" && email && (
          <div className="flex flex-col items-center gap-6">
            <h1 className="text-display-sm font-bold text-on-surface">Unsubscribe</h1>
            <p className="text-body-base text-on-surface-variant">
              Are you sure you want to unsubscribe <span className="font-semibold text-on-surface">{email}</span> from Havenly Solutions marketing emails?
            </p>

            <div className="w-full space-y-2 text-left">
              <p className="text-label-sm font-medium text-on-surface-variant uppercase tracking-wider">Please tell us why:</p>
              {reasons.map((r) => (
                <button
                  key={r}
                  onClick={() => handleUnsubscribe(r)}
                  className="w-full rounded-lg border border-outline px-4 py-3 text-left text-body-sm text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  {r}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleUnsubscribe()}
              className="mt-2 text-label-md text-on-surface-variant hover:text-on-surface underline"
            >
              Just unsubscribe me
            </button>
          </div>
        )}

        {status === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-secondary" />
            <h1 className="text-display-sm font-bold text-on-surface">Unsubscribing...</h1>
            <p className="text-body-base text-on-surface-variant">Please wait while we update your preferences for {email}.</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle2 className="h-12 w-12 text-success" />
            <h1 className="text-display-sm font-bold text-on-surface">Unsubscribed</h1>
            <p className="text-body-base text-on-surface-variant">
              You have been successfully removed from our mailing list. You will no longer receive marketing emails at <span className="font-semibold">{email}</span>.
            </p>
            <a href="/" className="mt-4 text-label-lg font-medium text-secondary hover:underline">Return to home</a>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4">
            <XCircle className="h-12 w-12 text-critical" />
            <h1 className="text-display-sm font-bold text-on-surface">Something went wrong</h1>
            <p className="text-body-base text-on-surface-variant">
              We couldn't process your unsubscribe request automatically.
            </p>
            <button onClick={() => handleUnsubscribe()} className="mt-4 rounded-full bg-secondary px-6 py-2.5 text-label-lg font-medium text-on-secondary hover:bg-secondary/90">
              Try again
            </button>
          </div>
        )}

        {status === "idle" && !email && (
          <div className="flex flex-col items-center gap-4">
            <XCircle className="h-12 w-12 text-warning" />
            <h1 className="text-display-sm font-bold text-on-surface">Invalid Link</h1>
            <p className="text-body-base text-on-surface-variant">
              This unsubscribe link appears to be invalid or incomplete.
            </p>
            <a href="/" className="mt-4 text-label-lg font-medium text-secondary hover:underline">Return to home</a>
          </div>
        )}
      </div>

      <p className="mt-8 text-label-md text-on-surface-variant">
        &copy; 2026 Havenly Solutions. All rights reserved.
      </p>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-surface-container-lowest"><Loader2 className="h-10 w-10 animate-spin text-secondary" /></div>}>
      <UnsubscribeContent />
    </Suspense>
  );
}
