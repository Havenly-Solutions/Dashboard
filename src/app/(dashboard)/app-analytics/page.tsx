"use client";

import { useEffect, useState, useMemo } from "react";
import { Users, Download, ShieldCheck, Siren, Wifi, Satellite } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Tile, TileHeader } from "@/components/ui/tile";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { TileSkeleton } from "@/components/ui/skeleton";
import { TrendLineChart } from "@/components/charts/trend-chart";
import { useAppAnalyticsSnapshot } from "@/hooks/use-app-analytics";
import { formatCompactNumber, formatNumber, formatPercent } from "@/lib/utils";
import type { AppAnalyticsSnapshot } from "@/types";

const HEALTH_TONE = {
  STABLE: "success",
  DEGRADED: "warning",
  OFFLINE: "critical",
} as const;

const DEFAULT_SNAPSHOT: AppAnalyticsSnapshot = {
  dau: 0,
  dauDelta: 0,
  activeInstalls: 0,
  installsDelta: 0,
  crashFreeRate: 0,
  panicButtonActivations: 0,
  rangeLabel: "Loading...",
  trend: [],
  platformSplit: [],
  gsmUptime: 0,
  satelliteUptime: 0,
  deviceHealth: [],
  mau: 0,
  wau: 0,
  avgSessionMinutes: 0,
};

export default function AppAnalyticsPage() {
  const { data, isLoading } = useAppAnalyticsSnapshot();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use useMemo to ensure snapshot is always a valid object and avoids re-computation crashes
  const snapshot = useMemo(() => data ?? DEFAULT_SNAPSHOT, [data]);

  if (!mounted) return null;

  return (
    <div>
      <PageHeader
        title="App & System Analytics"
        description={`Mobile app usage and infrastructure health — ${snapshot.rangeLabel}`}
      />

      <div className="grid grid-cols-1 gap-widget-gap sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Daily Active Users" value={isLoading ? "—" : formatCompactNumber(snapshot.dau)} delta={snapshot.dauDelta} icon={Users} />
        <StatCard label="Active Installs" value={isLoading ? "—" : formatCompactNumber(snapshot.activeInstalls)} delta={snapshot.installsDelta} icon={Download} />
        <StatCard label="Crash-Free Sessions" value={isLoading ? "—" : formatPercent(snapshot.crashFreeRate)} icon={ShieldCheck} />
        <StatCard label="Panic Button Activations (30d)" value={isLoading ? "—" : formatNumber(snapshot.panicButtonActivations)} icon={Siren} />
      </div>

      <div className="mt-widget-gap grid grid-cols-1 gap-widget-gap xl:grid-cols-3">
        <Tile className="xl:col-span-2">
          <TileHeader title="Engagement trend" subtitle="Daily active users & cumulative installs" />
          {isLoading ? (
            <TileSkeleton rows={5} />
          ) : (
            <TrendLineChart
              data={snapshot.trend}
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
          {isLoading ? (
            <TileSkeleton rows={3} />
          ) : (
            <>
              <ul className="space-y-4">
                {snapshot.platformSplit.map((p) => (
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
                  <span className="font-medium text-on-surface">{formatPercent(snapshot.gsmUptime)}</span>
                </div>
                <div className="flex items-center justify-between text-body-sm">
                  <span className="flex items-center gap-2 text-on-surface-variant"><Satellite className="h-4 w-4" /> Satellite uptime</span>
                  <span className="font-medium text-on-surface">{formatPercent(snapshot.satelliteUptime)}</span>
                </div>
              </div>
            </>
          )}
        </Tile>
      </div>

      <Tile className="mt-widget-gap">
        <TileHeader title="Device & infrastructure health" subtitle="Fleet status across the safety network" />
        {isLoading ? (
          <TileSkeleton rows={4} />
        ) : (
          <ul className="divide-y divide-outline-variant/60">
            {snapshot.deviceHealth.map((d) => (
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
