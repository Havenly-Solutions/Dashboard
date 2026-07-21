"use client";

import { Trophy } from "lucide-react";
import { Tile, TileHeader } from "@/components/ui/tile";
import { TileSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { useLeaderboard } from "@/hooks/use-security";
import { cn } from "@/lib/utils";

export default function LeaderboardPage() {
  const { data: entries, isLoading } = useLeaderboard();

  return (
    <Tile>
      <TileHeader title="Security leaderboard" subtitle="Ranked by CTFd points & challenges solved" />
      {isLoading ? (
        <TileSkeleton rows={5} />
      ) : !entries || entries.length === 0 ? (
        <EmptyState icon={Trophy} title="No scores yet" />
      ) : (
        <ol className="divide-y divide-outline-variant/60">
          {entries.map((e) => (
            <li key={e.id} className="flex items-center gap-3 py-3.5">
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-label-md font-semibold",
                  e.rank === 1 ? "bg-warning/15 text-warning" : "bg-surface-container-high text-on-surface-variant"
                )}
              >
                {e.rank}
              </span>
              <Avatar name={e.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-body-base font-medium text-on-surface">{e.name}</p>
                <p className="text-body-sm text-on-surface-variant">{e.challengesSolved} challenges solved</p>
              </div>
              <p className="text-body-base font-semibold text-on-surface">{e.points.toLocaleString()} pts</p>
            </li>
          ))}
        </ol>
      )}
    </Tile>
  );
}
