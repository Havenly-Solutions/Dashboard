"use client";

import { useState } from "react";
import { type LucideIcon, Edit2, Check, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useUpdateTarget } from "@/hooks/use-growth";
import { formatPercent } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ProgressStatCardProps {
  label: string;
  value: number;
  target: number;
  targetKey: "PRE_REGISTRATION" | "PARTNERS";
  icon?: LucideIcon;
}

export function ProgressStatCard({ label, value, target, targetKey, icon: Icon }: ProgressStatCardProps) {
  const { user } = useAuth();
  const updateTarget = useUpdateTarget();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(target.toString());

  const isFounder = user?.role === "FOUNDER";
  const progress = Math.min((value / target) * 100, 100);

  const handleSave = () => {
    const val = parseInt(editValue);
    if (!isNaN(val) && val > 0) {
      updateTarget.mutate({ key: targetKey, value: val }, {
        onSuccess: () => setIsEditing(false),
      });
    }
  };

  return (
    <div className="tile p-container-padding">
      <div className="flex items-center justify-between">
        <span className="text-label-caps text-on-surface-variant">{label}</span>
        {Icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/10 text-secondary">
            <Icon className="h-4 w-4" strokeWidth={1.75} />
          </span>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-stat-xl font-bold text-on-surface">{value}</span>
        <span className="text-body-sm text-on-surface-variant">/</span>
        {isEditing ? (
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-20 rounded border border-outline bg-surface px-1 text-stat-lg"
              autoFocus
            />
            <button onClick={handleSave} className="text-success hover:bg-success/10 rounded p-1">
              <Check className="h-4 w-4" />
            </button>
            <button onClick={() => setIsEditing(false)} className="text-critical hover:bg-critical/10 rounded p-1">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <span className="text-stat-lg text-on-surface-variant">{target}</span>
            {isFounder && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-on-surface-variant hover:text-secondary opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Edit2 className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-label-sm mb-1">
          <span className="text-on-surface-variant">Progress</span>
          <span className="font-medium text-on-surface">{formatPercent(value / target)}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
          <div
            className="h-full bg-secondary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
