"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/security/campaigns", label: "Phishing Campaigns" },
  { href: "/security/training", label: "Training Library" },
  { href: "/security/leaderboard", label: "Leaderboard" },
  { href: "/security/breach-logs", label: "Breach Logs" },
];

export default function SecurityLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div>
      <PageHeader
        title="Security Suite"
        description="Internal security posture \u2014 GoPhish simulations, CTFd training, and breach monitoring."
      />
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-outline-variant">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "whitespace-nowrap border-b-2 px-4 py-2.5 text-body-sm font-medium transition-colors",
                active
                  ? "border-secondary text-secondary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
      {children}
    </div>
  );
}
