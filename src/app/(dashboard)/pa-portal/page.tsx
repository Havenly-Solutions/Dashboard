"use client";

import Link from "next/link";
import { Headset, MessagesSquare, Mail, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Tile, TileHeader } from "@/components/ui/tile";
import { StatCard } from "@/components/ui/stat-card";
import { TileSkeleton } from "@/components/ui/skeleton";
import { GettingStartedChecklist } from "@/components/onboarding/getting-started-checklist";
import { useAuth } from "@/lib/auth-context";
import { useHelpdeskTickets } from "@/hooks/use-helpdesk";
import { useEnquiries } from "@/hooks/use-support";
import { useCommsMessages } from "@/hooks/use-comms";
import { formatRelativeTime } from "@/lib/utils";

export default function PaPortalPage() {
  const { user } = useAuth();
  const { data: tickets, isLoading: ticketsLoading } = useHelpdeskTickets();
  const { data: enquiries, isLoading: enquiriesLoading } = useEnquiries();
  const { data: messages } = useCommsMessages();

  const openTickets = (tickets ?? []).filter((t) => t.status !== "RESOLVED");
  const openEnquiries = (enquiries ?? []).filter((e) => e.status === "OPEN" || e.status === "FLAGGED");

  return (
    <div>
      {user && (
        <GettingStartedChecklist
          userId={user.id}
          tasks={[
            { label: "Clear the helpdesk queue", done: !!tickets, href: "/helpdesk" },
            { label: "Reply to open enquiries", done: !!enquiries, href: "/support" },
            { label: "Check the comms hub", done: !!messages, href: "/comms" },
          ]}
        />
      )}

      <PageHeader
        title={`Welcome back${user ? `, ${user.name.split(" ")[0]}` : ""}`}
        description="Your coordination queue \u2014 helpdesk, customer support, and comms."
      />

      <div className="grid grid-cols-1 gap-widget-gap sm:grid-cols-3">
        <StatCard label="Open Helpdesk Tickets" value={ticketsLoading ? "\u2014" : String(openTickets.length)} icon={Headset} />
        <StatCard label="Enquiries Awaiting Reply" value={enquiriesLoading ? "\u2014" : String(openEnquiries.length)} icon={MessagesSquare} />
        <StatCard label="Unread Messages" value={messages ? String(messages.filter((m) => !m.read).length) : "\u2014"} icon={Mail} />
      </div>

      <div className="mt-widget-gap grid grid-cols-1 gap-widget-gap xl:grid-cols-2">
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
              {openTickets.slice(0, 4).map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 py-2.5">
                  <p className="truncate text-body-sm text-on-surface">{t.subject}</p>
                  <span className="text-label-md text-on-surface-variant">{formatRelativeTime(t.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Tile>

        <Tile>
          <TileHeader
            title="Customer enquiries"
            action={
              <Link href="/support" className="flex items-center gap-1 text-label-md font-medium text-secondary hover:underline">
                Open <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          {enquiriesLoading ? (
            <TileSkeleton rows={3} />
          ) : (
            <ul className="divide-y divide-outline-variant/60">
              {openEnquiries.slice(0, 4).map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 py-2.5">
                  <p className="truncate text-body-sm text-on-surface">{e.subject}</p>
                  <span className="text-label-md text-on-surface-variant">{formatRelativeTime(e.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Tile>
      </div>
    </div>
  );
}
