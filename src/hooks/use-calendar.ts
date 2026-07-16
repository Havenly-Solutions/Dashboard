"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  startDateTime: string;
  endDateTime: string;
  allDay: boolean;
  department: "MEDIA" | "DEVELOPER" | "CYBERSECURITY" | "ALL";
  visibility: "DEPARTMENT" | "MANAGER" | "FOUNDER";
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export const calendarKeys = {
  all: ["calendar"] as const,
  events: (filters: any) => [...calendarKeys.all, "events", filters] as const,
};

export function useCalendarEvents(filters: { department?: string; from?: string; to?: string } = {}) {
  return useQuery({
    queryKey: calendarKeys.events(filters),
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.department) params.append("department", filters.department);
      if (filters.from) params.append("from", filters.from);
      if (filters.to) params.append("to", filters.to);
      return api.get<CalendarEvent[]>(`/calendar?${params.toString()}`);
    },
    enabled: !!filters.from && !!filters.to,
  });
}
