import { cn } from "@/lib/utils";

type Tone = "critical" | "warning" | "success" | "info" | "neutral" | "secondary";

const toneClasses: Record<Tone, string> = {
  critical: "bg-critical/10 text-critical",
  warning: "bg-warning/10 text-warning",
  success: "bg-success/10 text-success",
  info: "bg-info/10 text-info",
  neutral: "bg-surface-container-high text-on-surface-variant",
  secondary: "bg-secondary/10 text-secondary",
};

export function Badge({
  tone = "neutral",
  className,
  children,
  dot,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-label-md font-semibold uppercase tracking-wide",
        toneClasses[tone],
        className
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", toneDotClasses[tone])} />}
      {children}
    </span>
  );
}

const toneDotClasses: Record<Tone, string> = {
  critical: "bg-critical",
  warning: "bg-warning",
  success: "bg-success",
  info: "bg-info",
  neutral: "bg-on-surface-variant",
  secondary: "bg-secondary",
};
