"use client";

import { useMemo, useState } from "react";
import { Headset, Clock3, CheckCircle2, AlertOctagon } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Tile, TileHeader } from "@/components/ui/tile";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { TileSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { useHelpdeskAgents, useHelpdeskTickets, useUpdateTicketStatus } from "@/hooks/use-helpdesk";
import { TICKET_PRIORITY_TONE, TICKET_STATUS_TONE } from "@/components/helpdesk/status";
import { formatRelativeTime } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import type { TicketCategory, TicketStatus } from "@/types";

const CATEGORIES: (TicketCategory | "ALL")[] = ["ALL", "TECHNICAL", "BILLING", "SECURITY", "GENERAL"];
const STATUS_FLOW: TicketStatus[] = ["UNASSIGNED", "IN_PROGRESS", "PENDING", "RESOLVED"];

export default function HelpdeskPage() {
  const { data: tickets, isLoading } = useHelpdeskTickets();
  const { data: agents, isLoading: agentsLoading } = useHelpdeskAgents();
  const updateStatus = useUpdateTicketStatus();
  const { push } = useToast();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("ALL");

  const filtered = useMemo(
    () => (tickets ?? []).filter((t) => category === "ALL" || t.category === category),
    [tickets, category]
  );

  const activeCount = (tickets ?? []).filter((t) => t.status !== "RESOLVED").length;
  const avgResponse = (() => {
    const withResponse = (tickets ?? []).filter((t) => t.firstResponseMinutes != null);
    if (withResponse.length === 0) return null;
    return Math.round(withResponse.reduce((s, t) => s + (t.firstResponseMinutes ?? 0), 0) / withResponse.length);
  })();
  const resolutionRate = tickets && tickets.length > 0
    ? Math.round((tickets.filter((t) => t.status === "RESOLVED").length / tickets.length) * 100)
    : null;

  const advanceStatus = async (id: string, current: TicketStatus) => {
    const idx = STATUS_FLOW.indexOf(current);
    const next = STATUS_FLOW[idx + 1];
    if (!next) return;
    try {
      await updateStatus.mutateAsync({ id, status: next });
      push(`Ticket moved to ${next.replace("_", " ")}.`);
    } catch {
      push("Couldn't update the ticket.", "error");
    }
  };

  return (
    <div>
      <PageHeader title="Helpdesk" description="Internal support queue across billing, technical, security & general requests." />

      <div className="grid grid-cols-1 gap-widget-gap sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active Tickets" value={isLoading ? "\u2014" : String(activeCount)} icon={Headset} />
        <StatCard label="Avg. First Response" value={avgResponse ? `${avgResponse}m` : "\u2014"} icon={Clock3} />
        <StatCard label="Resolution Rate" value={resolutionRate != null ? `${resolutionRate}%` : "\u2014"} icon={CheckCircle2} />
        <StatCard
          label="Unassigned"
          value={isLoading ? "\u2014" : String((tickets ?? []).filter((t) => t.status === "UNASSIGNED").length)}
          icon={AlertOctagon}
        />
      </div>

      <div className="mt-widget-gap grid grid-cols-1 gap-widget-gap xl:grid-cols-3">
        <Tile className="xl:col-span-2">
          <TileHeader
            title="Ticket queue"
            action={
              <Select value={category} onChange={(e) => setCategory(e.target.value as typeof category)} className="w-40">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c === "ALL" ? "All departments" : c.charAt(0) + c.slice(1).toLowerCase()}
                  </option>
                ))}
              </Select>
            }
          />
          {isLoading ? (
            <TileSkeleton rows={5} />
          ) : filtered.length === 0 ? (
            <EmptyState icon={Headset} title="No tickets in this department" />
          ) : (
            <Table>
              <THead>
                <TH>Ticket</TH>
                <TH>Priority</TH>
                <TH>Status</TH>
                <TH>Agent</TH>
                <TH className="text-right">Updated</TH>
              </THead>
              <TBody>
                {filtered.map((t) => (
                  <TR key={t.id} onClick={() => advanceStatus(t.id, t.status)}>
                    <TD>
                      <p className="font-medium text-on-surface">{t.subject}</p>
                      <p className="text-body-sm text-on-surface-variant">
                        {t.ticketNumber} &middot; {t.requesterName}
                      </p>
                    </TD>
                    <TD>
                      <Badge tone={TICKET_PRIORITY_TONE[t.priority]}>{t.priority}</Badge>
                    </TD>
                    <TD>
                      <Badge tone={TICKET_STATUS_TONE[t.status]} dot>
                        {t.status.replace("_", " ")}
                      </Badge>
                    </TD>
                    <TD>{t.assignedAgentName ?? <span className="text-on-surface-variant">Unassigned</span>}</TD>
                    <TD className="text-right text-body-sm text-on-surface-variant">{formatRelativeTime(t.updatedAt)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
          <p className="mt-3 text-label-md text-on-surface-variant">Click a row to advance it to the next status.</p>
        </Tile>

        <Tile>
          <TileHeader title="Agent performance" />
          {agentsLoading ? (
            <TileSkeleton rows={3} />
          ) : (
            <ul className="space-y-4">
              {(agents ?? []).map((a) => (
                <li key={a.id} className="flex items-center gap-3">
                  <Avatar name={a.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body-base text-on-surface">{a.name}</p>
                    <p className="text-body-sm text-on-surface-variant">
                      {a.activeTickets} active &middot; {a.avgResponseMinutes.toFixed(1)}m avg
                    </p>
                  </div>
                  <Badge
                    tone={a.rating === "EXCELLENT" ? "success" : a.rating === "GOOD" ? "info" : "warning"}
                  >
                    {a.rating.replace("_", " ")}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Tile>
      </div>
    </div>
  );
}
