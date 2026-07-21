import { cn } from "@/lib/utils";

type Tone = "critical" | "warning" | "success" | "info" | "neutral" | "secondary";

const toneClasses: Record<Tone, string> = {
  critical: "bg-critical text-white",
  warning: "bg-warning text-white",
  success: "bg-success text-white",
  info: "bg-info text-white",
  neutral: "bg-surface-container-high text-on-surface-variant",
  secondary: "bg-secondary text-white",
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
  critical: "bg-white",
  warning: "bg-white",
  success: "bg-white",
  info: "bg-white",
  neutral: "bg-on-surface-variant",
  secondary: "bg-white",
};
