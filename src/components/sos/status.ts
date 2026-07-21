import type { SosStatus } from "@/types";

export const SOS_STATUS_TONE: Record<SosStatus, "critical" | "warning" | "success" | "neutral"> = {
  PENDING: "warning",
  ACTIVE: "critical",
  RESOLVED: "success",
  FALSE_ALARM: "neutral",
};

export const SOS_STATUS_LABEL: Record<SosStatus, string> = {
  PENDING: "Pending",
  ACTIVE: "Active",
  RESOLVED: "Resolved",
  FALSE_ALARM: "False alarm",
};
