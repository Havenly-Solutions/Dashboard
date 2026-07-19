import { NextResponse } from "next/server";
import { api } from "@/lib/api-client";

export async function POST() {
  try {
    await api.post("/api/dashboard/users/reset-onboarding", {});
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
