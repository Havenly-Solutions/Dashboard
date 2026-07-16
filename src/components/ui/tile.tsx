import { cn } from "@/lib/utils";

export function Tile({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("tile p-container-padding", className)} {...props}>
      {children}
    </div>
  );
}

export function TileHeader({
  title,
  action,
  subtitle,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h3 className="text-headline-md text-on-surface">{title}</h3>
        {subtitle && <p className="mt-0.5 text-body-sm text-on-surface-variant">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
