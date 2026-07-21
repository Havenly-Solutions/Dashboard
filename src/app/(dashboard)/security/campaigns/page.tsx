"use client";

import { Target, MailWarning, MousePointerClick, ShieldAlert } from "lucide-react";
import { Tile, TileHeader } from "@/components/ui/tile";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { TileSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useSecurityCampaigns } from "@/hooks/use-security";

const STATUS_TONE = { DRAFT: "neutral", RUNNING: "info", COMPLETED: "success" } as const;

export default function CampaignsPage() {
  const { data: campaigns, isLoading } = useSecurityCampaigns();

  const running = (campaigns ?? []).filter((c) => c.status === "RUNNING").length;
  const totalTargeted = (campaigns ?? []).reduce((s, c) => s + c.targeted, 0);
  const totalSubmitted = (campaigns ?? []).reduce((s, c) => s + c.submitted, 0);
  const totalReported = (campaigns ?? []).reduce((s, c) => s + c.reportedSuspicious, 0);

  return (
    <div>
      <div className="grid grid-cols-1 gap-widget-gap sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Running Simulations" value={isLoading ? "\u2014" : String(running)} icon={Target} />
        <StatCard label="Staff Targeted" value={isLoading ? "\u2014" : String(totalTargeted)} icon={MailWarning} />
        <StatCard label="Credentials Submitted" value={isLoading ? "\u2014" : String(totalSubmitted)} icon={MousePointerClick} />
        <StatCard label="Reported as Suspicious" value={isLoading ? "\u2014" : String(totalReported)} icon={ShieldAlert} />
      </div>

      <Tile className="mt-widget-gap">
        <TileHeader title="Campaigns" subtitle="GoPhish simulations \u2014 normalized server-side, no raw engine data reaches the browser" />
        {isLoading ? (
          <TileSkeleton rows={3} />
        ) : !campaigns || campaigns.length === 0 ? (
          <EmptyState icon={Target} title="No campaigns yet" />
        ) : (
          <Table>
            <THead>
              <TH>Campaign</TH>
              <TH>Status</TH>
              <TH>Targeted</TH>
              <TH>Opened</TH>
              <TH>Submitted</TH>
              <TH>Reported</TH>
            </THead>
            <TBody>
              {campaigns.map((c) => (
                <TR key={c.id}>
                  <TD>
                    <p className="font-medium text-on-surface">{c.name}</p>
                    <p className="text-body-sm text-on-surface-variant">{c.type.replace("_", " ")}</p>
                  </TD>
                  <TD>
                    <Badge tone={STATUS_TONE[c.status]}>{c.status}</Badge>
                  </TD>
                  <TD>{c.targeted}</TD>
                  <TD>{c.opened}</TD>
                  <TD className={c.submitted > 0 ? "text-critical" : undefined}>{c.submitted}</TD>
                  <TD className="text-success">{c.reportedSuspicious}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Tile>
    </div>
  );
}
