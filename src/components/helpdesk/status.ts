import type { TicketPriority, TicketStatus } from "@/types";

export const TICKET_STATUS_TONE: Record<TicketStatus, "critical" | "warning" | "info" | "success"> = {
  UNASSIGNED: "critical",
  IN_PROGRESS: "info",
  PENDING: "warning",
  RESOLVED: "success",
};

export const TICKET_PRIORITY_TONE: Record<TicketPriority, "critical" | "warning" | "info" | "neutral"> = {
  CRITICAL: "critical",
  HIGH: "warning",
  NORMAL: "info",
  LOW: "neutral",
};
