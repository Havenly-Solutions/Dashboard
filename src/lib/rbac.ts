import type { Role } from "@/types";

export const ROLES: Role[] = [
  "FOUNDER",
  "CO_FOUNDER",
  "MANAGER",
  "PA",
  "DEVELOPER",
  "NGO_PARTNER",
  "INVESTOR",
];

export const ROLE_LABELS: Record<Role, string> = {
  FOUNDER: "Founder",
  CO_FOUNDER: "Co-Founder",
  MANAGER: "Manager",
  PA: "PA",
  DEVELOPER: "Developer",
  NGO_PARTNER: "NGO Partner",
  INVESTOR: "Investor",
};

/**
 * Every role gets its own exclusive portal \u2014 own home screen, own default
 * module scope. The Founder has unrestricted access everywhere and is the
 * only role that can grant/revoke access beyond these defaults (see
 * src/lib/permissions.ts and the Access Control Matrix screen). There is
 * deliberately no ADMIN role: the Founder IS the admin. CO_FOUNDER is a
 * distinct, business-focused role \u2014 finance, subscriptions, marketing,
 * partners \u2014 without the Founder's technical/security/team-approval reach
 * unless explicitly granted.
 */
export interface PortalInfo {
  role: Role;
  name: string;
  homeHref: string;
  tagline: string;
}

export const PORTALS: PortalInfo[] = [
  { role: "FOUNDER", name: "Founder Portal", homeHref: "/overview", tagline: "Full control \u2014 business, technical, and team." },
  { role: "CO_FOUNDER", name: "Executive Portal", homeHref: "/executive-portal", tagline: "Business operations \u2014 finance, growth, partnerships." },
  { role: "MANAGER", name: "Manager Portal", homeHref: "/manager-portal", tagline: "Day-to-day operations \u2014 support, safety, comms." },
  { role: "PA", name: "PA Portal", homeHref: "/pa-portal", tagline: "Coordination \u2014 helpdesk, support, scheduling." },
  { role: "DEVELOPER", name: "Developer Portal", homeHref: "/developer-portal", tagline: "Technical \u2014 app health, security, infrastructure." },
  { role: "NGO_PARTNER", name: "Partners Portal", homeHref: "/partners-portal", tagline: "Case load, funding, and coordination with Havenly." },
  { role: "INVESTOR", name: "Investor Portal", homeHref: "/investor-portal", tagline: "Read-only growth and business health." },
];

export const ROLE_HOME: Record<Role, string> = Object.fromEntries(
  PORTALS.map((p) => [p.role, p.homeHref])
) as Record<Role, string>;

export function landingPathForRole(role: Role): string {
  return ROLE_HOME[role];
}

export interface NavModule {
  key: string;
  label: string;
  href: string;
  icon:
    | "dashboard"
    | "analytics"
    | "campaign"
    | "smartphone"
    | "emergency"
    | "support-agent"
    | "forum"
    | "groups"
    | "shield"
    | "payments"
    | "handshake"
    | "chat"
    | "settings"
    | "lock"
    | "card";
  /** Default roles that see this module before any Founder grant/revoke is applied. */
  roles: Role[];
  group: "Command" | "Operations" | "Growth" | "Organization";
  /** Hidden from the sidebar (still routable) \u2014 used for portal-home pages, which are linked from the logo/topbar instead of listed twice. */
  hideFromNav?: boolean;
}

