"use client";

import Link from "next/link";
import { Wallet, TrendingUp, CreditCard, Handshake, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Tile, TileHeader } from "@/components/ui/tile";
import { StatCard } from "@/components/ui/stat-card";
import { TileSkeleton } from "@/components/ui/skeleton";
import { GettingStartedChecklist } from "@/components/onboarding/getting-started-checklist";
import { useAuth } from "@/lib/auth-context";
import { useFinanceSnapshot } from "@/hooks/use-finance";
import { useMarketingSnapshot } from "@/hooks/use-marketing";
import { usePartners } from "@/hooks/use-partners";
import { formatCompactNumber, formatCurrencyZAR } from "@/lib/utils";

export default function ExecutivePortalPage() {
  const { user } = useAuth();
  const { data: finance, isLoading: financeLoading } = useFinanceSnapshot();
  const { data: marketing } = useMarketingSnapshot();
  const { data: partners } = usePartners();

  return (
    <div>
      {user && (
        <GettingStartedChecklist
          userId={user.id}
          tasks={[
            { label: "Review this month's finance snapshot", done: !!finance, href: "/finance" },
            { label: "Check subscription renewals", done: false, href: "/subscription-management" },
            { label: "Review marketing performance", done: !!marketing, href: "/marketing" },
          ]}
        />
      )}

      <PageHeader title="Executive Portal" description={`Business overview${user ? ` \u2014 ${user.name}` : ""}.`} />

      <div className="grid grid-cols-1 gap-widget-gap sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Monthly Recurring Revenue" value={financeLoading ? "\u2014" : formatCurrencyZAR(finance!.mrr)} delta={finance?.mrrDelta} icon={Wallet} />
        <StatCard label="Website Visitors (30d)" value={marketing ? formatCompactNumber(marketing.visitors) : "\u2014"} delta={marketing?.visitorsDelta} icon={TrendingUp} />
        <StatCard label="Outstanding Invoices" value={financeLoading ? "\u2014" : String(finance!.outstandingInvoices)} icon={CreditCard} />
        <StatCard label="Network Partners" value={partners ? String(partners.length) : "\u2014"} icon={Handshake} />
      </div>

      <div className="mt-widget-gap grid grid-cols-1 gap-widget-gap xl:grid-cols-3">
        <Tile className="xl:col-span-2">
          <TileHeader
            title="Finance"
            action={
              <Link href="/finance" className="flex items-center gap-1 text-label-md font-medium text-secondary hover:underline">
                Open Finance Hub <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          {financeLoading ? (
            <TileSkeleton rows={3} />
          ) : (
            <ul className="space-y-3">
              {finance!.revenueBySource.map((r) => (
                <li key={r.source} className="flex justify-between text-body-sm">
                  <span className="text-on-surface-variant">{r.source}</span>
                  <span className="font-medium text-on-surface">{formatCurrencyZAR(r.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </Tile>

        <Tile>
          <TileHeader title="Quick links" />
          <ul className="space-y-1">
            {[
              { href: "/subscription-management", label: "Subscription Management" },
              { href: "/partners", label: "Partners & NGOs" },
              { href: "/comms", label: "Comms Hub" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="flex items-center justify-between rounded px-3 py-2.5 text-body-base text-on-surface hover:bg-surface-container-low">
                  {l.label}
                  <ArrowRight className="h-4 w-4 text-on-surface-variant" />
                </Link>
              </li>
            ))}
          </ul>
        </Tile>
      </div>
    </div>
  );
}
