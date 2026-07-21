"use client";

import { ShieldAlert } from "lucide-react";
import { Tile, TileHeader } from "@/components/ui/tile";
import { Badge } from "@/components/ui/badge";
import { TileSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useBreachLogs } from "@/hooks/use-security";
import { formatRelativeTime } from "@/lib/utils";

const SEVERITY_TONE = { CRITICAL: "critical", HIGH: "warning", MEDIUM: "info", LOW: "neutral" } as const;

export default function BreachLogsPage() {
  const { data: logs, isLoading } = useBreachLogs();

  return (
    <Tile>
      <TileHeader title="Breach & anomaly log" subtitle="Auto-detected security events across the platform" />
      {isLoading ? (
        <TileSkeleton rows={4} />
      ) : !logs || logs.length === 0 ? (
        <EmptyState icon={ShieldAlert} title="No security events recorded" description="This is a good thing." />
      ) : (
        <ul className="divide-y divide-outline-variant/60">
          {logs.map((l) => (
            <li key={l.id} className="flex items-start justify-between gap-3 py-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <Badge tone={SEVERITY_TONE[l.severity]}>{l.severity}</Badge>
                  <p className="text-body-base text-on-surface">{l.summary}</p>
                </div>
                <p className="mt-1 text-body-sm text-on-surface-variant">
                  {l.system} &middot; detected {formatRelativeTime(l.detectedAt)}
                  {l.resolvedAt ? ` \u2014 resolved ${formatRelativeTime(l.resolvedAt)}` : " \u2014 unresolved"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Tile>
  );
}
