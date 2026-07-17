import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

function checks(password: string) {
  return [
    { label: "At least 10 characters", pass: password.length >= 10 },
    { label: "One uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "One number", pass: /[0-9]/.test(password) },
  ];
}

export function PasswordStrengthHint({ password }: { password: string }) {
  if (!password) return null;
  const items = checks(password);
  return (
    <ul className="mt-2 space-y-1">
      {items.map((c) => (
        <li key={c.label} className={cn("flex items-center gap-1.5 text-label-md", c.pass ? "text-success" : "text-on-surface-variant")}>
          {c.pass ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
          {c.label}
        </li>
      ))}
    </ul>
  );
}
