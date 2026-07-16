"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
  const effectiveModules = useEffectiveModules();
  const modules =
    isSimulating && realUser?.role === "FOUNDER" && !effectiveModules.some((m) => m.key === "portal-switcher")
      ? [NAV_MODULES.find((m) => m.key === "portal-switcher")!, ...effectiveModules]
      : effectiveModules;
  const visibleModules = modules.filter((m) => !m.hideFromNav);
  const activeSosCount = useSosActiveCount();
  const portalName = user ? PORTALS.find((p) => p.role === user.role)?.name ?? "Command Center" : "Command Center";
  const portalHome = user ? ROLE_HOME[user.role] : "/overview";

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-outline-variant bg-surface-container-lowest lg:flex">
      <Link href={portalHome} className="flex h-16 items-center gap-2.5 border-b border-outline-variant px-5 hover:bg-surface-container-low">
        <Image src="/havenly-logo.png" alt="Havenly Solutions" width={28} height={28} className="rounded" />
        <div className="min-w-0 leading-tight">
          <p className="truncate text-body-base font-semibold text-on-surface">Havenly</p>
          <p className="truncate text-label-md text-on-surface-variant">{portalName}</p>
        </div>
      </Link>

      <nav data-tour="sidebar-nav" className="scroll-thin flex-1 overflow-y-auto px-3 py-4">
        {GROUP_ORDER.map((group) => {
          const items = visibleModules.filter((m) => m.group === group);
          if (items.length === 0) return null;
          return (
            <div key={group} className="mb-5">
              <p className="mb-1.5 px-3 text-label-caps text-on-surface-variant/80">{group}</p>
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <li key={item.key}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded px-3 py-2 text-body-base transition-colors",
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

      {user && (
        <div className="border-t border-outline-variant p-3">
          <div className="flex items-center gap-2 rounded px-2 py-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-container text-label-md font-semibold text-on-secondary-container">
              {(realUser ?? user).name.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-body-sm font-medium text-on-surface">{(realUser ?? user).name}</p>
              <p className="truncate text-label-md text-on-surface-variant">
                {isSimulating ? `${ROLE_LABELS[realUser!.role]} \u2014 previewing ${ROLE_LABELS[user.role]}` : ROLE_LABELS[user.role]}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export { NAV_MODULES };
