"use client";

import Link from "next/link";
import { Smartphone, ShieldCheck, Bug, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Tile, TileHeader } from "@/components/ui/tile";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { TileSkeleton } from "@/components/ui/skeleton";
import { GettingStartedChecklist } from "@/components/onboarding/getting-started-checklist";
import { useAuth } from "@/lib/auth-context";
import { useAppAnalyticsSnapshot } from "@/hooks/use-app-analytics";
import { useSecurityCampaigns, useBreachLogs } from "@/hooks/use-security";
import { formatCompactNumber, formatPercent } from "@/lib/utils";

const HEALTH_TONE = { STABLE: "success", DEGRADED: "warning", OFFLINE: "critical" } as const;

export default function DeveloperPortalPage() {
  const { user } = useAuth();
  const { data: app, isLoading: appLoading } = useAppAnalyticsSnapshot();
  const { data: campaigns } = useSecurityCampaigns();
  const { data: breaches, isLoading: breachesLoading } = useBreachLogs();

  const unresolvedBreaches = (breaches ?? []).filter((b) => !b.resolvedAt);

  return (
    <div>
      {user && (
        <GettingStartedChecklist
          userId={user.id}
          tasks={[
            { label: "Review app & system health", done: !!app, href: "/app-analytics" },
            { label: "Check the security suite", done: !!campaigns, href: "/security/campaigns" },
          ]}
        />
      )}

      <PageHeader
        title={`Welcome back${user ? `, ${user.name.split(" ")[0]}` : ""}`}
        description="App health, infrastructure, and security \u2014 the technical side of Havenly."
      />

      <div className="grid grid-cols-1 gap-widget-gap sm:grid-cols-3">
        <StatCard label="Daily Active Users" value={appLoading ? "\u2014" : formatCompactNumber(app!.dau)} delta={app?.dauDelta} icon={Smartphone} />
        <StatCard label="Crash-Free Sessions" value={appLoading ? "\u2014" : formatPercent(app!.crashFreeRate)} icon={ShieldCheck} />
        <StatCard label="Unresolved Security Events" value={breachesLoading ? "\u2014" : String(unresolvedBreaches.length)} icon={Bug} />
      </div>

      <Tile className="mt-widget-gap">
        <TileHeader
          title="Infrastructure health"
          action={
            <Link href="/app-analytics" className="flex items-center gap-1 text-label-md font-medium text-secondary hover:underline">
              Full analytics <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
        {appLoading ? (
          <TileSkeleton rows={4} />
        ) : (
          <ul className="divide-y divide-outline-variant/60">
            {app!.deviceHealth.map((d) => (
              <li key={d.label} className="flex items-center justify-between gap-3 py-2.5">
                <div>
                  <p className="text-body-sm font-medium text-on-surface">{d.label}</p>
                  <p className="text-body-sm text-on-surface-variant">{d.detail}</p>
                </div>
                <Badge tone={HEALTH_TONE[d.status]} dot>
                  {d.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Tile>
    </div>
  );
}
