import { cn } from "@/lib/utils";
import { initials } from "@/lib/utils";

export function Avatar({ name, size = "md", className }: { name: string; size?: "sm" | "md" | "lg"; className?: string }) {
  const sizes = { sm: "h-7 w-7 text-[10px]", md: "h-9 w-9 text-label-md", lg: "h-12 w-12 text-body-base" };
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-secondary-container font-semibold text-on-secondary-container",
        sizes[size],
        className
      )}
    >
      {initials(name)}
    </span>
  );
}
