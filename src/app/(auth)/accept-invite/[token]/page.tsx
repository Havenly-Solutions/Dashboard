"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ShieldAlert } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordStrengthHint } from "@/components/auth/password-strength-hint";
import { ROLE_LABELS } from "@/lib/rbac";
import type { Role } from "@/types";

interface InviteDetails {
  email: string;
  role: Role;
  organizationName?: string | null;
  invitedByName: string;
}

const schema = z
  .object({
    password: z.string().min(10, "Use at least 10 characters"),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
type FormValues = z.infer<typeof schema>;

export default function AcceptInvitePage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const { data: invite, isLoading, isError } = useQuery({
    queryKey: ["invite", params.token],
    queryFn: () => api.get<InviteDetails>(`/auth/invite/${params.token}`, { skipAuth: true }),
    retry: false,
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setFormError(null);
    try {
      await api.post(
        "/auth/accept-invite",
        { token: params.token, password: values.password },
        { skipAuth: true }
      );
      router.push("/account-created");
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setFormError("This invite link has expired or already been used. Ask a Founder or Admin to resend it.");
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-body-base text-on-surface-variant">
        <Loader2 className="h-4 w-4 animate-spin" /> Verifying your invite\u2026
      </div>
    );
  }

  if (isError || !invite) {
    return (
      <div>
        <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-error-container text-error">
          <ShieldAlert className="h-6 w-6" strokeWidth={1.75} />
        </span>
        <h1 className="text-display-lg text-on-surface">Invite link invalid</h1>
        <p className="mt-1.5 text-body-base text-on-surface-variant">
          This invite link is invalid or has expired. Ask a Founder or Admin to send you a new one from
          Team &amp; Approvals.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-display-lg text-on-surface">Set up your account</h1>
      <p className="mt-1.5 text-body-base text-on-surface-variant">
        {invite.invitedByName} invited you to join Havenly as{" "}
        <strong className="text-on-surface">{ROLE_LABELS[invite.role]}</strong>
        {invite.organizationName ? <> for {invite.organizationName}</> : null}.
      </p>

      <div className="mt-6 rounded border border-outline-variant bg-surface-container-low px-3.5 py-2.5 text-body-sm text-on-surface-variant">
        {invite.email}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5" noValidate>
        <div>
          <Label htmlFor="password">Create a password</Label>
          <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
          <FieldError>{errors.password?.message}</FieldError>
          <PasswordStrengthHint password={watch("password") ?? ""} />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input id="confirmPassword" type="password" autoComplete="new-password" {...register("confirmPassword")} />
          <FieldError>{errors.confirmPassword?.message}</FieldError>
        </div>

        {formError && (
          <p role="alert" className="rounded border border-error-container bg-error-container/50 px-3 py-2.5 text-body-sm text-on-error-container">
            {formError}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full text-black" loading={isSubmitting}>
          Activate account
        </Button>
      </form>
    </div>
  );
}