export const NAV_MODULES: NavModule[] = [
  { key: "overview", label: "Founder Portal", href: "/overview", icon: "dashboard", roles: ["FOUNDER"], group: "Command", hideFromNav: true },
  { key: "executive-portal", label: "Executive Portal", href: "/executive-portal", icon: "dashboard", roles: ["CO_FOUNDER"], group: "Command", hideFromNav: true },
  { key: "manager-portal", label: "Manager Portal", href: "/manager-portal", icon: "dashboard", roles: ["MANAGER"], group: "Command", hideFromNav: true },
  { key: "pa-portal", label: "PA Portal", href: "/pa-portal", icon: "dashboard", roles: ["PA"], group: "Command", hideFromNav: true },
  { key: "developer-portal", label: "Developer Portal", href: "/developer-portal", icon: "dashboard", roles: ["DEVELOPER"], group: "Command", hideFromNav: true },
  { key: "partners-portal", label: "Partners Portal", href: "/partners-portal", icon: "dashboard", roles: ["NGO_PARTNER"], group: "Command", hideFromNav: true },
  { key: "investor-portal", label: "Investor Portal", href: "/investor-portal", icon: "dashboard", roles: ["INVESTOR"], group: "Command", hideFromNav: true },

  { key: "portal-switcher", label: "Switch Portal", href: "/portal-switcher", icon: "groups", roles: ["FOUNDER"], group: "Command" },
  { key: "sos", label: "Live SOS Command", href: "/sos", icon: "emergency", roles: ["FOUNDER", "MANAGER"], group: "Command" },

  { key: "marketing", label: "Marketing Analytics", href: "/marketing", icon: "campaign", roles: ["FOUNDER", "CO_FOUNDER", "INVESTOR"], group: "Growth" },
  { key: "app-analytics", label: "App & System Analytics", href: "/app-analytics", icon: "smartphone", roles: ["FOUNDER", "CO_FOUNDER", "DEVELOPER", "INVESTOR"], group: "Growth" },

  { key: "helpdesk", label: "Helpdesk", href: "/helpdesk", icon: "support-agent", roles: ["FOUNDER", "MANAGER", "PA"], group: "Operations" },
  { key: "support", label: "Customer Support", href: "/support", icon: "forum", roles: ["FOUNDER", "CO_FOUNDER", "MANAGER", "PA"], group: "Operations" },
  { key: "security", label: "Security Suite", href: "/security/campaigns", icon: "shield", roles: ["FOUNDER", "DEVELOPER"], group: "Operations" },
  { key: "comms", label: "Comms Hub", href: "/comms", icon: "chat", roles: ["FOUNDER", "CO_FOUNDER", "MANAGER", "PA"], group: "Operations" },

  { key: "team", label: "Team & Approvals", href: "/team", icon: "groups", roles: ["FOUNDER"], group: "Organization" },
  { key: "access-control", label: "Access Control Matrix", href: "/access-control", icon: "lock", roles: ["FOUNDER"], group: "Organization" },
  { key: "subscription-management", label: "Subscription Management", href: "/subscription-management", icon: "card", roles: ["FOUNDER", "CO_FOUNDER"], group: "Organization" },
  { key: "billing", label: "Billing", href: "/billing", icon: "card", roles: ["FOUNDER", "CO_FOUNDER"], group: "Organization" },
  { key: "finance", label: "Finance Hub", href: "/finance", icon: "payments", roles: ["FOUNDER", "CO_FOUNDER", "INVESTOR"], group: "Organization" },
  { key: "partners", label: "Partners & NGOs", href: "/partners", icon: "handshake", roles: ["FOUNDER", "CO_FOUNDER", "MANAGER", "NGO_PARTNER"], group: "Organization" },
  { key: "settings", label: "Settings", href: "/settings", icon: "settings", roles: ROLES, group: "Organization" },
];

export function moduleByKey(key: string): NavModule | undefined {
  return NAV_MODULES.find((m) => m.key === key);
}

/** Static default access \u2014 ignores any Founder-granted overrides. Use useEffectiveModules() in components for the real, grant-aware list. */
export function modulesForRole(role: Role | undefined | null): NavModule[] {
  if (!role) return [];
  return NAV_MODULES.filter((m) => m.roles.includes(role));
}

export function moduleKeyForPath(pathname: string): string | undefined {
  const mod = NAV_MODULES.find((m) => pathname === m.href || pathname.startsWith(m.href + "/"));
  return mod?.key;
}

/** Static default check \u2014 ignores overrides. Use useCanAccessModule() in components. */
export function canAccess(role: Role | undefined | null, href: string): boolean {
  if (!role) return false;
  const mod = NAV_MODULES.find((m) => href === m.href || href.startsWith(m.href + "/"));
  if (!mod) return true;
  return mod.roles.includes(role);
}
