import Link from "next/link";
import { PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AccountCreatedPage() {
  return (
    <div>
      <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
        <PartyPopper className="h-6 w-6" strokeWidth={1.75} />
      </span>
      <h1 className="text-display-lg text-on-surface">You&apos;re in</h1>
      <p className="mt-1.5 text-body-base text-on-surface-variant">
        Your Havenly account is active. Sign in to reach your command center.
      </p>
      <Link href="/login" className="mt-8 block">
        <Button size="lg" className="w-full text-black">Sign in</Button>
      </Link>
    </div>
  );
}
