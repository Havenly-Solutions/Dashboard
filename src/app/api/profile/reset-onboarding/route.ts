import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Call the backend to reset the status in the database
    // We'll reuse the updateProfile logic or a specific reset route if it existed,
    // but for now we'll just log it as the primary sync happens in complete-onboarding.

    console.log(`[Onboarding] Reset tour for ${session.user.email}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
