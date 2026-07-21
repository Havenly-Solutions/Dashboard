import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPercent } from "@/lib/utils";

export function StatCard({
  label,
  value,
  delta,
  deltaLabel,
  icon: Icon,
  invertDelta,
}: {
  label: string;
  value: string;
  delta?: number;
  deltaLabel?: string;
  icon?: LucideIcon;
  /** For metrics where a rise is bad (e.g. churn), flip the color logic. */
  invertDelta?: boolean;
}) {
  const positive = delta !== undefined ? (invertDelta ? delta <= 0 : delta >= 0) : undefined;
  return (
    <div className="tile p-container-padding">
      <div className="flex items-center justify-between">
        <span className="text-label-caps text-on-surface-variant">{label}</span>
        {Icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/10 text-secondary">
            <Icon className="h-4 w-4" strokeWidth={1.75} />
          </span>
        )}
      </div>
      <div className="mt-3 text-stat-xl text-on-surface">{value}</div>
      {delta !== undefined && (
        <div className={cn("mt-2 flex items-center gap-1 text-body-sm font-bold", positive ? "text-success-container bg-success/10 px-1.5 py-0.5 rounded" : "text-critical-container bg-critical/10 px-1.5 py-0.5 rounded")}>
          {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          <span>{formatPercent(delta, { showSign: true })}</span>
          {deltaLabel && <span className="font-normal text-on-surface-variant ml-1">{deltaLabel}</span>}
        </div>
      )}
    </div>
  );
}
