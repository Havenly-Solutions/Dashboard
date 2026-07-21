"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";
import { AppAnalyticsSnapshot } from "@/types";

export function useAppAnalyticsSnapshot(range: string = "30d") {
  return useQuery({
    queryKey: ["analytics", "app", range],
    queryFn: () =>
      apiRequest<AppAnalyticsSnapshot>(`/api/v1/dashboard/analytics/app?range=${range}`),
    staleTime: 60_000,
  });
}
