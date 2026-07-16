"use client";

import { TrendAreaChart } from "@/components/charts/trend-chart";

interface TrafficData {
  date: string;
  pageviews: number;
  visitors: number;
}

export function TrafficChart({ data }: { data: TrafficData[] }) {
  return (
    <div className="tile p-container-padding">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-title-sm text-on-surface">Website Traffic</h3>
      </div>
      <TrendAreaChart
        data={data as any}
        xKey="date"
        series={[
          { key: "pageviews", color: "rgb(59, 130, 246)", label: "Pageviews" },
          { key: "visitors", color: "rgb(16, 185, 129)", label: "Unique Visitors" },
        ]}
      />
    </div>
  );
}
