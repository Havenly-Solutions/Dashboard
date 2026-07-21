"use client";

import { CreditCard, Wallet, AlertTriangle, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Tile, TileHeader } from "@/components/ui/tile";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { TileSkeleton } from "@/components/ui/skeleton";
import {
  useOrgSubscriptions,
  useOverrideBillingStatus,
  useUpdateSubscriptionTier,
} from "@/hooks/use-subscriptions";
import { formatCurrencyZAR, formatRelativeTime } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import type { BillingStatus, SubscriptionTier } from "@/types";

const TIER_TONE: Record<SubscriptionTier, "neutral" | "warning" | "info" | "secondary" | "success"> = {
  STARTER: "neutral",
  BRONZE: "warning",
  SILVER: "info",
  GOLD: "secondary",
  ENTERPRISE: "success",
};
const STATUS_TONE: Record<BillingStatus, "success" | "warning" | "critical"> = {
  PAID: "success",
  PENDING: "warning",
  OVERDUE: "critical",
};
const TIERS: SubscriptionTier[] = ["STARTER", "BRONZE", "SILVER", "GOLD", "ENTERPRISE"];
const STATUSES: BillingStatus[] = ["PAID", "PENDING", "OVERDUE"];

export default function SubscriptionManagementPage() {
  const { data: subs, isLoading } = useOrgSubscriptions();
  const updateTier = useUpdateSubscriptionTier();
  const overrideStatus = useOverrideBillingStatus();
  const { push } = useToast();

  const totalMrr = (subs ?? []).reduce((s, o) => s + o.mrr, 0);
  const overdue = (subs ?? []).filter((o) => o.status === "OVERDUE").length;
  const totalSeats = (subs ?? []).reduce((s, o) => s + o.seatsUsed, 0);

  return (
    <div>
      <PageHeader
        title="Subscription Management"
        description="Every organization's plan, billing cycle, and status in one place."
      />

      <div className="grid grid-cols-1 gap-widget-gap sm:grid-cols-3">
        <StatCard label="Total MRR" value={isLoading ? "—" : formatCurrencyZAR(totalMrr)} icon={Wallet} />
        <StatCard label="Overdue Accounts" value={isLoading ? "—" : String(overdue)} icon={AlertTriangle} />
        <StatCard label="Total Seats In Use" value={isLoading ? "—" : String(totalSeats)} icon={Users} />
      </div>

      <Tile className="mt-widget-gap">
        <TileHeader title="Organizations" />
        {isLoading ? (
          <TileSkeleton rows={4} />
        ) : (
          <Table>
            <THead>
              <TH>Organization</TH>
              <TH>Tier</TH>
              <TH>Cycle</TH>
              <TH>Status</TH>
              <TH>MRR</TH>
              <TH>Seats</TH>
              <TH>Renews</TH>
            </THead>
            <TBody>
              {(subs ?? []).map((o) => (
                <TR key={o.id}>
                  <TD className="font-medium text-on-surface">{o.organizationName}</TD>
                  <TD>
                    <Select
                      value={o.tier}
                      onChange={async (e) => {
                        try {
                          await updateTier.mutateAsync({ subId: o.id, tier: e.target.value as SubscriptionTier });
                          push(`${o.organizationName} moved to ${e.target.value}.`);
                        } catch {
                          push("Couldn't update the tier.", "error");
                        }
                      }}
                      className="h-8 w-32 text-body-sm"
                    >
                      {TIERS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </Select>
                  </TD>
                  <TD>{o.billingCycle === "ANNUAL" ? "Annual" : "Monthly"}</TD>
                  <TD>
                    <Select
                      value={o.status}
                      onChange={async (e) => {
                        try {
                          await overrideStatus.mutateAsync({ subId: o.id, status: e.target.value as BillingStatus });
                          push(`Billing status overridden to ${e.target.value}.`);
                        } catch {
                          push("Couldn't update billing status.", "error");
                        }
                      }}
                      className="h-8 w-28 text-body-sm"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </Select>
                  </TD>
                  <TD>{formatCurrencyZAR(o.mrr)}</TD>
                  <TD>
                    {o.seatsUsed} / {o.seatsAllowed}
                  </TD>
                  <TD className="text-body-sm text-on-surface-variant">{formatRelativeTime(o.renewsAt)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
        <p className="mt-4 flex items-center gap-1.5 text-body-sm text-on-surface-variant">
          <CreditCard className="h-3.5 w-3.5" /> Tier and status changes apply immediately. This manages your{" "}
          <em>customers&apos;</em> subscriptions — for Havenly&apos;s own payment method, see Settings &rarr; Billing.
        </p>
      </Tile>
    </div>
  );
}
