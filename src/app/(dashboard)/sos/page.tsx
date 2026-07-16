"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, Radio, Timer, Users2, CheckCircle2, PhoneCall } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Tile, TileHeader } from "@/components/ui/tile";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { TileSkeleton, Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useSosEvents, useSosLog, useUpdateSosStatus } from "@/hooks/use-sos";
import { SOS_STATUS_LABEL, SOS_STATUS_TONE } from "@/components/sos/status";
import { formatClock, formatDuration, formatRelativeTime } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import type { SosEvent, SosStatus } from "@/types";

// mapbox-gl is a ~500KB library and touches `window` directly \u2014 load it only
// on the client, only when this page renders, so it never blocks or bloats
// any other route's bundle.
const IncidentMap = dynamic(() => import("@/components/sos/incident-map").then((m) => m.IncidentMap), {
  ssr: false,
  loading: () => <Skeleton className="h-full min-h-[320px] w-full rounded-lg" />,
});

const NEXT_STATUS: Partial<Record<SosStatus, SosStatus>> = {
  PENDING: "ACTIVE",
  ACTIVE: "RESOLVED",
};
const NEXT_STATUS_LABEL: Partial<Record<SosStatus, string>> = {
  PENDING: "Dispatch",
  ACTIVE: "Mark resolved",
};

