import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import * as Sentry from '@sentry/nextjs';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Note: Direct database access (Prisma) is disabled in the dashboard.
    // Onboarding status is managed via the session update in the frontend
    // and synchronized with the backend API.
    
    console.log(`[Onboarding] User ${session.user.email} marked onboarding as complete.`);

    return NextResponse.json({ success: true });
  } catch (error) {
    Sentry.captureException(error);
    console.error('Onboarding completion error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
