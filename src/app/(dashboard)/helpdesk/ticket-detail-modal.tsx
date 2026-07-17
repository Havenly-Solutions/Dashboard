"use client";

import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { TICKET_PRIORITY_TONE, TICKET_STATUS_TONE } from "@/components/helpdesk/status";
import { formatRelativeTime } from "@/lib/utils";
import type { HelpdeskTicket } from "@/types";

interface TicketDetailModalProps {
  ticket: HelpdeskTicket | null;
  onClose: () => void;
}

export function TicketDetailModal({ ticket, onClose }: TicketDetailModalProps) {
  if (!ticket) return null;

  return (
    <Modal open={!!ticket} onClose={onClose} title={ticket.subject}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge tone={TICKET_PRIORITY_TONE[ticket.priority]}>{ticket.priority}</Badge>
          <Badge tone={TICKET_STATUS_TONE[ticket.status]} dot>{ticket.status.replace("_", " ")}</Badge>
          <Badge tone="neutral">{ticket.category}</Badge>
        </div>

        <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
          <p className="text-label-caps text-on-surface-variant mb-1">Requester</p>
          <p className="text-body-base font-medium text-on-surface">{ticket.requesterName}</p>
          <p className="text-body-sm text-on-surface-variant">{ticket.requesterEmail}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-label-caps text-on-surface-variant mb-1">Ticket ID</p>
            <p className="text-body-sm text-on-surface font-mono">{ticket.ticketNumber}</p>
          </div>
          <div>
            <p className="text-label-caps text-on-surface-variant mb-1">Raised</p>
            <p className="text-body-sm text-on-surface">{formatRelativeTime(ticket.createdAt)}</p>
          </div>
          <div>
            <p className="text-label-caps text-on-surface-variant mb-1">Assigned Agent</p>
            <p className="text-body-sm text-on-surface">{ticket.assignedAgentName ?? "Unassigned"}</p>
          </div>
          <div>
            <p className="text-label-caps text-on-surface-variant mb-1">SLA Target</p>
            <p className="text-body-sm text-on-surface">{ticket.slaTargetMinutes} minutes</p>
          </div>
        </div>

        {ticket.status === "RESOLVED" && (
          <div className="rounded-lg border border-success/20 bg-success/5 p-4">
            <p className="text-body-sm font-medium text-success">
              Resolved by {ticket.assignedAgentName ?? "System"} at {new Date(ticket.updatedAt).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
