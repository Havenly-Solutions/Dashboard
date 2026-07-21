"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";

export function useMarketingSnapshot(range: string = "30d", granularity: string = "day") {
  return useQuery({
    queryKey: ["marketing", "snapshot", range, granularity],
    queryFn: () =>
      apiRequest(
        `/api/v1/dashboard/analytics/marketing?range=${range.replace("d", "")}&granularity=${granularity}`
      ),
    staleTime: 60_000,
  });
}
