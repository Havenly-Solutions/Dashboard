"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRequestWithFallback } from "@/lib/api-client";
import { mockFinanceSnapshot } from "@/lib/mock-data";

export function useFinanceSnapshot() {
  return useQuery({
    queryKey: ["finance", "snapshot"],
    queryFn: () => apiRequestWithFallback("/api/dashboard/analytics/finance", mockFinanceSnapshot),
  });
}
