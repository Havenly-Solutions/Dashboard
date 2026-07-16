"use client";

import Link from "next/link";
import { PenTool, Headset, MessagesSquare, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Tile, TileHeader } from "@/components/ui/tile";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { TileSkeleton } from "@/components/ui/skeleton";
import { GettingStartedChecklist } from "@/components/onboarding/getting-started-checklist";
import { useAuth } from "@/lib/auth-context";
import { useHelpdeskTickets } from "@/hooks/use-helpdesk";
import { useEnquiries } from "@/hooks/use-support";
import { useCalendarEvents } from "@/hooks/use-calendar";
import { formatRelativeTime } from "@/lib/utils";

export default function ContentCreatorManagerPortalPage() {
  const { user } = useAuth();
  const { data: tickets, isLoading: ticketsLoading } = useHelpdeskTickets();
  const { data: enquiries } = useEnquiries();

  const now = new Date();
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const { data: events, isLoading: eventsLoading } = useCalendarEvents({
    department: "MEDIA",
    from: now.toISOString(),
    to: thirtyDaysLater.toISOString()
  });

  const openTickets = (tickets ?? []).filter((t) => t.status !== "RESOLVED");

  return (
    <div>
      {user && (
        <GettingStartedChecklist
          userId={user.id}
          tasks={[
            { label: "Check content calendar", done: (events?.length ?? 0) > 0, href: "/calendar" },
            { label: "Review creator submissions", done: !!tickets, href: "/helpdesk" },
          ]}
        />
      )}

      <PageHeader
        title={`Content Creator Manager Portal${user ? `, ${user.name.split(" ")[0]}` : ""}`}
        description="Content creation department and media creator queue."
      />

      <div className="grid grid-cols-1 gap-widget-gap sm:grid-cols-3">
        <StatCard label="Upcoming Events" value={eventsLoading ? "\u2014" : String(events?.length ?? 0)} icon={PenTool} />
        <StatCard label="Department Tickets" value={ticketsLoading ? "\u2014" : String(openTickets.length)} icon={Headset} />
        <StatCard label="Campaign Enquiries" value={enquiries ? String(enquiries.length) : "\u2014"} icon={MessagesSquare} />
      </div>

      <div className="mt-widget-gap grid grid-cols-1 gap-widget-gap xl:grid-cols-2">
        <Tile>
          <TileHeader
            title="Content Calendar"
            action={
              <Link href="/calendar" className="flex items-center gap-1 text-label-md font-medium text-secondary hover:underline">
                Open <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          {eventsLoading ? (
            <TileSkeleton rows={3} />
          ) : events?.length === 0 ? (
            <p className="py-8 text-center text-body-sm text-on-surface-variant">No upcoming events</p>
          ) : (
            <ul className="divide-y divide-outline-variant/60">
              {events?.slice(0, 5).map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body-sm text-on-surface font-medium">{e.title}</p>
                    <p className="truncate text-label-md text-on-surface-variant">
                      {new Date(e.startDateTime).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <Badge variant="outline">{e.allDay ? "All Day" : new Date(e.startDateTime).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Tile>

        <Tile>
          <TileHeader
            title="Department helpdesk"
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
