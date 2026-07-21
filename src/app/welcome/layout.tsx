"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function WelcomeLayout({ children }: { children: React.ReactNode }) {
  const { user, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  if (status === "loading" || !user) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5">
            <Image src="/havenly-logo.png" alt="Havenly Solutions" width={36} height={36} className="rounded" />
            <span className="text-headline-md font-semibold text-on-surface">Havenly Solutions</span>
          </div>
          {children}
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-primary lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(70,72,212,0.35),transparent_45%),radial-gradient(circle_at_80%_75%,rgba(186,26,26,0.25),transparent_45%)]" />
        <div className="relative flex h-full flex-col justify-end p-14">
          <p className="text-display-lg text-on-primary">Welcome to Havenly, {user.name.split(" ")[0]}.</p>
          <p className="mt-3 max-w-md text-body-base text-on-primary/70">
            Two quick steps and you&apos;re in {"\u2014"} secure your account, then we&apos;ll show you around.
          </p>
        </div>
      </div>
    </div>
  );
}
