"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckEmailPage() {
  return (
    <Suspense fallback={null}>
      <CheckEmailContent />
    </Suspense>
  );
}

function CheckEmailContent() {
  const params = useSearchParams();
  const email = params.get("email");
  const type = params.get("type") === "invite" ? "invite" : "reset";

  return (
    <div className="text-center sm:text-left">
      <span className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10 text-secondary sm:mx-0">
        <MailCheck className="h-6 w-6" strokeWidth={1.75} />
      </span>
      <h1 className="text-display-lg text-on-surface">Check your email</h1>
      <p className="mt-1.5 text-body-base text-on-surface-variant">
        {type === "invite" ? (
          <>We&apos;ve sent an invite link{email ? <> to <strong className="text-on-surface">{email}</strong></> : null}. Click it to set your password and join Havenly.</>
        ) : (
          <>We&apos;ve sent a password reset link{email ? <> to <strong className="text-on-surface">{email}</strong></> : null}. It expires in 60 minutes.</>
        )}
      </p>
      <p className="mt-4 text-body-sm text-on-surface-variant">Didn&apos;t get it? Check spam, or wait a minute and try again.</p>
      <Link href="/login" className="mt-8 block">
        <Button variant="outline" className="w-full">
          Back to sign in
        </Button>
      </Link>
    </div>
  );
}
