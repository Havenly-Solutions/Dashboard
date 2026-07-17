"use client";

import { Handshake, Building2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Tile, TileHeader } from "@/components/ui/tile";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { TileSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { usePartners } from "@/hooks/use-partners";

const STATUS_TONE = { ACTIVE: "success", PENDING: "warning", INACTIVE: "neutral" } as const;

export default function PartnersPage() {
  const { data: partners, isLoading } = usePartners();

  return (
    <div>
      <PageHeader title="Partners & NGOs" description="Organizations Havenly coordinates with for community response." />

      <Tile>
        <TileHeader title="Partner directory" />
        {isLoading ? (
          <TileSkeleton rows={4} />
        ) : !partners || partners.length === 0 ? (
          <EmptyState icon={Handshake} title="No partner organizations yet" />
        ) : (
          <Table>
            <THead>
              <TH>Organization</TH>
              <TH>Type</TH>
              <TH>Region</TH>
              <TH>Active Cases</TH>
              <TH>Contact</TH>
              <TH>Status</TH>
            </THead>
            <TBody>
              {partners.map((p) => (
                <TR key={p.id}>
                  <TD>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-on-surface-variant" />
                      <span className="font-medium text-on-surface">{p.name}</span>
                    </div>
                  </TD>
                  <TD>{p.type}</TD>
                  <TD>{p.region}</TD>
                  <TD>{p.activeCases}</TD>
                  <TD>
                    <p className="text-on-surface">{p.contactName}</p>
                    <p className="text-body-base text-on-surface">{p.contactEmail}</p>
                  </TD>
                  <TD>
                    <Badge tone={STATUS_TONE[p.status]}>{p.status}</Badge>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Tile>
    </div>
  );
}
