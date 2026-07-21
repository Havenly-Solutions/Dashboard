import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PasswordChangedPage() {
  return (
    <div>
      <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
        <CheckCircle2 className="h-6 w-6" strokeWidth={1.75} />
      </span>
      <h1 className="text-display-lg text-on-surface">Password updated</h1>
      <p className="mt-1.5 text-body-base text-on-surface-variant">
        Your password has been changed. You can now sign in with your new password.
      </p>
      <Link href="/login" className="mt-8 block">
        <Button size="lg" className="w-full">Sign in</Button>
      </Link>
    </div>
  );
}
