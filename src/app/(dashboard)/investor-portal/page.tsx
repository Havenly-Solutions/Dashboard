"use client";

import { TrendingUp, Users, Handshake, ShieldCheck, Sparkles } from "lucide-react";
import { Tile, TileHeader } from "@/components/ui/tile";
import { StatCard } from "@/components/ui/stat-card";
import { TileSkeleton } from "@/components/ui/skeleton";
import { TrendAreaChart } from "@/components/charts/trend-chart";
import { useFinanceSnapshot } from "@/hooks/use-finance";
import { useMarketingSnapshot } from "@/hooks/use-marketing";
import { useAppAnalyticsSnapshot } from "@/hooks/use-app-analytics";
import { usePartners } from "@/hooks/use-partners";
import { useSosEvents } from "@/hooks/use-sos";
import { formatCompactNumber, formatCurrencyZAR, formatDuration } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { GettingStartedChecklist } from "@/components/onboarding/getting-started-checklist";

export default function InvestorPortalPage() {
  const { user } = useAuth();
  const { data: finance, isLoading: financeLoading } = useFinanceSnapshot();
  const { data: marketing } = useMarketingSnapshot();
  const { data: app } = useAppAnalyticsSnapshot();
  const { data: partners } = usePartners();
  const { data: sos } = useSosEvents();

  const resolved = (sos ?? []).filter((e) => e.responseTimeSeconds != null);
  const avgResponse = resolved.length
    ? resolved.reduce((s, e) => s + (e.responseTimeSeconds ?? 0), 0) / resolved.length
    : null;

  return (
    <div>
      {user && (
        <GettingStartedChecklist userId={user.id} tasks={[{ label: "Review growth metrics", done: !!finance, href: "/finance" }]} />
      )}

      <div className="relative mb-6 overflow-hidden rounded-lg bg-primary px-6 py-8 sm:px-10 sm:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(70,72,212,0.4),transparent_45%),radial-gradient(circle_at_85%_80%,rgba(186,26,26,0.25),transparent_45%)]" />
        <div className="relative">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-label-md font-medium text-on-primary">
            <Sparkles className="h-3.5 w-3.5" /> Investor Portal
          </span>
          <h1 className="text-display-lg text-on-primary">Havenly at a glance</h1>
          <p className="mt-1.5 max-w-xl text-body-base text-on-primary/70">
            Read-only view of growth, engagement, and community impact. No operational controls
            live here by design.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-widget-gap sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Monthly Recurring Revenue"
          value={financeLoading ? "\u2014" : formatCurrencyZAR(finance!.mrr)}
          delta={finance?.mrrDelta}
          icon={TrendingUp}
        />
        <StatCard
          label="Active App Users"
          value={app ? formatCompactNumber(app.activeInstalls) : "\u2014"}
          delta={app?.installsDelta}
          icon={Users}
        />
        <StatCard label="Network Partners" value={partners ? String(partners.length) : "\u2014"} icon={Handshake} />
        <StatCard
          label="Avg. Emergency Response"
          value={avgResponse ? formatDuration(avgResponse) : "\u2014"}
          icon={ShieldCheck}
        />
      </div>

      <div className="mt-widget-gap grid grid-cols-1 gap-widget-gap xl:grid-cols-3">
        <Tile className="xl:col-span-2">
          <TileHeader title="Revenue growth" subtitle="Last 6 months" />
          {financeLoading ? (
            <TileSkeleton rows={5} />
          ) : (
            <TrendAreaChart
              data={finance!.trend}
              xKey="label"
              series={[{ key: "revenue", color: "rgb(70 72 212)", label: "Revenue" }]}
            />
          )}
        </Tile>

        <Tile>
          <TileHeader title="Community impact" />
          <ul className="space-y-4">
            <li className="flex justify-between text-body-sm">
              <span className="text-on-surface-variant">Panic activations (30d)</span>
              <span className="font-medium text-on-surface">{app?.panicButtonActivations ?? "\u2014"}</span>
            </li>
            <li className="flex justify-between text-body-sm">
              <span className="text-on-surface-variant">Website visitors (30d)</span>
              <span className="font-medium text-on-surface">
                {marketing ? formatCompactNumber(marketing.visitors) : "\u2014"}
              </span>
            </li>
            <li className="flex justify-between text-body-sm">
              <span className="text-on-surface-variant">Signup conversion</span>
              <span className="font-medium text-on-surface">{marketing ? `${marketing.conversionRate}%` : "\u2014"}</span>
            </li>
            <li className="flex justify-between text-body-sm">
              <span className="text-on-surface-variant">GSM network uptime</span>
              <span className="font-medium text-on-surface">{app ? `${app.gsmUptime}%` : "\u2014"}</span>
            </li>
          </ul>
        </Tile>
      </div>
    </div>
  );
}
