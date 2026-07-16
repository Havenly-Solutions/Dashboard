"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api, ApiError } from "@/lib/api-client";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordStrengthHint } from "@/components/auth/password-strength-hint";

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

export default function ResetPasswordPage() {
  const params = useParams<{ token: string }>();
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
      await api.post("/auth/reset-password", { token: params.token, password: values.password }, { skipAuth: true });
      router.push("/password-changed");
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setFormError("This reset link has expired or already been used. Request a new one.");
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div>
      <h1 className="text-display-lg text-on-surface">Set a new password</h1>
      <p className="mt-1.5 text-body-base text-on-surface-variant">Choose something you haven&apos;t used before.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
        <div>
          <Label htmlFor="password">New password</Label>
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
          Reset password
        </Button>
      </form>
    </div>
  );
}
