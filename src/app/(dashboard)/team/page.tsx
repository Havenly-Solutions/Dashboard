"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus, Users, Clock3, ShieldQuestion } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Tile, TileHeader } from "@/components/ui/tile";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { TileSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  useApprovalRequests,
  useApproveRequest,
  useDenyRequest,
  useInviteMember,
  useResendInvite,
  useSuspendMember,
  useTeamMembers,
} from "@/hooks/use-team";
import { ROLES, ROLE_LABELS } from "@/lib/rbac";
import { formatRelativeTime } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import type { Role, TeamMember } from "@/types";

const MEMBER_STATUS_TONE: Record<TeamMember["status"], "success" | "info" | "warning" | "critical"> = {
  ACTIVE: "success",
  INVITED: "info",
  PENDING_APPROVAL: "warning",
  SUSPENDED: "critical",
};

const inviteSchema = z.object({
  name: z.string().min(2, "Enter a full name"),
  email: z.string().email("Enter a valid email"),
  role: z.string(), // We'll cast to Role
});
type InviteValues = z.infer<typeof inviteSchema>;

export default function TeamPage() {
  const { data: members, isLoading } = useTeamMembers();
  const { data: approvals, isLoading: approvalsLoading } = useApprovalRequests();
  const approve = useApproveRequest();
  const deny = useDenyRequest();
  const suspend = useSuspendMember();
  const resend = useResendInvite();
  const { push } = useToast();
  const [inviteOpen, setInviteOpen] = useState(false);

  const activeCount = (members ?? []).filter((m) => m.status === "ACTIVE").length;

  return (
    <div>
      <PageHeader
        title="Team & Approvals"
        description="Invite members, approve access requests, and manage roles. No PIN required \u2014 approval sends a secure email invite link."
        action={
          <Button onClick={() => setInviteOpen(true)}>
            <UserPlus className="mr-1.5 h-4 w-4" /> Invite member
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-widget-gap sm:grid-cols-3">
        <StatCard label="Active Members" value={isLoading ? "\u2014" : String(activeCount)} icon={Users} />
        <StatCard label="Pending Approvals" value={approvalsLoading ? "\u2014" : String((approvals ?? []).length)} icon={ShieldQuestion} />
        <StatCard
          label="Awaiting Invite Acceptance"
          value={isLoading ? "\u2014" : String((members ?? []).filter((m) => m.status === "INVITED").length)}
          icon={Clock3}
        />
      </div>

      {approvals && approvals.length > 0 && (
        <Tile className="mt-widget-gap">
          <TileHeader title="Pending approvals" subtitle="Approving sends an email invite link \u2014 no PIN is issued" />
          <ul className="divide-y divide-outline-variant/60">
            {approvals.map((req) => (
              <li key={req.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
                <div>
                  <p className="text-body-base font-medium text-on-surface">{req.applicantName}</p>
                  <p className="text-body-base text-on-surface">
                    {req.applicantEmail}
                  </p>
                  <p className="text-body-sm text-on-surface-variant">
                    requesting {ROLE_LABELS[req.requestedRole]} &middot;{" "}
                    {formatRelativeTime(req.requestedAt)}
                  </p>
                  {req.note && <p className="mt-0.5 text-body-sm text-on-surface-variant">&ldquo;{req.note}&rdquo;</p>}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      await deny.mutateAsync(req.id);
                      push("Request denied.");
                    }}
                  >
                    Deny
                  </Button>
                  <Button
                    size="sm"
                    loading={approve.isPending}
                    onClick={async () => {
                      try {
                        await approve.mutateAsync({ id: req.id, role: req.requestedRole });
                        push(`Invite email sent to ${req.applicantEmail}.`);
                      } catch {
                        push("Couldn't approve this request.", "error");
                      }
                    }}
                  >
                    Approve &amp; send invite
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Tile>
      )}

      <Tile className="mt-widget-gap">
        <TileHeader title="Team directory" />
        {isLoading ? (
          <TileSkeleton rows={5} />
        ) : !members || members.length === 0 ? (
          <EmptyState icon={Users} title="No team members yet" />
        ) : (
          <ul className="divide-y divide-outline-variant/60">
            {members.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
                <div className="flex items-center gap-3">
                  <Avatar name={m.name} />
                  <div>
                    <p className="text-body-base font-medium text-on-surface">{m.name}</p>
                    <p className="text-body-base text-on-surface">{m.email}</p>
                    <p className="text-body-sm text-on-surface-variant">
                      {ROLE_LABELS[m.role]}
                      {m.organizationName ? ` \u2014 ${m.organizationName}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={MEMBER_STATUS_TONE[m.status]} dot>
                    {m.status.replace("_", " ")}
                  </Badge>
                  {m.status === "INVITED" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        await resend.mutateAsync(m.id);
                        push("Invite resent.");
                      }}
                    >
                      Resend invite
                    </Button>
                  )}
                  {m.status !== "SUSPENDED" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-critical"
                      onClick={async () => {
                        await suspend.mutateAsync(m.id);
                        push("Access suspended.");
                      }}
                    >
                      Suspend
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Tile>

      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}

function InviteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const invite = useInviteMember();
  const { push } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteValues>({ resolver: zodResolver(inviteSchema), defaultValues: { role: "MANAGER" } });

  const onSubmit = async (values: any) => {
    try {
      await invite.mutateAsync(values as any);
      push(`Invite email sent to ${values.email}.`);
      reset();
      onClose();
    } catch {
      push("Couldn't send the invite. Check the email and try again.", "error");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Invite a team member">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" {...register("name")} />
          <FieldError>{errors.name?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="email">Work email</Label>
          <Input id="email" type="email" {...register("email")} />
          <FieldError>{errors.email?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="role">Role</Label>
          <Select id="role" {...register("role")}>
            {ROLES.map((r: Role) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </Select>
        </div>
        <p className="text-body-sm text-on-surface-variant">
          They&apos;ll receive an email with a secure link to set their own password. No PIN or SMS involved.
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="lg" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="lg" className="text-black" loading={isSubmitting}>
            Send invite
          </Button>
        </div>
      </form>
    </Modal>
  );
}
