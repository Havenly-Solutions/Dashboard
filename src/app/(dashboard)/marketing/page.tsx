"use client";

import { ExternalLink, Users, UserPlus, Percent, Clock } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Tile, TileHeader } from "@/components/ui/tile";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { TileSkeleton } from "@/components/ui/skeleton";
import { TrendAreaChart } from "@/components/charts/trend-chart";
import { useMarketingSnapshot } from "@/hooks/use-marketing";
import { formatCompactNumber, formatNumber, formatPercent } from "@/lib/utils";

export default function MarketingAnalyticsPage() {
  const { data, isLoading } = useMarketingSnapshot();
  const siteUrl = process.env.NEXT_PUBLIC_MARKETING_SITE_URL ?? "https://havenly.io";
  const maxFunnel = data?.funnel[0]?.count ?? 1;

  return (
    <div>
      <PageHeader
        title="Marketing Analytics"
        description={`havenly-marketing website performance \u2014 ${data?.rangeLabel ?? "last 30 days"}`}
        action={
          <a href={siteUrl} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm">
              View live site <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </a>
        }
      />

      <div className="grid grid-cols-1 gap-widget-gap sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Visitors" value={isLoading ? "\u2014" : formatCompactNumber(data!.visitors)} delta={data?.visitorsDelta} icon={Users} />
        <StatCard label="Signups" value={isLoading ? "\u2014" : formatNumber(data!.signups)} delta={data?.signupsDelta} icon={UserPlus} />
        <StatCard
          label="Conversion Rate"
          value={isLoading ? "\u2014" : formatPercent(data!.conversionRate)}
          delta={data?.conversionRateDelta}
          icon={Percent}
        />
        <StatCard
          label="Avg. Session"
          value={isLoading ? "\u2014" : `${Math.round((data?.avgSessionSeconds ?? 0) / 60)}m ${Math.round((data?.avgSessionSeconds ?? 0) % 60)}s`}
          icon={Clock}
        />
      </div>

      <div className="mt-widget-gap grid grid-cols-1 gap-widget-gap xl:grid-cols-3">
        <Tile className="xl:col-span-2">
          <TileHeader title="Visitors & signups" subtitle="Weekly trend" />
          {isLoading || !data?.trend ? (
            <TileSkeleton rows={5} />
          ) : (
            <TrendAreaChart
              data={data.trend}
              xKey="label"
              series={[
                { key: "visitors", color: "rgb(70 72 212)", label: "Visitors" },
                { key: "signups", color: "rgb(22 163 74)", label: "Signups" },
              ]}
            />
          )}
        </Tile>

        <Tile>
          <TileHeader title="Traffic sources" />
          {isLoading || !data?.topSources ? (
            <TileSkeleton rows={5} />
          ) : (
            <ul className="space-y-3">
              {data.topSources.map((s) => (
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
          <TileHeader title="Conversion funnel" />
          {isLoading || !data?.funnel ? (
            <TileSkeleton rows={5} />
          ) : (
            <ul className="space-y-2.5">
              {data.funnel.map((f) => (
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

        <Tile className="xl:col-span-2">
          <TileHeader title="Top pages" />
          {isLoading || !data?.topPages ? (
            <TileSkeleton rows={5} />
          ) : (
            <Table>
              <THead>
                <TH>Page</TH>
                <TH>Views</TH>
                <TH>Avg. time</TH>
              </THead>
              <TBody>
                {data.topPages.map((p) => (
                  <TR key={p.path}>
                    <TD className="font-mono text-body-sm">{p.path}</TD>
                    <TD>{formatNumber(p.views)}</TD>
                    <TD>{Math.round(p.avgTimeSeconds / 60) > 0 ? `${Math.round(p.avgTimeSeconds / 60)}m ` : ""}{p.avgTimeSeconds % 60}s</TD>
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
