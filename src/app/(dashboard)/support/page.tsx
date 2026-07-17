"use client";

import { useState } from "react";
import { MessageSquareText, Star, Smile, Meh, Frown } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Tile, TileHeader } from "@/components/ui/tile";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { TileSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar } from "@/components/ui/avatar";
import {
  useEnquiries,
  useEnquiryReplies,
  useReplyToEnquiry,
  useUpdateEnquiryStatus,
} from "@/hooks/use-support";
import { formatRelativeTime } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import type { EnquirySentiment, SupportEnquiry } from "@/types";

const SENTIMENT_ICON: Record<EnquirySentiment, typeof Smile> = {
  POSITIVE: Smile,
  NEUTRAL: Meh,
  NEGATIVE: Frown,
};
const SENTIMENT_TONE: Record<EnquirySentiment, "success" | "neutral" | "critical"> = {
  POSITIVE: "success",
  NEUTRAL: "neutral",
  NEGATIVE: "critical",
};
const PLAN_TONE: Record<SupportEnquiry["plan"], "secondary" | "info" | "success" | "neutral"> = {
  STARTER: "neutral",
  ADVANCED: "info",
  ENTERPRISE: "success",
  NONE: "neutral",
};

export default function CustomerSupportPage() {
  const { data: enquiries, isLoading } = useEnquiries();
  const updateStatus = useUpdateEnquiryStatus();
  const { push } = useToast();
  const [active, setActive] = useState<SupportEnquiry | null>(null);

  const open = (enquiries ?? []).filter((e) => e.status === "OPEN" || e.status === "FLAGGED").length;
  const flagged = (enquiries ?? []).filter((e) => e.status === "FLAGGED").length;
  const avgRating = (() => {
    const rated = (enquiries ?? []).filter((e) => e.rating != null);
    if (rated.length === 0) return null;
    return (rated.reduce((s, e) => s + (e.rating ?? 0), 0) / rated.length).toFixed(1);
  })();

  return (
    <div>
      <PageHeader title="Customer Support" description="Feedback, enquiries, and reviews from every plan tier." />

      <div className="grid grid-cols-1 gap-widget-gap sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open Enquiries" value={isLoading ? "\u2014" : String(open)} icon={MessageSquareText} />
        <StatCard label="Flagged" value={isLoading ? "\u2014" : String(flagged)} icon={Frown} />
        <StatCard label="Avg. Rating" value={avgRating ? `${avgRating} / 5` : "\u2014"} icon={Star} />
        <StatCard label="Total This Period" value={isLoading ? "\u2014" : String((enquiries ?? []).length)} icon={MessageSquareText} />
      </div>

      <Tile className="mt-widget-gap">
        <TileHeader title="Inbox" subtitle="Click an enquiry to reply" />
        {isLoading ? (
          <TileSkeleton rows={5} />
        ) : !enquiries || enquiries.length === 0 ? (
          <EmptyState icon={MessageSquareText} title="No enquiries yet" />
        ) : (
          <ul className="divide-y divide-outline-variant/60">
            {enquiries.map((e) => {
              const SentimentIcon = SENTIMENT_ICON[e.sentiment];
              return (
                <li key={e.id}>
                  <button
                    onClick={() => setActive(e)}
                    className="flex w-full items-start gap-3 py-3.5 text-left hover:bg-surface-container-low"
                  >
                    <Avatar name={e.customerName} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-body-base font-medium text-on-surface">{e.customerName}</p>
                        <Badge tone={PLAN_TONE[e.plan]}>{e.plan}</Badge>
                        {e.status === "FLAGGED" && <Badge tone="critical">Flagged</Badge>}
                      </div>
                      <p className="mt-0.5 truncate text-body-sm text-on-surface">{e.subject}</p>
                      <p className="mt-0.5 truncate text-body-sm text-on-surface-variant">{e.message}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <SentimentIcon className={`h-4 w-4 ${SENTIMENT_TONE[e.sentiment] === "critical" ? "text-critical" : SENTIMENT_TONE[e.sentiment] === "success" ? "text-success" : "text-on-surface-variant"}`} />
                      <span className="text-label-md text-on-surface-variant">{formatRelativeTime(e.createdAt)}</span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Tile>

      <ReplyModal
        enquiry={active}
        onClose={() => setActive(null)}
        onArchive={async (id) => {
          try {
            await updateStatus.mutateAsync({ id, status: "ARCHIVED" });
            push("Enquiry archived.");
            setActive(null);
          } catch {
            push("Couldn't archive the enquiry.", "error");
          }
        }}
      />
    </div>
  );
}

function ReplyModal({
  enquiry,
  onClose,
  onArchive,
}: {
  enquiry: SupportEnquiry | null;
  onClose: () => void;
  onArchive: (id: string) => void;
}) {
  const { data: replies, isLoading } = useEnquiryReplies(enquiry?.id ?? null);
  const reply = useReplyToEnquiry();
  const { push } = useToast();
  const [body, setBody] = useState("");

  if (!enquiry) return null;

  const send = async () => {
    if (!body.trim()) return;
    try {
      await reply.mutateAsync({ id: enquiry.id, body: body.trim() });
      setBody("");
      push("Reply sent.");
    } catch {
      push("Couldn't send the reply.", "error");
    }
  };

  return (
    <Modal open={!!enquiry} onClose={onClose} title={enquiry.subject} size="lg">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-body-base font-medium text-on-surface">{enquiry.customerName}</p>
          <p className="text-body-base text-on-surface">{enquiry.customerEmail}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => onArchive(enquiry.id)}>
          Archive
        </Button>
      </div>

      <div className="rounded border border-outline-variant bg-surface-container-low p-3.5 text-body-sm text-on-surface">
        {enquiry.message}
      </div>

      {!isLoading && replies && replies.length > 0 && (
        <ul className="mt-4 space-y-3 border-t border-outline-variant pt-4">
          {replies.map((r) => (
            <li key={r.id} className="text-body-sm">
              <span className="font-medium text-on-surface">{r.authorName}</span>{" "}
              <span className="text-on-surface-variant">{formatRelativeTime(r.createdAt)}</span>
              <p className="mt-0.5 text-on-surface">{r.body}</p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="Write a reply\u2026"
          className="w-full rounded border border-outline-variant bg-surface-container-lowest p-3 text-body-base text-on-surface placeholder:text-on-surface-variant focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
        />
        <div className="mt-3 flex justify-end">
          <Button size="lg" className="text-black" onClick={send} loading={reply.isPending} disabled={!body.trim()}>
            Send reply
          </Button>
        </div>
      </div>
    </Modal>
  );
}
