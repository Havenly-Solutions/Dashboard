"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api-client";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z.object({ email: z.string().email("Enter a valid email address") });
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    // Backend should always respond 200 here regardless of whether the
    // email exists, to avoid leaking which addresses are registered.
    await api.post("/api/v1/dashboard/auth/forgot-password", values, { skipAuth: true }).catch(() => {});
    router.push(`/check-email?email=${encodeURIComponent(values.email)}&type=reset`);
  };

  return (
    <div>
      <Link href="/login" className="mb-6 inline-flex items-center gap-1.5 text-body-sm font-medium text-on-surface-variant hover:text-on-surface">
        <ArrowLeft className="h-4 w-4" /> Back to sign in
      </Link>
      <h1 className="text-display-lg text-on-surface">Reset your password</h1>
      <p className="mt-1.5 text-body-base text-on-surface-variant">
        Enter your work email and we&apos;ll send you a secure link to reset your password.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
        <div>
          <Label htmlFor="email">Work email</Label>
          <Input id="email" type="email" autoComplete="email" placeholder="you@havenly.io" {...register("email")} />
          <FieldError>{errors.email?.message}</FieldError>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Send reset link
        </Button>
      </form>
    </div>
  );
}
