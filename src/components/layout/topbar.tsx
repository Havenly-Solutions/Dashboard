"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Moon, Sun, Search, LogOut, ChevronDown, UserCog, Menu, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-provider";
import { ROLES, ROLE_LABELS, landingPathForRole } from "@/lib/rbac";
import { useSosActiveCount } from "@/hooks/use-sos";
import { cn } from "@/lib/utils";
import { MobileNav } from "@/components/layout/mobile-nav";
import type { Role } from "@/types";

export function Topbar() {
  const { user, logout, isSimulating, realUser, switchRole, exitSimulation } = useAuth();
  const { theme, toggle } = useTheme();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [roleSwitchOpen, setRoleSwitchOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [switching, setSwitching] = useState<Role | null>(null);
  const activeSos = useSosActiveCount();

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

      <div className="relative hidden max-w-sm flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
        <input
          type="search"
          placeholder="Search tickets, SOS refs, members\u2026"
          className="h-10 w-full rounded-full border border-outline-variant bg-surface-container-low pl-9 pr-4 text-body-sm text-on-surface placeholder:text-on-surface-variant focus:border-secondary focus:outline-none"
        />
      </div>

      <div data-tour="topbar-utility" className="ml-auto flex items-center gap-1.5">
        {isSimulating && realUser && (
          <button
            onClick={() => {
              exitSimulation();
              router.push(landingPathForRole(realUser.role));
            }}
            className="flex items-center gap-1.5 rounded-full bg-warning px-3 py-1.5 text-label-md font-medium text-white hover:opacity-90"
          >
            <LogOut className="h-3.5 w-3.5" />
            Exit preview
          </button>
        )}

        {/* Founder test-mode role switcher \u2014 mirrors POST /admin/test-mode/switch-role */}
        {(user?.role === "FOUNDER" || (isSimulating && realUser?.role === "FOUNDER")) && (
          <div className="relative">
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

        <button
          onClick={() => router.push("/sos")}
          aria-label="Notifications"
          className="relative rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low"
        >
          <Bell className="h-[18px] w-[18px]" />
          {activeSos > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-critical text-[10px] font-semibold text-white">
              {activeSos}
            </span>
          )}
        </button>

        <div className="relative">
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
