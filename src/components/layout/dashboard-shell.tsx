"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useAuth } from "@/lib/auth-context";
import { landingPathForRole, moduleKeyForPath, ROLE_LABELS } from "@/lib/rbac";
import { useCanAccessModule } from "@/hooks/use-access-control";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import { useRealtimeSync } from "@/hooks/use-realtime-sync";
import { OnboardingTour } from "@/components/onboarding/onboarding-tour";
import { Loader2, Eye } from "lucide-react";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, status, getAccessToken, isSimulating, realUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  useRealtimeSync();
  const allowed = useCanAccessModule(moduleKeyForPath(pathname));

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [status, router, pathname]);

  useEffect(() => {
    if (user?.mustChangePassword) {
      router.replace("/welcome/set-password");
    }
  }, [user, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    connectSocket(getAccessToken());
    return () => disconnectSocket();
  }, [status, getAccessToken]);

  if (status === "loading") {
    return (
      <div className="flex h-dvh items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-secondary" />
      </div>
    );
  }

  if (status === "unauthenticated" || !user) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-secondary" />
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-3 bg-background px-6 text-center">
        <p className="text-headline-md text-on-surface">You don&apos;t have access to this module.</p>
        <p className="text-body-base text-on-surface-variant">
          Your role ({user.role}) doesn&apos;t include this section. Ask your Founder to grant it in the
          Access Control Matrix if you need it. Redirecting you somewhere you can see{"\u2026"}
        </p>
        <RedirectHome />
      </div>
    );
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        {isSimulating && realUser && (
          <div className="flex items-center justify-center gap-2 bg-warning/15 px-4 py-1.5 text-label-md font-medium text-warning">
            <Eye className="h-3.5 w-3.5" />
            Founder preview mode {"\u2014"} viewing Havenly as {ROLE_LABELS[user.role]}. Nothing you do here affects real data
            differently than that role would.
          </div>
        )}
        <Topbar />
        <main data-tour="main-content" className="scroll-thin flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1400px]">{children}</div>
        </main>
      </div>
      <OnboardingTour />
    </div>
  );
}

function RedirectHome() {
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (user) router.replace(landingPathForRole(user.role));
  }, [user, router]);
  return null;
}
