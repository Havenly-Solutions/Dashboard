import { cn } from "@/lib/utils";

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse text-left">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-outline-variant">{children}</tr>
    </thead>
  );
}

export function TH({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn("whitespace-nowrap px-3 py-2.5 text-label-caps text-on-surface-variant", className)}>
      {children}
    </th>
  );
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-outline-variant/60">{children}</tbody>;
}

export function TR({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      className={cn("transition-colors", onClick && "cursor-pointer hover:bg-surface-container-low", className)}
    >
      {children}
    </tr>
  );
}

export function TD({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-3 py-3 text-body-base text-on-surface", className)}>{children}</td>;
}
