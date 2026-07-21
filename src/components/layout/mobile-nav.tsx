"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { NAV_MODULES, PORTALS, ROLE_HOME, ROLE_LABELS, type NavModule } from "@/lib/rbac";
import { NavIcon } from "@/components/icons/nav-icon";
import { useAuth } from "@/lib/auth-context";
import { useEffectiveModules } from "@/hooks/use-access-control";
import { useSosActiveCount } from "@/hooks/use-sos";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const GROUP_ORDER: NavModule["group"][] = ["Command", "Operations", "Growth", "Organization"];

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, isSimulating, realUser } = useAuth();
  const pathname = usePathname();
  const { data: effectiveModulesRaw } = useEffectiveModules(user?.id);
  const activeSosCount = useSosActiveCount();

  const userRole = user?.role || ("PA" as const);
  const fallbackModules = NAV_MODULES.filter((m) => m.roles.includes(userRole));
  const effectiveModules = (effectiveModulesRaw as any[])?.length
    ? (effectiveModulesRaw as any[])
    : fallbackModules;

  const modules =
    isSimulating && realUser?.role === "FOUNDER" && !effectiveModules.some((m: any) => m.key === "portal-switcher")
      ? [NAV_MODULES.find((m) => m.key === "portal-switcher")!, ...effectiveModules]
      : effectiveModules;

  const visibleModules = modules.filter((m: any) => !m.hideFromNav);
  const portalName = user ? PORTALS.find((p) => p.role === user.role)?.name ?? "Command Center" : "Command Center";
  const portalHome = user ? ROLE_HOME[user.role] : "/overview";

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 lg:hidden transition-opacity duration-200",
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer panel */}
      <div
        className={cn(
          "absolute inset-y-0 left-0 flex w-72 flex-col bg-surface-container-lowest shadow-2xl transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-outline-variant px-4">
          <Link href={portalHome} onClick={onClose} className="flex items-center gap-2.5">
            <Image src="/havenly-logo.png" alt="Havenly Solutions" width={26} height={26} className="rounded" />
            <div className="leading-tight">
              <p className="text-body-base font-semibold text-on-surface">Havenly</p>
              <p className="text-label-md text-on-surface-variant">{portalName}</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav groups */}
        <nav className="scroll-thin flex-1 overflow-y-auto px-3 py-4">
          {GROUP_ORDER.map((group) => {
            const items = visibleModules.filter((m: any) => m.group === group);
            if (items.length === 0) return null;
            return (
              <div key={group} className="mb-5">
                <p className="mb-1.5 px-3 text-label-caps text-on-surface-variant/80">{group}</p>
                <ul className="space-y-0.5">
                  {items.map((item: any) => {
                    const active = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                      <li key={item.key}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className={cn(
                            "flex items-center gap-3 rounded px-3 py-2.5 text-body-base transition-colors",
                            active
                              ? "active-nav-glow bg-secondary/10 font-medium text-secondary"
                              : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                          )}
                        >
                          <NavIcon name={item.icon} className="h-[18px] w-[18px] shrink-0" />
                          <span className="flex-1">{item.label}</span>
                          {item.key === "sos" && activeSosCount > 0 && (
                            <Badge tone="critical">{activeSosCount}</Badge>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* User footer */}
        {user && (
          <div className="border-t border-outline-variant p-3">
            <div className="flex items-center gap-2 rounded px-2 py-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-container text-label-md font-semibold text-on-secondary-container">
                {(realUser ?? user).name.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-body-sm font-medium text-on-surface">{(realUser ?? user).name}</p>
                <p className="truncate text-label-md text-on-surface-variant">
                  {isSimulating
                    ? `${ROLE_LABELS[realUser!.role]} — previewing ${ROLE_LABELS[user.role]}`
                    : ROLE_LABELS[user.role]}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
