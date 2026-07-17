"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bell, Moon, Sun, Search, LogOut, ChevronDown, UserCog, Menu, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-provider";
import { ROLES, ROLE_LABELS, landingPathForRole } from "@/lib/rbac";
import { useSosActiveCount } from "@/hooks/use-sos";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { MobileNav } from "@/components/layout/mobile-nav";
import { GlobalSearch } from "@/components/layout/global-search";
import { useClickOutside } from "@/hooks/use-click-outside";
import type { Role } from "@/types";

import { useNotifications, useMarkNotificationRead } from "@/hooks/use-notifications";

export function Topbar() {
  const { user, logout, isSimulating, realUser, switchRole, exitSimulation } = useAuth();
  const { theme, toggle } = useTheme();
  const router = useRouter();

  const [profileOpen, setProfileOpen] = useState(false);
  const [roleSwitchOpen, setRoleSwitchOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const roleSwitchRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useClickOutside(profileRef, () => setProfileOpen(false));
  useClickOutside(roleSwitchRef, () => setRoleSwitchOpen(false));
  useClickOutside(notificationsRef, () => setNotificationsOpen(false));

  const [switching, setSwitching] = useState<Role | null>(null);
  const activeSos = useSosActiveCount();
  const { data: notifications } = useNotifications();
  const markRead = useMarkNotificationRead();

  const unreadCount = (notifications ?? []).filter((n: any) => !n.isRead).length;

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-outline-variant bg-surface-container-lowest px-4 sm:px-6">
      <button
        className="rounded p-2 text-on-surface-variant hover:bg-surface-container-low lg:hidden"
        onClick={() => setMobileNavOpen(true)}
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>
      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <GlobalSearch placeholder={user?.role === "FOUNDER" ? "Search everything..." : "Search tickets, SOS refs..."} />

      <div data-tour="topbar-utility" className="ml-auto flex items-center gap-1.5">
        {isSimulating && realUser && (
          <button
            onClick={() => {
              exitSimulation();
              router.push(landingPathForRole(realUser.role));
            }}
            className="flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1.5 text-label-md font-medium text-warning hover:bg-warning/25"
          >
            <LogOut className="h-3.5 w-3.5" />
            Exit preview
          </button>
        )}

        {/* Founder test-mode role switcher — mirrors POST /admin/test-mode/switch-role */}
        {(user?.role === "FOUNDER" || (isSimulating && realUser?.role === "FOUNDER")) && (
          <div className="relative" ref={roleSwitchRef}>
            <button
              onClick={() => setRoleSwitchOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-full border border-outline-variant px-3 py-1.5 text-label-md text-on-surface-variant hover:bg-surface-container-low"
            >
              <UserCog className="h-3.5 w-3.5" />
              Viewing as {user ? ROLE_LABELS[user.role] : ""}
              <ChevronDown className="h-3 w-3" />
            </button>
            {roleSwitchOpen && (
              <div className="absolute right-0 z-20 mt-2 w-52 rounded-lg border border-outline-variant bg-surface-container-lowest p-1.5 shadow-tile-hover">
                <p className="px-2.5 py-1.5 text-label-caps text-on-surface-variant">Simulate portal</p>
                {ROLES.map((r) => (
                  <button
                    key={r}
                    disabled={switching === r}
                    onClick={async () => {
                      setRoleSwitchOpen(false);
                      setSwitching(r);
                      try {
                        const simulatedUser = await switchRole(r);
                        router.push(landingPathForRole(simulatedUser.role));
                      } finally {
                        setSwitching(null);
                      }
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded px-2.5 py-1.5 text-left text-body-sm hover:bg-surface-container-low",
                      user?.role === r ? "font-medium text-secondary" : "text-on-surface"
                    )}
                  >
                    {ROLE_LABELS[r]}
                    {switching === r && <Loader2 className="h-3 w-3 animate-spin" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low"
        >
          {theme === "light" ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
        </button>

        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setNotificationsOpen((v) => !v)}
            aria-label="Notifications"
            className="relative rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low"
          >
            <Bell className="h-[18px] w-[18px]" />
            {(activeSos > 0 || unreadCount > 0) && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-critical text-[10px] font-semibold text-white">
                {activeSos + unreadCount}
              </span>
            )}
          </button>
          {notificationsOpen && (
            <div className="absolute right-0 z-20 mt-2 w-80 rounded-lg border border-outline-variant bg-surface-container-lowest p-1.5 shadow-tile-hover">
              <div className="border-b border-outline-variant px-3 py-2 flex justify-between items-center">
                <p className="text-body-sm font-medium text-on-surface">Notifications</p>
                {activeSos > 0 && <Badge tone="critical">{activeSos} SOS Active</Badge>}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {activeSos > 0 && (
                  <button
                    onClick={() => {
                      setNotificationsOpen(false);
                      router.push("/sos");
                    }}
                    className="flex w-full items-start gap-3 border-b border-outline-variant/60 bg-critical/5 p-3 text-left hover:bg-critical/10"
                  >
                    <div className="mt-1 rounded-full bg-critical p-1 text-white">
                      <Bell className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-body-sm font-semibold text-critical">Active SOS Incidents</p>
                      <p className="text-label-md text-on-surface-variant">{activeSos} incidents requiring attention</p>
                    </div>
                  </button>
                )}
                {notifications?.length === 0 && !activeSos ? (
                  <p className="p-6 text-center text-body-sm text-on-surface-variant">No notifications</p>
                ) : (
                  notifications?.map((n: any) => (
                    <button
                      key={n.id}
                      onClick={() => {
                        if (!n.isRead) markRead.mutate(n.id);
                        setNotificationsOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-start gap-3 border-b border-outline-variant/60 p-3 text-left hover:bg-surface-container-low",
                        !n.isRead && "bg-secondary/5"
                      )}
                    >
                      <div className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.isRead ? "bg-outline" : "bg-secondary")} />
                      <div className="min-w-0 flex-1">
                        <p className={cn("truncate text-body-sm", !n.isRead ? "font-semibold text-on-surface" : "text-on-surface-variant")}>
                          {n.title}
                        </p>
                        <p className="line-clamp-2 text-label-md text-on-surface-variant">{n.message}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-surface-container-low"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-container text-label-md font-semibold text-on-secondary-container">
              {user?.name?.slice(0, 1).toUpperCase() ?? "?"}
            </span>
            <ChevronDown className="hidden h-3.5 w-3.5 text-on-surface-variant sm:block" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-outline-variant bg-surface-container-lowest p-1.5 shadow-tile-hover">
              <div className="border-b border-outline-variant px-3 py-2">
                <p className="text-body-sm font-medium text-on-surface">{user?.name}</p>
                <p className="truncate text-label-md text-on-surface-variant">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setProfileOpen(false);
                  router.push("/settings");
                }}
                className="mt-1 flex w-full items-center gap-2 rounded px-3 py-2 text-left text-body-sm text-on-surface hover:bg-surface-container-low"
              >
                <UserCog className="h-4 w-4" /> Account settings
              </button>
              <button
                onClick={() => logout()}
                className={cn(
                  "flex w-full items-center gap-2 rounded px-3 py-2 text-left text-body-sm text-critical hover:bg-error-container/40"
                )}
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
