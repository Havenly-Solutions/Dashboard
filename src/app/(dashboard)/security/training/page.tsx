"use client";

import { GraduationCap, BookOpen, Trophy } from "lucide-react";
import { Tile, TileHeader } from "@/components/ui/tile";
import { EmptyState } from "@/components/ui/empty-state";

const MODULES = [
  { title: "Phishing Recognition Fundamentals", provider: "CTFd", challenges: 8 },
  { title: "Secure Password Hygiene", provider: "CTFd", challenges: 5 },
  { title: "Incident Reporting Procedure", provider: "CTFd", challenges: 3 },
  { title: "Web Application Security \u2014 Intermediate", provider: "Judge0", challenges: 12 },
];

export default function TrainingPage() {
  return (
    <Tile>
      <TileHeader title="Training library" subtitle="CTFd challenges & Judge0 coding assessments" />
      {MODULES.length === 0 ? (
        <EmptyState icon={BookOpen} title="No training modules published yet" />
      ) : (
        <ul className="divide-y divide-outline-variant/60">
          {MODULES.map((m) => (
            <li key={m.title} className="flex items-center justify-between gap-3 py-3.5">
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
      <p className="mt-4 text-body-sm text-on-surface-variant">
        Wire this list to <code className="rounded bg-surface-container-low px-1.5 py-0.5">GET /api/v1/dashboard/security/training</code> once
        the CTFd integration is live on havenly-backend.
      </p>
    </Tile>
  );
}
