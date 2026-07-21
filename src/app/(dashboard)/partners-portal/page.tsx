"use client";

import Link from "next/link";
import { Handshake, Briefcase, Users2, Mail, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Tile, TileHeader } from "@/components/ui/tile";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { TileSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { usePartners } from "@/hooks/use-partners";
import { GettingStartedChecklist } from "@/components/onboarding/getting-started-checklist";

export default function PartnersPortalPage() {
  const { user } = useAuth();
  const { data: partners, isLoading } = usePartners();

  // Until havenly-backend scopes /api/v1/dashboard/partners by the caller's
  // organizationId, this previews the first partner record as "your org."
  // Swap for GET /api/v1/dashboard/partners/me once that route exists.
  const myOrg = partners?.[0];
  const otherPartners = (partners ?? []).filter((p) => p.id !== myOrg?.id);

  return (
    <div>
      {user && (
        <GettingStartedChecklist
          userId={user.id}
          tasks={[{ label: "Review your organization's details", done: !!myOrg }, { label: "Message the Havenly team", done: false, href: "/comms" }]}
        />
      )}

      <PageHeader
        title="Partners Portal"
        description={`${user?.organizationName ?? myOrg?.name ?? "Your organization"}'s view of the Havenly network.`}
      />

      <div className="grid grid-cols-1 gap-widget-gap sm:grid-cols-3">
        <StatCard label="Active Cases" value={isLoading ? "\u2014" : String(myOrg?.activeCases ?? 0)} icon={Briefcase} />
        <StatCard label="Network Partners" value={isLoading ? "\u2014" : String(partners?.length ?? 0)} icon={Users2} />
        <StatCard label="Region" value={myOrg?.region ?? "\u2014"} icon={Handshake} />
      </div>

      <div className="mt-widget-gap grid grid-cols-1 gap-widget-gap xl:grid-cols-3">
        <Tile className="xl:col-span-2">
          <TileHeader title="Your organization" />
          {isLoading ? (
            <TileSkeleton rows={3} />
          ) : myOrg ? (
            <dl className="space-y-3 text-body-base">
              <div className="flex justify-between">
                <dt className="text-on-surface-variant">Organization</dt>
                <dd className="text-on-surface">{myOrg.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-on-surface-variant">Type</dt>
                <dd className="text-on-surface">{myOrg.type}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-on-surface-variant">Primary contact</dt>
                <dd className="text-on-surface">{myOrg.contactName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-on-surface-variant">Status</dt>
                <dd>
                  <Badge tone={myOrg.status === "ACTIVE" ? "success" : "warning"}>{myOrg.status}</Badge>
                </dd>
              </div>
            </dl>
          ) : null}
        </Tile>

        <Tile className="flex flex-col">
          <TileHeader title="Quick actions" />
          <div className="flex flex-1 flex-col justify-between gap-4">
            <Link
              href="/comms"
              className="flex items-center justify-between rounded border border-outline-variant px-3.5 py-3 text-body-sm text-on-surface hover:bg-surface-container-low"
            >
              <span className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> Message Havenly team
              </span>
              <ArrowRight className="h-4 w-4 text-on-surface-variant" />
            </Link>
          </div>
        </Tile>
      </div>

      {otherPartners.length > 0 && (
        <Tile className="mt-widget-gap">
          <TileHeader title="Other network partners" subtitle="Visible orgs coordinating with Havenly" />
          <ul className="divide-y divide-outline-variant/60">
            {otherPartners.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-body-base text-on-surface">{p.name}</p>
                  <p className="text-body-sm text-on-surface-variant">
                    {p.type} &middot; {p.region}
                  </p>
                </div>
                <Badge tone={p.status === "ACTIVE" ? "success" : "warning"}>{p.status}</Badge>
              </li>
            ))}
          </ul>
        </Tile>
      )}
    </div>
  );
}
