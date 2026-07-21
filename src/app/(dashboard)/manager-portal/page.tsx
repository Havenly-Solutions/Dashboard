"use client";

import Link from "next/link";
import { Siren, Headset, MessagesSquare, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Tile, TileHeader } from "@/components/ui/tile";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { TileSkeleton } from "@/components/ui/skeleton";
import { GettingStartedChecklist } from "@/components/onboarding/getting-started-checklist";
import { useAuth } from "@/lib/auth-context";
import { useSosEvents } from "@/hooks/use-sos";
import { useHelpdeskTickets } from "@/hooks/use-helpdesk";
import { useEnquiries } from "@/hooks/use-support";
import { formatRelativeTime } from "@/lib/utils";
import { SOS_STATUS_TONE } from "@/components/sos/status";

export default function ManagerPortalPage() {
  const { user } = useAuth();
  const { data: sos, isLoading: sosLoading } = useSosEvents();
  const { data: tickets, isLoading: ticketsLoading } = useHelpdeskTickets();
  const { data: enquiries } = useEnquiries();

  const active = (sos ?? []).filter((e) => e.status === "ACTIVE" || e.status === "PENDING");
  const openTickets = (tickets ?? []).filter((t) => t.status !== "RESOLVED");

  return (
    <div>
      {user && (
        <GettingStartedChecklist
          userId={user.id}
          tasks={[
            { label: "Check the SOS command queue", done: !!sos, href: "/sos" },
            { label: "Triage open helpdesk tickets", done: !!tickets, href: "/helpdesk" },
          ]}
        />
      )}

      <PageHeader
        title={`Welcome back${user ? `, ${user.name.split(" ")[0]}` : ""}`}
        description="Operations at a glance \u2014 safety, support, and your team's queue."
      />

      <div className="grid grid-cols-1 gap-widget-gap sm:grid-cols-3">
        <StatCard label="Active SOS Incidents" value={sosLoading ? "\u2014" : String(active.length)} icon={Siren} />
        <StatCard label="Open Helpdesk Tickets" value={ticketsLoading ? "\u2014" : String(openTickets.length)} icon={Headset} />
        <StatCard label="Customer Enquiries" value={enquiries ? String(enquiries.length) : "\u2014"} icon={MessagesSquare} />
      </div>

      <div className="mt-widget-gap grid grid-cols-1 gap-widget-gap xl:grid-cols-2">
        <Tile>
          <TileHeader
            title="Live SOS"
            action={
              <Link href="/sos" className="flex items-center gap-1 text-label-md font-medium text-secondary hover:underline">
                Open <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          {sosLoading ? (
            <TileSkeleton rows={3} />
          ) : active.length === 0 ? (
            <p className="py-4 text-center text-body-sm text-on-surface-variant">No active incidents.</p>
          ) : (
            <ul className="divide-y divide-outline-variant/60">
              {active.slice(0, 4).map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 py-2.5">
                  <p className="truncate text-body-sm text-on-surface">{e.title}</p>
                  <Badge tone={SOS_STATUS_TONE[e.status]}>{e.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Tile>

        <Tile>
          <TileHeader
            title="Helpdesk queue"
            action={
              <Link href="/helpdesk" className="flex items-center gap-1 text-label-md font-medium text-secondary hover:underline">
                Open <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          {ticketsLoading ? (
            <TileSkeleton rows={3} />
          ) : (
            <ul className="divide-y divide-outline-variant/60">
              {(tickets ?? []).slice(0, 4).map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 py-2.5">
                  <p className="truncate text-body-sm text-on-surface">{t.subject}</p>
                  <span className="text-label-md text-on-surface-variant">{formatRelativeTime(t.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Tile>
      </div>
    </div>
  );
}
