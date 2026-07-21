"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Siren, Headset, Users, TrendingUp, Smartphone, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Tile, TileHeader } from "@/components/ui/tile";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { TileSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { useSosEvents } from "@/hooks/use-sos";
import { useHelpdeskTickets } from "@/hooks/use-helpdesk";
import { useMarketingSnapshot } from "@/hooks/use-marketing";
import { useAppAnalyticsSnapshot } from "@/hooks/use-app-analytics";
import { useEnquiries } from "@/hooks/use-support";
import { usePreRegistrationSummary, usePartnersSummary } from "@/hooks/use-growth";
import { formatCompactNumber, formatRelativeTime } from "@/lib/utils";
import { SOS_STATUS_TONE } from "@/components/sos/status";
import { TICKET_STATUS_TONE } from "@/components/helpdesk/status";
import { GettingStartedChecklist } from "@/components/onboarding/getting-started-checklist";
import { ProgressStatCard } from "@/components/growth/ProgressStatCard";
import { GrowthTrendChart } from "@/components/growth/GrowthTrendChart";
import { PreRegistrationTable, PartnerGrowthTable } from "@/components/growth/GrowthTables";

export default function OverviewPage() {
  const { user } = useAuth();
  const sos = useSosEvents();
  const tickets = useHelpdeskTickets();
  const marketing = useMarketingSnapshot();
  const app = useAppAnalyticsSnapshot();
  const enquiries = useEnquiries();

  const preReg = usePreRegistrationSummary();
  const partners = usePartnersSummary();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const activeSos = (sos.data ?? []).filter((e: any) => e.status === "ACTIVE" || e.status === "PENDING");
  const openTickets = (tickets.data ?? []).filter((t: any) => t.status !== "RESOLVED");
  const openEnquiries = (enquiries.data ?? []).filter((e: any) => e.status === "OPEN" || e.status === "FLAGGED");

  return (
    <div>
      {user && (
        <GettingStartedChecklist
          userId={user.id}
          tasks={[
            { label: "Check live SOS command", done: sos.isSuccess, href: "/sos" },
            { label: "Review the helpdesk queue", done: tickets.isSuccess, href: "/helpdesk" },
            { label: "Invite your team", done: false, href: "/team" },
            { label: "Set up the Access Control Matrix", done: false, href: "/access-control" },
          ]}
        />
      )}

      <PageHeader
        title={`Welcome back${user ? `, ${user.name.split(" ")[0]}` : ""}`}
        description="Everything moving across Havenly right now, in one view."
      />

      <div className="grid grid-cols-1 gap-widget-gap sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active SOS Incidents"
          value={sos.isLoading ? "—" : String(activeSos.length)}
          icon={Siren}
        />
        <StatCard
          label="Open Helpdesk Tickets"
          value={tickets.isLoading ? "—" : String(openTickets.length)}
          icon={Headset}
        />
        <ProgressStatCard
          label="Pre-registration signups"
          value={(preReg.data as any)?.total ?? 0}
          target={(preReg.data as any)?.target ?? 5000}
          targetKey="PRE_REGISTRATION"
          icon={Users}
        />
        <ProgressStatCard
          label="Partners closed"
          value={(partners.data as any)?.closed ?? 0}
          target={(partners.data as any)?.target ?? 3}
          targetKey="PARTNERS"
          icon={TrendingUp}
        />
      </div>

      <div className="mt-widget-gap grid grid-cols-1 gap-widget-gap lg:grid-cols-3">
        <GrowthTrendChart
          title="Signups Trend"
          data={(preReg.data as any)?.series ?? []}
        />

        <Tile>
          <TileHeader title="Quick links" />
          <ul className="space-y-1">
            {[
              { href: "/helpdesk", label: "Helpdesk queue", count: openTickets.length },
              { href: "/support", label: "Customer enquiries", count: openEnquiries.length },
              { href: "/team", label: "Team & approvals" },
              { href: "/security/campaigns", label: "Security suite" },
            ].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="flex items-center justify-between rounded px-3 py-2.5 text-body-base text-on-surface hover:bg-surface-container-low"
                >
                  {l.label}
                  {l.count !== undefined ? (
                    <Badge tone={l.count > 0 ? "secondary" : "neutral"}>{l.count}</Badge>
                  ) : (
                    <ArrowRight className="h-4 w-4 text-on-surface-variant" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </Tile>
      </div>

      <div className="mt-widget-gap grid grid-cols-1 gap-widget-gap lg:grid-cols-2">
        <PreRegistrationTable />
        <PartnerGrowthTable partners={(partners.data as any)?.pending ?? []} />
      </div>

      <div className="mt-widget-gap grid grid-cols-1 gap-widget-gap lg:grid-cols-2">
        <Tile>
          <TileHeader
            title="Live SOS Incidents"
            subtitle="Requiring attention right now"
            action={
              <Link href="/sos" className="flex items-center gap-1 text-label-md font-medium text-secondary hover:underline">
                Open command map <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          {sos.isLoading ? (
            <TileSkeleton rows={3} />
          ) : activeSos.length === 0 ? (
            <p className="py-6 text-center text-body-sm text-on-surface-variant">No active incidents. All clear.</p>
          ) : (
            <ul className="divide-y divide-outline-variant/60">
              {activeSos.slice(0, 5).map((e: any) => (
                <li key={e.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-body-base font-medium text-on-surface">{e.title}</p>
                    <p className="truncate text-body-sm text-on-surface-variant">
                      {e.reference} &middot; {e.address ?? e.source}
                    </p>
                  </div>
                  <Badge tone={SOS_STATUS_TONE[e.status as keyof typeof SOS_STATUS_TONE]}>{e.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Tile>

        <Tile>
          <TileHeader
            title="Helpdesk queue"
            subtitle="Latest tickets across all categories"
            action={
              <Link href="/helpdesk" className="flex items-center gap-1 text-label-md font-medium text-secondary hover:underline">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          {tickets.isLoading ? (
            <TileSkeleton rows={4} />
          ) : (
            <ul className="divide-y divide-outline-variant/60">
              {(tickets.data ?? []).slice(0, 5).map((t: any) => (
                <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-body-base text-on-surface">{t.subject}</p>
                    <p className="text-body-sm text-on-surface-variant">
                      {t.ticketNumber} &middot; {formatRelativeTime(t.createdAt)}
                    </p>
                  </div>
                  <Badge tone={TICKET_STATUS_TONE[t.status as keyof typeof TICKET_STATUS_TONE]}>{t.status.replace("_", " ")}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Tile>
      </div>
    </div>
  );
}
