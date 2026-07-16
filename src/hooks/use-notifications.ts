"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationKeys = { all: ["notifications"] as const };

export function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.all,
    queryFn: () => api.get<Notification[]>("/notifications"),
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSettled: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}
