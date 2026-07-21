"use client";

import { useState, useMemo } from "react";
import { Download } from "lucide-react";
import { TrendAreaChart } from "@/components/charts/trend-chart";
import { Tile, TileHeader } from "@/components/ui/tile";
import { cn } from "@/lib/utils";

interface GrowthTrendChartProps {
  data: { date: string; count: number }[];
  title: string;
}

type Period = "Day" | "Week" | "Month";

export function GrowthTrendChart({ data, title }: GrowthTrendChartProps) {
  const [period, setPeriod] = useState<Period>("Day");

  const chartData = useMemo(() => {
    if (period === "Day") return data;

    const groups: Record<string, number> = {};
    data.forEach((d) => {
      const date = new Date(d.date);
      let key = "";
      if (period === "Week") {
        const firstDay = new Date(date.setDate(date.getDate() - date.getDay()));
        key = firstDay.toISOString().split("T")[0] || d.date;
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      }
      groups[key] = (groups[key] || 0) + d.count;
    });

    return Object.entries(groups)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [data, period]);

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "Date,Count\n"
      + chartData.map(e => `${e.date},${e.count}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `signups-trend-${period.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Tile className="lg:col-span-2">
      <TileHeader
        title={title}
        subtitle={`${period}ly signups trend`}
        action={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-md bg-surface-container-low p-1">
              {(["Day", "Week", "Month"] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "rounded px-2 py-1 text-label-md transition-colors",
                    period === p
                      ? "bg-surface-container-lowest text-on-surface shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              onClick={exportData}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low"
              title="Export as CSV"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        }
      />
      <div className="pt-4">
        <TrendAreaChart
          data={chartData}
          xKey="date"
          series={[{ key: "count", label: "Signups", color: "rgb(var(--color-secondary))" }]}
          height={300}
        />
      </div>
    </Tile>
  );
}
