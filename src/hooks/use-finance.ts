"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";
import { FinanceSnapshot } from "@/types";

export function useFinanceSnapshot() {
  return useQuery({
    queryKey: ["finance-snapshot"],
    queryFn: () => apiRequest<FinanceSnapshot>("/api/v1/dashboard/analytics/finance"),
  });
}
