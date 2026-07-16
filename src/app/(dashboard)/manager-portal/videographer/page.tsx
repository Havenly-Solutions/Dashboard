"use client";

import Link from "next/link";
import { Video, Headset, MessagesSquare, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Tile, TileHeader } from "@/components/ui/tile";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { TileSkeleton } from "@/components/ui/skeleton";
import { GettingStartedChecklist } from "@/components/onboarding/getting-started-checklist";
import { useAuth } from "@/lib/auth-context";
import { useHelpdeskTickets } from "@/hooks/use-helpdesk";
import { useEnquiries } from "@/hooks/use-support";
import { useMedia } from "@/hooks/use-media";
import { formatRelativeTime } from "@/lib/utils";

export default function VideographerManagerPortalPage() {
  const { user } = useAuth();
  const { data: tickets, isLoading: ticketsLoading } = useHelpdeskTickets();
  const { data: enquiries } = useEnquiries();
  const { data: media, isLoading: mediaLoading } = useMedia({ assetType: "VIDEO", limit: 5 });

  const openTickets = (tickets ?? []).filter((t) => t.status !== "RESOLVED");

  return (
    <div>
      {user && (
        <GettingStartedChecklist
          userId={user.id}
          tasks={[
            { label: "Review media vault assignments", done: (media?.length ?? 0) > 0, href: "/media-vault" },
            { label: "Triage videography support tickets", done: !!tickets, href: "/helpdesk" },
          ]}
        />
      )}

      <PageHeader
        title={`Videographer Manager Portal${user ? `, ${user.name.split(" ")[0]}` : ""}`}
        description="Media operations and videography department queue."
      />

      <div className="grid grid-cols-1 gap-widget-gap sm:grid-cols-3">
        <StatCard label="Pending Video Reviews" value={mediaLoading ? "\u2014" : String(media?.filter(m => m.status === 'UPLOADING').length ?? 0)} icon={Video} />
        <StatCard label="Department Tickets" value={ticketsLoading ? "\u2014" : String(openTickets.length)} icon={Headset} />
        <StatCard label="Media Enquiries" value={enquiries ? String(enquiries.length) : "\u2014"} icon={MessagesSquare} />
      </div>

      <div className="mt-widget-gap grid grid-cols-1 gap-widget-gap xl:grid-cols-2">
        <Tile>
          <TileHeader
            title="Media Vault Activity"
            action={
              <Link href="/media-vault" className="flex items-center gap-1 text-label-md font-medium text-secondary hover:underline">
                Open <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          {mediaLoading ? (
            <TileSkeleton rows={3} />
          ) : media?.length === 0 ? (
            <p className="py-8 text-center text-body-sm text-on-surface-variant">No recent activity</p>
          ) : (
            <ul className="divide-y divide-outline-variant/60">
              {media?.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body-sm text-on-surface font-medium">{m.title}</p>
                    <p className="truncate text-label-md text-on-surface-variant">Uploaded by {m.uploadedBy.name}</p>
                  </div>
                  <span className="text-label-md text-on-surface-variant shrink-0">{formatRelativeTime(m.createdAt)}</span>
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
