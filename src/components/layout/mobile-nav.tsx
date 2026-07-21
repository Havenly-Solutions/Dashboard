"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { NAV_MODULES, PORTALS, ROLE_HOME } from "@/lib/rbac";
import { NavIcon } from "@/components/icons/nav-icon";
import { useAuth } from "@/lib/auth-context";
import { useEffectiveModules } from "@/hooks/use-access-control";
import { cn } from "@/lib/utils";

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, isSimulating, realUser } = useAuth();
  const pathname = usePathname();
  const effectiveModules = useEffectiveModules();
  const modules =
    isSimulating && realUser?.role === "FOUNDER" && !effectiveModules.some((m) => m.key === "portal-switcher")
      ? [NAV_MODULES.find((m) => m.key === "portal-switcher")!, ...effectiveModules]
      : effectiveModules;
  const visibleModules = modules.filter((m) => !m.hideFromNav);
  const portalName = user ? PORTALS.find((p) => p.role === user.role)?.name ?? "Command Center" : "Command Center";
  const portalHome = user ? ROLE_HOME[user.role] : "/overview";

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-surface-container-lowest">
        <div className="flex h-16 items-center justify-between border-b border-outline-variant px-4">
          <Link href={portalHome} onClick={onClose} className="flex items-center gap-2.5">
            <Image src="/havenly-logo.png" alt="Havenly Solutions" width={26} height={26} className="rounded" />
            <div className="leading-tight">
              <p className="text-body-base font-semibold text-on-surface">Havenly</p>
              <p className="text-label-md text-on-surface-variant">{portalName}</p>
            </div>
          </Link>
          <button onClick={onClose} className="rounded p-1.5 text-on-surface-variant hover:bg-surface-container-low">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="scroll-thin flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-0.5">
            {visibleModules.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded px-3 py-2.5 text-body-base",
                      active ? "bg-secondary/10 font-medium text-secondary" : "text-on-surface-variant"
                    )}
                  >
                    <NavIcon name={item.icon} className="h-[18px] w-[18px]" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