export default function SosCommandPage() {
  const { data: events, isLoading } = useSosEvents();
  const { data: log, isLoading: logLoading } = useSosLog();
  const updateStatus = useUpdateSosStatus();
  const { push } = useToast();
  const [selected, setSelected] = useState<SosEvent | null>(null);

  const active = (events ?? []).filter((e) => e.status === "ACTIVE");
  const pending = (events ?? []).filter((e) => e.status === "PENDING");
  const responding = (events ?? []).filter((e) => e.responderId).length;
  const avgResponse = (() => {
    const withTimes = (events ?? []).filter((e) => e.responseTimeSeconds != null);
    if (withTimes.length === 0) return null;
    return withTimes.reduce((sum, e) => sum + (e.responseTimeSeconds ?? 0), 0) / withTimes.length;
  })();

  const handleAdvance = async (event: SosEvent) => {
    const next = NEXT_STATUS[event.status];
    if (!next) return;
    try {
      await updateStatus.mutateAsync({ id: event.id, status: next });
      push(`${event.reference} moved to ${SOS_STATUS_LABEL[next]}.`);
    } catch {
      push("Couldn't update the incident. Try again.", "error");
    }
  };

  return (
    <div>
      <PageHeader
        title="Live SOS Command"
        description="Real-time panic button, sensor, and system alerts across the network."
      />

      <div className="grid grid-cols-1 gap-widget-gap sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active Incidents" value={isLoading ? "\u2014" : String(active.length)} icon={Radio} />
        <StatCard label="Pending Triage" value={isLoading ? "\u2014" : String(pending.length)} icon={Timer} />
        <StatCard label="Units Responding" value={isLoading ? "\u2014" : String(responding)} icon={Users2} />
        <StatCard
          label="Avg Response Time"
          value={avgResponse ? formatDuration(avgResponse) : "\u2014"}
          icon={CheckCircle2}
        />
      </div>

      <div className="mt-widget-gap grid grid-cols-1 gap-widget-gap xl:grid-cols-3">
        <Tile className="flex flex-col xl:col-span-2">
          <TileHeader title="Incident Map" subtitle="Live positions \u2014 click a marker or row to see details" />
          <div className="min-h-[320px] flex-1">
            <IncidentMap events={events ?? []} selectedId={selected?.id} onSelect={setSelected} />
          </div>
        </Tile>

        <Tile className="flex flex-col">
          <TileHeader title="Comms Log" subtitle="Dispatch, responder & system messages" />
          {logLoading ? (
            <TileSkeleton rows={5} />
          ) : (
            <ul className="scroll-thin -mx-1 max-h-[420px] flex-1 space-y-3 overflow-y-auto px-1">
              {(log ?? []).map((entry) => (
                <li key={entry.id} className="flex gap-2.5">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                    <PhoneCall className="h-3 w-3" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-body-sm text-on-surface">{entry.message}</p>
                    <p className="text-label-md text-on-surface-variant">
                      {entry.channel} &middot; {formatClock(entry.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Tile>
      </div>

      <div className="mt-widget-gap">
        <Tile>
          <TileHeader title="Incident Queue" subtitle="Sorted by most recent activity" />
          {isLoading ? (
            <TileSkeleton rows={5} />
          ) : !events || events.length === 0 ? (
            <EmptyState icon={Radio} title="No incidents on record" description="New SOS alerts will appear here in real time." />
          ) : (
            <Table>
              <THead>
                <TH>Reference / Source</TH>
                <TH>Status</TH>
                <TH>Response</TH>
                <TH>Responder</TH>
                <TH className="text-right">Action</TH>
              </THead>
              <TBody>
                {events.map((e) => (
                  <TR key={e.id} onClick={() => setSelected(e)}>
                    <TD>
                      <p className="font-medium text-on-surface">{e.title}</p>
                      <p className="text-body-sm text-on-surface-variant">
                        {e.reference} &middot; {e.source}
                      </p>
                    </TD>
                    <TD>
                      <Badge tone={SOS_STATUS_TONE[e.status]} dot>
                        {SOS_STATUS_LABEL[e.status]}
                      </Badge>
                    </TD>
                    <TD>
                      {e.responseTimeSeconds != null ? (
                        <span
                          className={
                            e.responseTimeSeconds > e.slaTargetSeconds ? "text-critical" : "text-on-surface"
                          }
                        >
                          {formatDuration(e.responseTimeSeconds)}
                        </span>
                      ) : (
                        <span className="text-on-surface-variant">
                          Target {formatDuration(e.slaTargetSeconds)}
                        </span>
                      )}
                    </TD>
                    <TD>{e.responderName ?? <span className="text-on-surface-variant">Unassigned</span>}</TD>
                    <TD className="text-right">
                      {NEXT_STATUS[e.status] ? (
                        <Button
                          size="sm"
                          variant={e.status === "PENDING" ? "secondary" : "primary"}
                          onClick={(ev) => {
                            ev.stopPropagation();
                            handleAdvance(e);
                          }}
                          loading={updateStatus.isPending && updateStatus.variables?.id === e.id}
                        >
                          {NEXT_STATUS_LABEL[e.status]}
                        </Button>
                      ) : (
                        <span className="text-body-sm text-on-surface-variant">
                          {formatRelativeTime(e.updatedAt)}
                        </span>
                      )}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </Tile>
      </div>

      {selected && (
        <Tile className="mt-widget-gap">
          <TileHeader
            title={`${selected.reference} \u2014 ${selected.title}`}
            subtitle="Incident detail"
            action={
              <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
                Close
              </Button>
            }
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-on-surface-variant" />
              <div>
                <p className="text-label-caps text-on-surface-variant">Location</p>
                <p className="text-body-base text-on-surface">{selected.address ?? "Coordinates only"}</p>
                <p className="text-body-sm text-on-surface-variant">
                  {selected.latitude.toFixed(4)}, {selected.longitude.toFixed(4)}
                </p>
              </div>
            </div>
            <div>
              <p className="text-label-caps text-on-surface-variant">Reported</p>
              <p className="text-body-base text-on-surface">{formatRelativeTime(selected.createdAt)}</p>
            </div>
            <div>
              <p className="text-label-caps text-on-surface-variant">SLA target</p>
              <p className="text-body-base text-on-surface">{formatDuration(selected.slaTargetSeconds)}</p>
            </div>
          </div>
        </Tile>
      )}
    </div>
  );
}
