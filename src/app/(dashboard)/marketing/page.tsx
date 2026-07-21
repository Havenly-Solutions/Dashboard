"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Users, UserPlus, Percent, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Tile, TileHeader } from "@/components/ui/tile";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { TileSkeleton } from "@/components/ui/skeleton";
import { TrendAreaChart } from "@/components/charts/trend-chart";
import { useMarketingSnapshot } from "@/hooks/use-marketing";
import { formatCompactNumber, formatNumber, formatPercent } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { MarketingSnapshot } from "@/types";

const INITIAL_SNAPSHOT: MarketingSnapshot = {
  visitors: 0,
  visitorsDelta: 0,
  signups: 0,
  signupsDelta: 0,
  conversionRate: 0,
  conversionRateDelta: 0,
  avgSessionSeconds: 0,
  rangeLabel: "...",
  funnel: [],
  trend: [],
  topSources: [],
  topPages: [],
  seo: { organicVisitors: 0, organicVisitorsDelta: 0, topOrganicSources: [] }
};

export default function MarketingAnalyticsPage() {
  const [granularity, setGranularity] = useState("day");
  const { data, isLoading } = useMarketingSnapshot("30d", granularity);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const snapshot = (data as MarketingSnapshot) || INITIAL_SNAPSHOT;
  const maxFunnel = snapshot.funnel[0]?.count ?? 1;
  const siteUrl = process.env.NEXT_PUBLIC_MARKETING_SITE_URL ?? "https://havenly.io";

  return (
    <div>
      <PageHeader
        title="Marketing Analytics"
        description={`havenly-marketing website performance — ${snapshot.rangeLabel}`}
        action={
          <div className="flex items-center gap-3">
            <div className="flex rounded bg-surface-container-low p-1">
              {["day", "week", "month"].map((g) => (
                <button
                  key={g}
                  onClick={() => setGranularity(g)}
                  className={cn(
                    "rounded px-3 py-1 text-label-sm font-medium transition-colors capitalize",
                    granularity === g
                      ? "bg-surface-container-lowest text-secondary shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
            <a href={siteUrl} target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm">
                View live site <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </a>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-widget-gap sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Visitors" value={isLoading ? "—" : formatCompactNumber(snapshot.visitors)} delta={snapshot.visitorsDelta} icon={Users} />
        <StatCard label="Organic (SEO)" value={isLoading ? "—" : formatCompactNumber(snapshot.seo?.organicVisitors ?? 0)} delta={snapshot.seo?.organicVisitorsDelta} icon={Search} />
        <StatCard label="Signups" value={isLoading ? "—" : formatNumber(snapshot.signups)} delta={snapshot.signupsDelta} icon={UserPlus} />
        <StatCard
          label="Conversion Rate"
          value={isLoading ? "—" : formatPercent(snapshot.conversionRate)}
          delta={snapshot.conversionRateDelta}
          icon={Percent}
        />
      </div>

      <div className="mt-widget-gap grid grid-cols-1 gap-widget-gap xl:grid-cols-3">
        <Tile className="xl:col-span-2">
          <TileHeader title="Growth Traction" subtitle={`${granularity === 'day' ? 'Daily' : granularity === 'week' ? 'Weekly' : 'Monthly'} trend`} />
          {isLoading ? (
            <TileSkeleton rows={5} />
          ) : (
            <TrendAreaChart
              data={snapshot.trend}
              xKey="label"
              series={[
                { key: "visitors", color: "rgb(70 72 212)", label: "Total Visitors" },
                { key: "organic", color: "rgb(234 179 8)", label: "Organic Search" },
                { key: "signups", color: "rgb(22 163 74)", label: "Signups" },
              ]}
              height={320}
            />
          )}
        </Tile>

        <Tile>
          <TileHeader title="Traffic sources" />
          {isLoading ? (
            <TileSkeleton rows={5} />
          ) : (
            <ul className="space-y-3">
              {snapshot.topSources.map((s) => (
                <li key={s.source}>
                  <div className="mb-1 flex items-center justify-between text-body-sm">
                    <span className="text-on-surface">{s.source}</span>
                    <span className="text-on-surface-variant">{formatNumber(s.visitors)}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
                    <div className="h-full rounded-full bg-secondary" style={{ width: `${s.share}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Tile>
      </div>

      <div className="mt-widget-gap grid grid-cols-1 gap-widget-gap xl:grid-cols-3">
        <Tile>
          <TileHeader title="SEO Performance" subtitle="Top organic search sources" />
          {isLoading ? (
            <TileSkeleton rows={5} />
          ) : (
            <ul className="space-y-3">
              {(snapshot.seo?.topOrganicSources || []).map((s: any) => (
                <li key={s.source}>
                  <div className="mb-1 flex items-center justify-between text-body-sm">
                    <span className="text-on-surface">{s.source}</span>
                    <span className="text-on-surface-variant">{formatNumber(s.visitors)}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
                    <div className="h-full rounded-full bg-yellow-500" style={{ width: `${s.share}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Tile>

        <Tile>
          <TileHeader title="Conversion funnel" />
          {isLoading ? (
            <TileSkeleton rows={5} />
          ) : (
            <ul className="space-y-2.5">
              {snapshot.funnel.map((f) => (
                <li key={f.stage}>
                  <div className="mb-1 flex items-center justify-between text-body-sm">
                    <span className="text-on-surface">{f.stage}</span>
                    <span className="text-on-surface-variant">{formatNumber(f.count)}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.max(4, (f.count / maxFunnel) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Tile>

        <Tile>
          <TileHeader title="Top pages" />
          {isLoading ? (
            <TileSkeleton rows={5} />
          ) : (
            <Table>
              <THead>
                <TH>Page</TH>
                <TH>Views</TH>
              </THead>
              <TBody>
                {snapshot.topPages.map((p) => (
                  <TR key={p.path}>
                    <TD className="font-mono text-body-xs">{p.path}</TD>
                    <TD>{formatNumber(p.views)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </Tile>
      </div>
    </div>
  );
}
