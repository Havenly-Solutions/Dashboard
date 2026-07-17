"use client";

import { Users, Download, ShieldCheck, Siren, Wifi, Satellite } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Tile, TileHeader } from "@/components/ui/tile";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { TileSkeleton } from "@/components/ui/skeleton";
import { TrendLineChart } from "@/components/charts/trend-chart";
import { useAppAnalyticsSnapshot } from "@/hooks/use-app-analytics";
import { formatCompactNumber, formatNumber, formatPercent } from "@/lib/utils";

const HEALTH_TONE = {
  STABLE: "success",
  DEGRADED: "warning",
  OFFLINE: "critical",
} as const;

export default function AppAnalyticsPage() {
  const { data, isLoading } = useAppAnalyticsSnapshot();

  return (
    <div>
      <PageHeader
        title="App & System Analytics"
        description={`Mobile app usage and infrastructure health \u2014 ${data?.rangeLabel ?? "last 30 days"}`}
      />

      <div className="grid grid-cols-1 gap-widget-gap sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Daily Active Users" value={isLoading ? "\u2014" : formatCompactNumber(data!.dau)} delta={data?.dauDelta} icon={Users} />
        <StatCard label="Active Installs" value={isLoading ? "\u2014" : formatCompactNumber(data!.activeInstalls)} delta={data?.installsDelta} icon={Download} />
        <StatCard label="Crash-Free Sessions" value={isLoading ? "\u2014" : formatPercent(data!.crashFreeRate)} icon={ShieldCheck} />
        <StatCard label="Panic Button Activations (30d)" value={isLoading ? "\u2014" : formatNumber(data!.panicButtonActivations)} icon={Siren} />
      </div>

      <div className="mt-widget-gap grid grid-cols-1 gap-widget-gap xl:grid-cols-3">
        <Tile className="xl:col-span-2">
          <TileHeader title="Engagement trend" subtitle="Daily active users & cumulative installs" />
          {isLoading || !data?.trend ? (
            <TileSkeleton rows={5} />
          ) : (
            <TrendLineChart
              data={data.trend}
              xKey="label"
              series={[
                { key: "dau", color: "rgb(70 72 212)", label: "DAU" },
                { key: "installs", color: "rgb(22 163 74)", label: "Installs" },
              ]}
            />
          )}
        </Tile>

        <Tile>
          <TileHeader title="Platform split" />
          {isLoading || !data?.platformSplit ? (
            <TileSkeleton rows={3} />
          ) : (
            <>
              <ul className="space-y-4">
                {data.platformSplit.map((p) => (
                  <li key={p.platform}>
                    <div className="mb-1 flex items-center justify-between text-body-sm">
                      <span className="text-on-surface">{p.platform}</span>
                      <span className="text-on-surface-variant">{p.share}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
                      <div className="h-full rounded-full bg-secondary" style={{ width: `${p.share}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-6 space-y-3 border-t border-outline-variant pt-4">
                <div className="flex items-center justify-between text-body-sm">
                  <span className="flex items-center gap-2 text-on-surface-variant"><Wifi className="h-4 w-4" /> GSM uptime</span>
                  <span className="font-medium text-on-surface">{formatPercent(data!.gsmUptime)}</span>
                </div>
                <div className="flex items-center justify-between text-body-sm">
                  <span className="flex items-center gap-2 text-on-surface-variant"><Satellite className="h-4 w-4" /> Satellite uptime</span>
                  <span className="font-medium text-on-surface">{formatPercent(data!.satelliteUptime)}</span>
                </div>
              </div>
            </>
          )}
        </Tile>
      </div>

      <Tile className="mt-widget-gap">
        <TileHeader title="Device & infrastructure health" subtitle="Fleet status across the safety network" />
        {isLoading || !data?.deviceHealth ? (
          <TileSkeleton rows={4} />
        ) : (
          <ul className="divide-y divide-outline-variant/60">
            {data.deviceHealth.map((d) => (
              <li key={d.label} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-body-base font-medium text-on-surface">{d.label}</p>
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
