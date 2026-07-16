"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useFinanceSnapshot() {
  return useQuery({
    queryKey: ["finance", "snapshot"],
    queryFn: () => api.get("/analytics/finance"),
  });
}
