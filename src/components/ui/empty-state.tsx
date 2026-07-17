import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-outline-variant px-6 py-14 text-center">
      <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <p className="text-body-base font-medium text-on-surface">{title}</p>
      {description && <p className="mt-1 max-w-sm text-body-sm text-on-surface-variant">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
