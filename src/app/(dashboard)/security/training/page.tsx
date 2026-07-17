"use client";

import { GraduationCap, BookOpen, Trophy } from "lucide-react";
import { Tile, TileHeader } from "@/components/ui/tile";
import { EmptyState } from "@/components/ui/empty-state";
import { TileSkeleton } from "@/components/ui/skeleton";
import { useSecurityTraining } from "@/hooks/use-security";

export default function TrainingPage() {
  const { data: modules, isLoading } = useSecurityTraining();

  return (
    <Tile>
      <TileHeader title="Training library" subtitle="CTFd challenges & Judge0 coding assessments" />
      {isLoading ? (
        <TileSkeleton rows={4} />
      ) : !modules || modules.length === 0 ? (
        <EmptyState icon={BookOpen} title="No training modules published yet" />
      ) : (
        <ul className="divide-y divide-outline-variant/60">
          {modules.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-3 py-3.5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                  <GraduationCap className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-body-base font-medium text-on-surface">{m.title}</p>
                  <p className="text-body-sm text-on-surface-variant">{m.provider} &middot; {m.challenges} challenges</p>
                </div>
              </div>
              <Trophy className="h-4 w-4 text-on-surface-variant" />
            </li>
          ))}
        </ul>
      )}
    </Tile>
  );
}
