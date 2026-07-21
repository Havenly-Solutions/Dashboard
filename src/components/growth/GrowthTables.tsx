"use client";

import { useState } from "react";
import { Download, Building2, UserCheck, ExternalLink } from "lucide-react";
import { Tile, TileHeader } from "@/components/ui/tile";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import { usePreRegistrationTable, usePreRegistrationDetail, useUpdateLeadStatus, useClosePartner, downloadGrowthExport } from "@/hooks/use-growth";
import { formatRelativeTime } from "@/lib/utils";
import { PreRegistration } from "@/types";

const LEAD_STATUS_TONE: Record<string, "neutral" | "warning" | "success" | "critical"> = {
  NEW: "warning",
  CONTACTED: "neutral",
  CONVERTED: "success",
  UNRESPONSIVE: "critical",
};

export function PreRegistrationTable() {
  const [page] = useState(1);
  const { data } = usePreRegistrationTable(page, 10);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  return (
    <>
      <Tile>
        <TileHeader
          title="Pre-registration signups"
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadGrowthExport("pre-registrations")}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" /> Export Excel
            </Button>
          }
        />
        <Table>
          <THead>
            <TH>Name</TH>
            <TH>Email</TH>
            <TH>Province</TH>
            <TH>Status</TH>
            <TH>Submitted</TH>
          </THead>
          <TBody>
            {data?.rows?.map((r: PreRegistration) => (
              <TR key={r.id} onClick={() => setSelectedLeadId(r.id)} className="cursor-pointer group">
                <TD className="font-medium flex items-center gap-2">
                  {r.firstName} {r.surname}
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </TD>
                <TD>{r.email}</TD>
                <TD>{r.province}</TD>
                <TD>
                  <Badge tone={LEAD_STATUS_TONE[r.leadStatus] ?? "neutral"}>{r.leadStatus}</Badge>
                </TD>
                <TD>{formatRelativeTime(r.createdAt)}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Tile>

      <LeadDetailModal
        id={selectedLeadId}
        onClose={() => setSelectedLeadId(null)}
      />
    </>
  );
}

function LeadDetailModal({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { user } = useAuth();
  const { data: lead, isLoading } = usePreRegistrationDetail(id);
  const updateStatus = useUpdateLeadStatus();
  const [notes, setNotes] = useState("");
  const isFounder = user?.role === "FOUNDER";

  // Sync internal state when data loads
  const [synced, setSynced] = useState(false);
  if (lead && !synced) {
    setNotes(lead.notes || "");
    setSynced(true);
  }

  const handleSave = () => {
    if (!id) return;
    updateStatus.mutate({ id, notes }, {
      onSuccess: () => onClose()
    });
  };

  return (
    <Modal
      open={!!id}
      onClose={onClose}
      title="Lead Detail"
      footer={
        isFounder && (
          <Button onClick={handleSave} loading={updateStatus.isPending}>
            Save Changes
          </Button>
        )
      }
    >
      {isLoading ? (
        <div className="py-10 text-center animate-pulse text-on-surface-variant">Loading lead info...</div>
      ) : lead ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-label-sm text-on-surface-variant">Full Name</label>
              <p className="text-body-base font-medium">{lead.firstName} {lead.surname}</p>
            </div>
            <div>
              <label className="text-label-sm text-on-surface-variant">Email</label>
              <p className="text-body-base font-medium">{lead.email}</p>
            </div>
            <div>
              <label className="text-label-sm text-on-surface-variant">Phone</label>
              <p className="text-body-base font-medium">{lead.phone || "Not provided"}</p>
            </div>
            <div>
              <label className="text-label-sm text-on-surface-variant">Source</label>
              <p className="text-body-base font-medium capitalize">{lead.source}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-outline-variant">
            <label className="text-label-sm text-on-surface-variant block mb-2">Outreach Status</label>
            <Select
              disabled={!isFounder}
              value={lead.leadStatus}
              onChange={(e) => updateStatus.mutate({ id: lead.id, leadStatus: e.target.value })}
            >
              <option value="NEW">New Lead</option>
              <option value="CONTACTED">Contacted</option>
              <option value="CONVERTED">Converted</option>
              <option value="UNRESPONSIVE">Unresponsive</option>
            </Select>
          </div>

          <div>
            <label className="text-label-sm text-on-surface-variant block mb-2">Internal Notes</label>
            <textarea
              disabled={!isFounder}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-32 rounded border border-outline-variant bg-surface-container-lowest p-3 text-body-base focus:border-secondary focus:outline-none"
              placeholder="Record outreach attempts or specific requirements..."
            />
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

export function PartnerGrowthTable({ partners }: { partners: any[] }) {
  const { user } = useAuth();
  const closePartner = useClosePartner();
  const isFounder = user?.role === "FOUNDER";

  return (
    <Tile>
      <TileHeader
        title="Founding Partners"
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadGrowthExport("partners")}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" /> Export Excel
          </Button>
        }
      />
      <Table>
        <THead>
          <TH>Organization</TH>
          <TH>Contact</TH>
          <TH>Status</TH>
          <TH>Action</TH>
        </THead>
        <TBody>
          {partners.map((p) => (
            <TR key={p.id}>
              <TD>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-on-surface-variant" />
                  <span className="font-medium">{p.orgName}</span>
                </div>
              </TD>
              <TD>
                <p className="text-on-surface">{p.liaisonName}</p>
                <p className="text-body-sm text-on-surface-variant">{p.email}</p>
              </TD>
              <TD>
                <Badge tone={p.isFoundingTarget ? "success" : "warning"}>
                  {p.isFoundingTarget ? "Founding Partner" : "Pending"}
                </Badge>
              </TD>
              <TD>
                {!p.isFoundingTarget && isFounder && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => closePartner.mutate(p.id)}
                    loading={closePartner.isPending}
                    className="flex items-center gap-1"
                  >
                    <UserCheck className="h-3 w-3" /> Close Partner
                  </Button>
                )}
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </Tile>
  );
}
