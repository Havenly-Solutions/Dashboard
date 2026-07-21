"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { NAV_MODULES, ROLE_LABELS, ROLE_HOME, PORTALS, type NavModule } from "@/lib/rbac";
import { NavIcon } from "@/components/icons/nav-icon";
import { useAuth } from "@/lib/auth-context";
import { useEffectiveModules } from "@/hooks/use-access-control";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useSosActiveCount } from "@/hooks/use-sos";

const GROUP_ORDER: NavModule["group"][] = ["Command", "Operations", "Growth", "Organization"];

export function Sidebar() {
  const { user, isSimulating, realUser } = useAuth();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: effectiveModulesRaw } = useEffectiveModules(user?.id);

  // Fallback to NAV_MODULES filtered by role if effectiveModules fails/is empty
  const userRole = user?.role || ("PA" as const);
  const fallbackModules = NAV_MODULES.filter((m) => m.roles.includes(userRole));
  const effectiveModules = (effectiveModulesRaw as any[])?.length ? (effectiveModulesRaw as any[]) : fallbackModules;

  const modules =
    isSimulating && realUser?.role === "FOUNDER" && !effectiveModules.some((m: any) => m.key === "portal-switcher")
      ? [NAV_MODULES.find((m: any) => m.key === "portal-switcher")!, ...effectiveModules]
      : effectiveModules;

  const visibleModules = modules.filter((m: any) => !m.hideFromNav);
  const activeSosCount = useSosActiveCount();
  const portalName = user ? PORTALS.find((p) => p.role === user.role)?.name ?? "Command Center" : "Command Center";
  const portalHome = user ? ROLE_HOME[user.role] : "/overview";

  return (
    <aside
      className={cn(
        "relative hidden flex-col border-r border-outline-variant bg-surface-container-lowest transition-all duration-300 lg:flex",
        isCollapsed ? "w-[72px]" : "w-64"
      )}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-outline-variant bg-surface-container-lowest text-on-surface shadow-sm hover:bg-surface-container-low"
      >
        {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      <Link
        href={portalHome}
        className={cn(
          "flex h-16 items-center border-b border-outline-variant px-5 hover:bg-surface-container-low",
          isCollapsed ? "justify-center px-0" : "gap-2.5"
        )}
      >
        <Image src="/havenly-logo.png" alt="Havenly Solutions" width={28} height={28} className="rounded" />
        {!isCollapsed && (
          <div className="min-w-0 leading-tight">
            <p className="truncate text-body-base font-semibold text-on-surface">Havenly</p>
            <p className="truncate text-label-md text-on-surface-variant">{portalName}</p>
          </div>
        )}
      </Link>

      <nav data-tour="sidebar-nav" className="scroll-thin flex-1 overflow-y-auto px-3 py-4">
        {GROUP_ORDER.map((group) => {
          const items = visibleModules.filter((m: any) => m.group === group);
          if (items.length === 0) return null;
          return (
            <div key={group} className="mb-5">
              {!isCollapsed && (
                <p className="mb-1.5 px-3 text-label-caps text-on-surface-variant/80">{group}</p>
              )}
              <ul className="space-y-0.5">
                {items.map((item: any) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <li key={item.key}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center rounded px-3 py-2 text-body-base transition-colors",
                          active
                            ? "active-nav-glow bg-secondary/10 font-medium text-secondary"
                            : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface",
                          isCollapsed ? "justify-center" : "gap-3"
                        )}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <NavIcon name={item.icon} className="h-[18px] w-[18px] shrink-0" />
                        {!isCollapsed && <span className="flex-1">{item.label}</span>}
                        {item.key === "sos" && activeSosCount > 0 && (
                          <Badge tone="critical" className={cn(isCollapsed && "absolute right-2 top-2 h-2 w-2 p-0 min-w-0")}>
                            {isCollapsed ? "" : activeSosCount}
                          </Badge>
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

      {user && (
        <div className="border-t border-outline-variant p-3">
          <div className={cn("flex items-center rounded py-2", isCollapsed ? "justify-center px-0" : "gap-2 px-2")}>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-container text-label-md font-semibold text-on-secondary-container">
              {(realUser ?? user).name.slice(0, 1).toUpperCase()}
            </span>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-body-sm font-medium text-on-surface">{(realUser ?? user).name}</p>
                <p className="truncate text-label-md text-on-surface-variant">
                  {isSimulating ? `${ROLE_LABELS[realUser!.role]} — previewing ${ROLE_LABELS[user.role]}` : ROLE_LABELS[user.role]}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}

export { NAV_MODULES };
