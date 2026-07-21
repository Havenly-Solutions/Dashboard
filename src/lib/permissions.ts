import { NAV_MODULES, modulesForRole, type NavModule } from "@/lib/rbac";
import type { AuthUser, RoleGrant, UserOverride } from "@/types";

/**
 * Resolves the real, effective set of accessible module keys for a user:
 *   1. Start with the role's default modules (src/lib/rbac.ts).
 *   2. Apply any Founder-set role-level grant/revoke (RoleGrant) \u2014 this can
 *      both ADD a module the role doesn't default to, and REMOVE one it does.
 *   3. Apply any individual user override (UserOverride) \u2014 highest
 *      precedence, exactly matching the Stitch Access Control Matrix's
 *      "Role Level Control" + "Individual Overrides" two-tier design.
 * The Founder role always resolves to every module, full stop \u2014 the
 * Founder cannot accidentally lock themself out via the matrix.
 */
export function resolveAccessibleModuleKeys(
  user: Pick<AuthUser, "id" | "role"> | null | undefined,
  roleGrants: RoleGrant[],
  userOverrides: UserOverride[]
): Set<string> {
  if (!user) return new Set();
  if (user.role === "FOUNDER") return new Set(NAV_MODULES.map((m) => m.key));

  const keys = new Set(modulesForRole(user.role).map((m) => m.key));

  for (const grant of roleGrants) {
    if (grant.role !== user.role) continue;
    if (grant.enabled) keys.add(grant.moduleKey);
    else keys.delete(grant.moduleKey);
  }

  for (const override of userOverrides) {
    if (override.userId !== user.id) continue;
    if (override.enabled) keys.add(override.moduleKey);
    else keys.delete(override.moduleKey);
  }

  return keys;
}

export function effectiveModulesFor(
  user: Pick<AuthUser, "id" | "role"> | null | undefined,
  roleGrants: RoleGrant[],
  userOverrides: UserOverride[]
): NavModule[] {
  const keys = resolveAccessibleModuleKeys(user, roleGrants, userOverrides);
  return NAV_MODULES.filter((m) => keys.has(m.key));
}
