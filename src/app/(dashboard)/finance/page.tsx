"use client";

import { Wallet, TrendingUp, FileWarning, PercentCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Tile, TileHeader } from "@/components/ui/tile";
import { StatCard } from "@/components/ui/stat-card";
import { TileSkeleton } from "@/components/ui/skeleton";
import { TrendAreaChart } from "@/components/charts/trend-chart";
import { useFinanceSnapshot } from "@/hooks/use-finance";
import { formatCurrencyZAR } from "@/lib/utils";

export default function FinancePage() {
  const { data, isLoading } = useFinanceSnapshot();
  const totalRevenue = data?.revenueBySource.reduce((s, r) => s + r.amount, 0) ?? 0;

  return (
    <div>
      <PageHeader title="Finance Hub" description="Recurring revenue, invoicing, and churn at a glance." />

      <div className="grid grid-cols-1 gap-widget-gap sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="MRR" value={isLoading ? "\u2014" : formatCurrencyZAR(data!.mrr)} delta={data?.mrrDelta} icon={Wallet} />
        <StatCard label="ARR" value={isLoading ? "\u2014" : formatCurrencyZAR(data!.arr)} icon={TrendingUp} />
        <StatCard label="Outstanding Invoices" value={isLoading ? "\u2014" : String(data!.outstandingInvoices)} icon={FileWarning} />
        <StatCard label="Churn Rate" value={isLoading ? "\u2014" : `${data!.churnRate}%`} icon={PercentCircle} invertDelta />
      </div>

      <div className="mt-widget-gap grid grid-cols-1 gap-widget-gap xl:grid-cols-3">
        <Tile className="xl:col-span-2">
          <TileHeader title="Revenue trend" subtitle="Last 6 months" />
          {isLoading ? (
            <TileSkeleton rows={5} />
          ) : (
            <TrendAreaChart
              data={data!.trend}
              xKey="label"
              series={[{ key: "revenue", color: "rgb(70 72 212)", label: "Revenue" }]}
            />
          )}
        </Tile>

        <Tile>
          <TileHeader title="Revenue by source" />
          {isLoading ? (
            <TileSkeleton rows={3} />
          ) : (
            <ul className="space-y-4">
              {data!.revenueBySource.map((r) => (
                <li key={r.source}>
                  <div className="mb-1 flex items-center justify-between text-body-sm">
                    <span className="text-on-surface">{r.source}</span>
                    <span className="text-on-surface-variant">{formatCurrencyZAR(r.amount)}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
                    <div
                      className="h-full rounded-full bg-secondary"
                      style={{ width: `${totalRevenue ? (r.amount / totalRevenue) * 100 : 0}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Tile>
      </div>
    </div>
  );
}
