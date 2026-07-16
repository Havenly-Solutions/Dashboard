"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Tile } from "@/components/ui/tile";
import { Badge } from "@/components/ui/badge";
import { NavIcon } from "@/components/icons/nav-icon";
import { useAuth } from "@/lib/auth-context";
import { PORTALS, landingPathForRole } from "@/lib/rbac";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

export default function PortalSwitcherPage() {
  const { user, realUser, switchRole, exitSimulation } = useAuth();
  const router = useRouter();
  const [switching, setSwitching] = useState<Role | null>(null);

  const currentRole = user?.role;

  const enter = async (role: Role) => {
    setSwitching(role);
    try {
      if (role === "FOUNDER") {
        if (realUser) exitSimulation();
        router.push(landingPathForRole("FOUNDER"));
        return;
      }
      const simulatedUser = await switchRole(role);
      router.push(landingPathForRole(simulatedUser.role));
    } finally {
      setSwitching(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Switch Portal"
        description="Preview Havenly exactly as each role sees it \u2014 its own exclusive home, its own default access. You'll stay signed in as Founder underneath; use Exit preview to come back."
      />

      <div className="grid grid-cols-1 gap-widget-gap sm:grid-cols-2 xl:grid-cols-3">
        {PORTALS.map((portal) => {
          const isCurrent = currentRole === portal.role;
          return (
            <Tile key={portal.role} className={cn("flex flex-col", isCurrent && "ring-2 ring-secondary")}>
              <div className="flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                  <NavIcon name="dashboard" className="h-5 w-5" />
                </span>
                {isCurrent && <Badge tone="secondary">Current view</Badge>}
              </div>
              <h3 className="mt-4 text-headline-md text-on-surface">{portal.name}</h3>
              <p className="mt-1 flex-1 text-body-sm text-on-surface-variant">{portal.tagline}</p>
              <button
                onClick={() => enter(portal.role)}
                disabled={isCurrent || switching !== null}
                className={cn(
                  "mt-5 flex items-center justify-center gap-1.5 rounded border border-outline-variant py-2.5 text-body-sm font-medium transition-colors",
                  isCurrent ? "cursor-default text-on-surface-variant" : "text-on-surface hover:bg-surface-container-low"
                )}
              >
                {switching === portal.role ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isCurrent ? (
                  "You're here"
                ) : (
                  <>
                    Enter portal <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </Tile>
          );
        })}
      </div>
    </div>
  );
}
