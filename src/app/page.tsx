"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { landingPathForRole } from "@/lib/rbac";

export default function RootPage() {
  const { status, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && user) {
      router.replace(landingPathForRole(user.role));
    } else if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, user, router]);

  return (
    <div className="flex h-dvh items-center justify-center bg-background">
      <Loader2 className="h-6 w-6 animate-spin text-secondary" />
    </div>
  );
}
