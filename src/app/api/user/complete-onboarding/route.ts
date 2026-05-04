import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import * as Sentry from '@sentry/nextjs';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: { 
        hasCompletedOnboarding: true,
        onboardingCompletedAt: new Date()
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    Sentry.captureException(error);
    console.error('Onboarding completion error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
