"use client";

import { History } from "lucide-react";
import { Tile, TileHeader } from "@/components/ui/tile";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { TileSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuditLogs } from "@/hooks/use-security";
import { formatRelativeTime } from "@/lib/utils";

export default function AuditLogsPage() {
  const { data: logs, isLoading } = useAuditLogs();

  return (
    <Tile>
      <TileHeader title="System Audit Log" subtitle="Comprehensive record of sensitive actions across the platform" />
      {isLoading ? (
        <TileSkeleton rows={10} />
      ) : !logs || logs.length === 0 ? (
        <EmptyState icon={History} title="No audit logs recorded" />
      ) : (
        <Table>
          <THead>
            <TH>Action</TH>
            <TH>Module</TH>
            <TH>Performed By</TH>
            <TH>IP Address</TH>
            <TH className="text-right">Timestamp</TH>
          </THead>
          <TBody>
            {logs.map((l: any) => (
              <TR key={l.id}>
                <TD>
                  <p className="font-medium text-on-surface">{l.action}</p>
                  <p className="text-body-sm text-on-surface-variant truncate max-w-md">{l.description}</p>
                </TD>
                <TD>{l.module}</TD>
                <TD>
                  {l.users ? (
                    <div>
                      <p className="text-body-sm font-medium text-on-surface">
                        {l.users.firstName} {l.users.surname}
                      </p>
                      <p className="text-label-md text-on-surface-variant">{l.users.role}</p>
                    </div>
                  ) : (
                    <span className="text-on-surface-variant">System</span>
                  )}
                </TD>
                <TD className="font-mono text-label-md">{l.ipAddress || "—"}</TD>
                <TD className="text-right text-label-md text-on-surface-variant">
                  {formatRelativeTime(l.createdAt)}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </Tile>
  );
}
