"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Moon, Sun, PlayCircle, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Tile, TileHeader } from "@/components/ui/tile";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-provider";
import { ROLE_LABELS } from "@/lib/rbac";
import { api, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import { PasswordStrengthHint } from "@/components/auth/password-strength-hint";
import { useEffectiveModules } from "@/hooks/use-access-control";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(10, "Use at least 10 characters"),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
type FormValues = z.infer<typeof schema>;

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const { theme, toggle } = useTheme();
  const { push } = useToast();
  const { data: effectiveModulesRaw } = useEffectiveModules(user?.id);
  const [formError, setFormError] = useState<string | null>(null);

  const effectiveModules = (effectiveModulesRaw as any[]) || [];

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setFormError(null);
    try {
      await api.post("/api/v1/dashboard/auth/change-password", {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      push("Password updated.");
      reset();
      refreshUser();
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setFormError("Current password is incorrect.");
      } else {
        setFormError("Couldn't update your password. Try again.");
      }
    }
  };

  return (
    <div>
      <PageHeader title="Settings" description="Your account, security, and preferences." />

      <div className="grid grid-cols-1 gap-widget-gap xl:grid-cols-2">
        <Tile>
          <TileHeader title="Account" />
          <dl className="space-y-3 text-body-base">
            <div className="flex justify-between">
              <dt className="text-on-surface-variant">Name</dt>
              <dd className="text-on-surface">{user?.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-on-surface-variant">Email</dt>
              <dd className="text-on-surface">{user?.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-on-surface-variant">Role</dt>
              <dd><Badge tone="secondary">{user ? ROLE_LABELS[user.role] : "—"}</Badge></dd>
            </div>
            {user?.organizationName && (
              <div className="flex justify-between">
                <dt className="text-on-surface-variant">Organization</dt>
                <dd className="text-on-surface">{user.organizationName}</dd>
              </div>
            )}
          </dl>
        </Tile>

        <Tile>
          <TileHeader title="Appearance" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-base text-on-surface">Theme</p>
              <p className="text-body-sm text-on-surface-variant">Switch between light and dark mode.</p>
            </div>
            <Button variant="outline" onClick={toggle}>
              {theme === "light" ? <Moon className="mr-1.5 h-4 w-4" /> : <Sun className="mr-1.5 h-4 w-4" />}
              {theme === "light" ? "Dark" : "Light"} mode
            </Button>
          </div>
        </Tile>

        <Tile>
          <TileHeader title="Product tour" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-base text-on-surface">Take the guided tour again</p>
              <p className="text-body-sm text-on-surface-variant">A quick refresher on your portal&apos;s layout.</p>
            </div>
            <Button variant="outline" onClick={() => window.dispatchEvent(new Event("havenly:start-tour"))}>
              <PlayCircle className="mr-1.5 h-4 w-4" /> Start
            </Button>
          </div>
        </Tile>

        {(effectiveModules.some((m: any) => m.key === "billing") || effectiveModules.some((m: any) => m.key === "access-control")) && (
          <Tile>
            <TileHeader title="Quick links" />
            <ul className="space-y-1">
              {effectiveModules.some((m: any) => m.key === "billing") && (
                <li>
                  <Link href="/billing" className="flex items-center justify-between rounded px-3 py-2.5 text-body-base text-on-surface hover:bg-surface-container-low">
                    Billing & payment method <ArrowRight className="h-4 w-4 text-on-surface-variant" />
                  </Link>
                </li>
              )}
              {effectiveModules.some((m: any) => m.key === "access-control") && (
                <li>
                  <Link href="/access-control" className="flex items-center justify-between rounded px-3 py-2.5 text-body-base text-on-surface hover:bg-surface-container-low">
                    Access Control Matrix <ArrowRight className="h-4 w-4 text-on-surface-variant" />
                  </Link>
                </li>
              )}
            </ul>
          </Tile>
        )}

        <Tile className="xl:col-span-2">
          <TileHeader title="Change password" />
          <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4" noValidate>
            <div>
              <Label htmlFor="currentPassword">Current password</Label>
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
            <Button type="submit" loading={isSubmitting}>
              Update password
            </Button>
          </form>
        </Tile>
      </div>
    </div>
  );
}
