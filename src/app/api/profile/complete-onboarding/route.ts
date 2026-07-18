import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { serverFetch } from '@/lib/serverFetch';
import * as Sentry from '@sentry/nextjs';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Call the backend to update the database
    const response = await serverFetch('/api/v1/dashboard/auth/complete-onboarding', {
      method: 'POST',
    });

    if (!response || !response.ok) {
      console.error('[Onboarding] Failed to update backend onboarding status');
      // We still return success to the UI to avoid blocking the user experience,
      // but log the error for investigation.
    }
    
    console.log(`[Onboarding] User ${session.user.email} marked onboarding as complete.`);

    return NextResponse.json({ success: true });
  } catch (error) {
    Sentry.captureException(error);
    console.error('Onboarding completion error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
