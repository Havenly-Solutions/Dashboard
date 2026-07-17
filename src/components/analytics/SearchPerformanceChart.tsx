"use client";

import { TrendLineChart } from "@/components/charts/trend-chart";

interface SearchData {
  date: string;
  impressions: number;
  clicks: number;
}

export function SearchPerformanceChart({ data }: { data: SearchData[] }) {
  return (
    <div className="tile p-container-padding">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-title-sm text-on-surface">Search Performance</h3>
      </div>
      <TrendLineChart
        data={data as any}
        xKey="date"
        series={[
          { key: "impressions", color: "rgb(139, 92, 246)", label: "Impressions" },
          { key: "clicks", color: "rgb(245, 158, 11)", label: "Clicks" },
        ]}
      />
    </div>
  );
}
