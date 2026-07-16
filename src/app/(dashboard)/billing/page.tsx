"use client";

import { useState } from "react";
import { CreditCard, Plus, Trash2, Info, Download } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Tile, TileHeader } from "@/components/ui/tile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Label } from "@/components/ui/input";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { TileSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  useAddPaymentMethod,
  useInvoices,
  usePaymentMethods,
  useRemovePaymentMethod,
} from "@/hooks/use-subscriptions";
import { formatCurrencyZAR, formatRelativeTime } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

const INVOICE_TONE = { PAID: "success", PENDING: "warning", OVERDUE: "critical" } as const;

export default function BillingPage() {
  const { data: methods, isLoading } = usePaymentMethods();
  const { data: invoices, isLoading: invoicesLoading } = useInvoices();
  const removeMethod = useRemovePaymentMethod();
  const { push } = useToast();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div>
      <PageHeader title="Billing" description="Payment method and invoice history for your Havenly account." />

      <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
        <p className="flex items-start gap-2 text-body-sm text-on-surface-variant">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          As a pre-revenue startup, worth comparing processors before committing: <strong className="text-on-surface">Stripe</strong> now
          supports South African billing directly; <strong className="text-on-surface">Yoco</strong> and{" "}
          <strong className="text-on-surface">Peach Payments</strong> are SA-built with strong local card support; <strong className="text-on-surface">Paystack</strong> covers
          pan-African expansion well if that&apos;s on the roadmap. This screen is built provider-agnostic {"\u2014"} the card
          form below tokenizes client-side however you wire it up, and the backend only ever sees a token, never a
          raw card number.
        </p>
      </div>

      <Tile className="mt-widget-gap">
        <TileHeader
          title="Payment method"
          action={
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> Add card
            </Button>
          }
        />
        {isLoading ? (
          <TileSkeleton rows={1} />
        ) : !methods || methods.length === 0 ? (
          <EmptyState icon={CreditCard} title="No payment method on file" description="Add a card to enable billing." />
        ) : (
          <ul className="divide-y divide-outline-variant/60">
            {methods.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-12 items-center justify-center rounded bg-surface-container-high text-label-md font-semibold text-on-surface-variant">
                    {m.brand.slice(0, 4).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-body-base text-on-surface">
                      {m.brand} &middot;&middot;&middot;&middot; {m.last4}
                    </p>
                    <p className="text-body-sm text-on-surface-variant">
                      Expires {String(m.expMonth).padStart(2, "0")}/{m.expYear}
                    </p>
                  </div>
                  {m.isDefault && <Badge tone="secondary">Default</Badge>}
                </div>
                <button
                  onClick={async () => {
                    try {
                      await removeMethod.mutateAsync(m.id);
                      push("Payment method removed.");
                    } catch {
                      push("Couldn't remove the payment method.", "error");
                    }
                  }}
                  className="rounded p-1.5 text-on-surface-variant hover:bg-error-container/40 hover:text-error"
                  aria-label="Remove card"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Tile>

      <Tile className="mt-widget-gap">
        <TileHeader title="Invoice history" />
        {invoicesLoading ? (
          <TileSkeleton rows={3} />
        ) : !invoices || invoices.length === 0 ? (
          <EmptyState icon={CreditCard} title="No invoices yet" />
        ) : (
          <Table>
            <THead>
              <TH>Invoice</TH>
              <TH>Amount</TH>
              <TH>Status</TH>
              <TH>Date</TH>
              <TH className="text-right">&nbsp;</TH>
            </THead>
            <TBody>
              {invoices.map((inv) => (
                <TR key={inv.id}>
                  <TD className="font-mono text-body-sm">{inv.number}</TD>
                  <TD>{formatCurrencyZAR(inv.amount)}</TD>
                  <TD>
                    <Badge tone={INVOICE_TONE[inv.status]}>{inv.status}</Badge>
                  </TD>
                  <TD className="text-body-sm text-on-surface-variant">{formatRelativeTime(inv.issuedAt)}</TD>
                  <TD className="text-right">
                    <Button variant="ghost" size="sm">
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Tile>

      <AddCardModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}

function AddCardModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addMethod = useAddPaymentMethod();
  const { push } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // In production this entire form is replaced by the payment
      // provider's own hosted fields (Stripe Elements <CardElement>,
      // Paystack Inline, Yoco's SDK, etc.) so raw card details never touch
      // this codebase. This UI stands in for that widget so the flow can
      // be reviewed end-to-end before a provider is chosen.
      await addMethod.mutateAsync({ paymentMethodToken: "demo_tok_visa" });
      push("Card added.");
      onClose();
    } catch {
      push("Couldn't add the card.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add a payment method">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="card-number">Card number</Label>
          <Input id="card-number" placeholder="4242 4242 4242 4242" inputMode="numeric" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="card-exp">Expiry</Label>
            <Input id="card-exp" placeholder="MM / YY" required />
          </div>
          <div>
            <Label htmlFor="card-cvc">CVC</Label>
            <Input id="card-cvc" placeholder="123" inputMode="numeric" required />
          </div>
        </div>
        <div>
          <Label htmlFor="card-name">Name on card</Label>
          <Input id="card-name" required />
        </div>
        <p className="text-body-sm text-on-surface-variant">
          Placeholder fields {"\u2014"} wire to your chosen provider&apos;s hosted card element so raw numbers never hit this form&apos;s submit handler.
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="lg" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="lg" className="text-black" loading={submitting}>
            Save card
          </Button>
        </div>
      </form>
    </Modal>
  );
}
