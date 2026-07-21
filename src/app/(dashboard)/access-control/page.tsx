"use client";

import { useState } from "react";
import { Lock, Trash2, History } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Tile, TileHeader } from "@/components/ui/tile";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TileSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { NAV_MODULES, ROLES, ROLE_LABELS } from "@/lib/rbac";
import {
  useAccessChangeLog,
  useRoleGrants,
  useSetRoleGrant,
  useSetUserOverride,
  useUserOverrides,
  useRemoveUserOverride,
} from "@/hooks/use-access-control";
import { useTeamMembers } from "@/hooks/use-team";
import { formatRelativeTime } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import type { Role } from "@/types";

const GRANTABLE_MODULES = NAV_MODULES.filter((m) => !m.hideFromNav && m.key !== "settings" && m.key !== "access-control");
const GRANTABLE_ROLES: Role[] = ROLES.filter((r) => r !== "FOUNDER");

export default function AccessControlPage() {
  const { data: roleGrants, isLoading: grantsLoading } = useRoleGrants();
  const { data: userOverrides, isLoading: overridesLoading } = useUserOverrides();
  const { data: changeLog } = useAccessChangeLog();
  const { data: members } = useTeamMembers();
  const setRoleGrant = useSetRoleGrant();
  const setUserOverride = useSetUserOverride();
  const removeOverride = useRemoveUserOverride();
  const { push } = useToast();

  const [addingOverride, setAddingOverride] = useState(false);
  const [overrideUserId, setOverrideUserId] = useState("");
  const [overrideModule, setOverrideModule] = useState(GRANTABLE_MODULES[0]?.key ?? "");
  const [overrideReason, setOverrideReason] = useState("");

  const grants = roleGrants ?? [];

  const hasDefaultAccess = (role: Role, moduleKey: string) =>
    NAV_MODULES.find((m) => m.key === moduleKey)?.roles.includes(role) ?? false;

  const isEnabled = (role: Role, moduleKey: string) => {
    const override = grants.find((g) => g.role === role && g.moduleKey === moduleKey);
    return override ? override.enabled : hasDefaultAccess(role, moduleKey);
  };

  const toggle = async (role: Role, moduleKey: string) => {
    const next = !isEnabled(role, moduleKey);
    try {
      await setRoleGrant.mutateAsync({ role, module: moduleKey, accessLevel: next ? "ENABLED" : "DISABLED" });
    } catch {
      push("Couldn't update access. Try again.", "error");
    }
  };

  const submitOverride = async () => {
    const member = members?.find((m) => m.id === overrideUserId);
    if (!member || !overrideModule) return;
    const fullName = `${member.firstName} ${member.lastName || ""}`.trim();
    try {
      await setUserOverride.mutateAsync({
        userId: member.id,
        module: overrideModule,
        accessLevel: "ENABLED",
      });
      push(`Granted ${fullName} access to ${NAV_MODULES.find((m) => m.key === overrideModule)?.label}.`);
      setAddingOverride(false);
      setOverrideReason("");
    } catch {
      push("Couldn't add the override.", "error");
    }
  };

  return (
    <div>
      <PageHeader
        title="Access Control Matrix"
        description="Grant or revoke access to any module, by role or by individual person. Changes apply immediately."
        action={
          <span className="flex items-center gap-1.5 text-label-md text-on-surface-variant">
            <Lock className="h-3.5 w-3.5" /> Founder only
          </span>
        }
      />

      <Tile>
        <TileHeader title="Role-level control" subtitle="Defaults shown in gray are each role's baseline scope" />
        {grantsLoading ? (
          <TileSkeleton rows={6} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="whitespace-nowrap px-3 py-2.5 text-label-caps text-on-surface-variant">Module</th>
                  {GRANTABLE_ROLES.map((r) => (
                    <th key={r} className="whitespace-nowrap px-3 py-2.5 text-center text-label-caps text-on-surface-variant">
                      {ROLE_LABELS[r]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {GRANTABLE_MODULES.map((mod) => (
                  <tr key={mod.key}>
                    <td className="whitespace-nowrap px-3 py-2.5 text-body-sm text-on-surface">{mod.label}</td>
                    {GRANTABLE_ROLES.map((r) => (
                      <td key={r} className="px-3 py-2.5 text-center">
                        <Switch
                          checked={isEnabled(r, mod.key)}
                          onChange={() => toggle(r, mod.key)}
                          disabled={setRoleGrant.isPending}
                          label={`${mod.label} for ${ROLE_LABELS[r]}`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Tile>

      <Tile className="mt-widget-gap">
        <TileHeader
          title="Individual overrides"
          subtitle="Grant one specific person access beyond their role's default"
          action={
            <Button size="sm" variant="outline" onClick={() => setAddingOverride((v) => !v)}>
              {addingOverride ? "Cancel" : "Add override"}
            </Button>
          }
        />

        {addingOverride && (
          <div className="mb-5 grid grid-cols-1 gap-4 rounded border border-outline-variant p-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="override-user">Team member</Label>
              <Select id="override-user" value={overrideUserId} onChange={(e) => setOverrideUserId(e.target.value)}>
                <option value="">Select a person…</option>
                {(members ?? []).map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.firstName} {m.lastName} ({ROLE_LABELS[m.role]})
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="override-module">Module</Label>
              <Select id="override-module" value={overrideModule} onChange={(e) => setOverrideModule(e.target.value)}>
                {GRANTABLE_MODULES.map((m) => (
                  <option key={m.key} value={m.key}>
                    {m.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="override-reason">Reason (optional, for the audit log)</Label>
              <Input id="override-reason" value={overrideReason} onChange={(e) => setOverrideReason(e.target.value)} placeholder="Covering for…" />
            </div>
            <div className="sm:col-span-2">
              <Button onClick={submitOverride} disabled={!overrideUserId} loading={setUserOverride.isPending}>
                Grant access
              </Button>
            </div>
          </div>
        )}

        {overridesLoading ? (
          <TileSkeleton rows={2} />
        ) : !userOverrides || userOverrides.length === 0 ? (
          <EmptyState icon={Lock} title="No individual overrides" description="Every person is on their role's default access." />
        ) : (
          <ul className="divide-y divide-outline-variant/60">
            {userOverrides.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-body-base text-on-surface">
                    {o.userName} <span className="text-on-surface-variant">({ROLE_LABELS[o.userRole]})</span>
                  </p>
                  <p className="text-body-sm text-on-surface-variant">
                    {o.enabled ? "Granted" : "Revoked"} {NAV_MODULES.find((m) => m.key === o.moduleKey)?.label ?? o.moduleKey}
                    {o.reason ? ` — "${o.reason}"` : ""} &middot; {formatRelativeTime(o.grantedAt)}
                  </p>
                </div>
                <button
                  onClick={async () => {
                    try {
                      await removeOverride.mutateAsync(o.id);
                      push("Override removed.");
                    } catch {
                      push("Couldn't remove the override.", "error");
                    }
                  }}
                  className="rounded p-1.5 text-on-surface-variant hover:bg-error-container/40 hover:text-error"
                  aria-label="Remove override"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Tile>

      <Tile className="mt-widget-gap">
        <TileHeader title="Recent access changes" action={<History className="h-4 w-4 text-on-surface-variant" />} />
        {!changeLog || changeLog.length === 0 ? (
          <p className="py-4 text-center text-body-sm text-on-surface-variant">No changes yet.</p>
        ) : (
          <ul className="divide-y divide-outline-variant/60">
            {changeLog.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3 py-2.5">
                <p className="text-body-sm text-on-surface">{l.summary}</p>
                <span className="whitespace-nowrap text-label-md text-on-surface-variant">{formatRelativeTime(l.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </Tile>
    </div>
  );
}
