"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { KeyRound } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { landingPathForRole } from "@/lib/rbac";
import { markTourPending } from "@/lib/onboarding";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordStrengthHint } from "@/components/auth/password-strength-hint";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Enter the temporary password from your invite"),
    newPassword: z.string().min(10, "Use at least 10 characters"),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
type FormValues = z.infer<typeof schema>;

export default function SetPasswordPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setFormError(null);
    try {
      await api.post("/api/v1/dashboard/auth/change-password", {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      if (user) markTourPending(user.id);
      await refreshUser();
      router.push(user ? landingPathForRole(user.role) : "/login");
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setFormError("That temporary password isn't right. Check your invite email and try again.");
      } else {
        setFormError("Couldn't update your password. Try again.");
      }
    }
  };

  return (
    <div>
      <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10 text-secondary">
        <KeyRound className="h-6 w-6" strokeWidth={1.75} />
      </span>
      <p className="mb-1 text-label-caps text-on-surface-variant">Step 1 of 2</p>
      <h1 className="text-display-lg text-on-surface">Secure your account</h1>
      <p className="mt-1.5 text-body-base text-on-surface-variant">
        Set a permanent password to replace the temporary one from your invite.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
        <div>
          <Label htmlFor="currentPassword">Temporary password</Label>
          <Input id="currentPassword" type="password" autoComplete="current-password" {...register("currentPassword")} />
          <FieldError>{errors.currentPassword?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="newPassword">New password</Label>
          <Input id="newPassword" type="password" autoComplete="new-password" {...register("newPassword")} />
          <FieldError>{errors.newPassword?.message}</FieldError>
          <PasswordStrengthHint password={watch("newPassword") ?? ""} />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <Input id="confirmPassword" type="password" autoComplete="new-password" {...register("confirmPassword")} />
          <FieldError>{errors.confirmPassword?.message}</FieldError>
        </div>

        {formError && (
          <p role="alert" className="rounded border border-error-container bg-error-container/50 px-3 py-2.5 text-body-sm text-on-error-container">
            {formError}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Continue
        </Button>
      </form>
    </div>
  );
}
