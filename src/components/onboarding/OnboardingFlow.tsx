'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { apiClient } from '@/lib/apiClient';

interface OnboardingStep {
  title: string;
  description: string;
  icon: string;
}

const PORTAL_GUIDES: Record<string, OnboardingStep[]> = {
  FOUNDER: [
    {
      title: 'Welcome, Founder',
      description: 'You are in the Command Centre. This is the heart of Havenly Solutions where you oversee the entire ecosystem.',
      icon: '🛡️',
    },
    {
      title: 'Strategic Oversight',
      description: 'Monitor high-level metrics, system health, and growth trajectories from your specialized dashboard.',
      icon: '📈',
    },
    {
      title: 'Governance & Team',
      description: 'Manage your core team, oversee NGO partnerships, and control platform-wide security settings.',
      icon: '👥',
    },
    {
      title: 'Ready for Launch',
      description: 'Everything is prepared for the November 2026 launch. Your vision is now operational.',
      icon: '🚀',
    },
  ],
  DASHBOARD: [
    {
      title: 'Operations Hub',
      description: 'Welcome to Havenly Operations. This is where real-time action happens.',
      icon: '⚡',
    },
    {
      title: 'Incident Response',
      description: 'Manage live alerts, coordinate dispatches, and ensure community safety through our integrated response system.',
      icon: '🚨',
    },
    {
      title: 'NGO Coordination',
      description: 'Bridge the gap between technology and community by managing active NGO partnerships and local initiatives.',
      icon: '🤝',
    },
    {
      title: 'Operational Excellence',
      description: 'Use the tools in your sidebar to navigate through incidents, partners, and team collaboration modules.',
      icon: '⚙️',
    },
  ],
  MARKETING: [
    {
      title: 'Marketing Portal',
      description: 'Welcome to the Growth Engine. This is where we track the impact and reach of Havenly Solutions.',
      icon: '🌍',
    },
    {
      title: 'Lead Tracking',
      description: 'Monitor pre-registrations and public interest as we build momentum toward the November 2026 launch.',
      icon: '📊',
    },
    {
      title: 'Public Engagement',
      description: 'Analyze engagement metrics and manage public-facing content to grow our community safely.',
      icon: '📣',
    },
    {
      title: 'Scale & Reach',
      description: 'Use these insights to refine our message and expand our footprint across the region.',
      icon: '🛰️',
    },
  ],
};

export function OnboardingFlow() {
  const { data: session, update } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const userRole = session?.user?.role as string;
  const portalId = (session?.user as any)?.portalId as string || 'DASHBOARD';
  const hasCompleted = (session?.user as any)?.hasCompletedOnboarding;

  useEffect(() => {
    if (session?.user && hasCompleted === false) {
      setIsOpen(true);
    }
  }, [session, hasCompleted]);

  const steps = PORTAL_GUIDES[portalId] || PORTAL_GUIDES['DASHBOARD'];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    try {
      await apiClient('/api/profile/complete-onboarding', {
        method: 'POST',
      });
      setIsOpen(false);
      // Update session to reflect completion
      await update({
        ...session,
        user: {
          ...session?.user,
          hasCompletedOnboarding: true,
        },
      });
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      setIsOpen(false); // Close anyway for UX
    }
  };

  if (!isOpen) return null;

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm transition-all duration-300">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl transform scale-100 animate-in fade-in zoom-in duration-300">
        <div className="p-12 text-center">
          <div className="mb-8 text-6xl transform transition-transform hover:scale-110 duration-300">
            {step.icon}
          </div>
          
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white">
            {step.title}
          </h2>
          
          <p className="mb-10 text-lg leading-relaxed text-zinc-400">
            {step.description}
          </p>

          <div className="flex flex-col gap-4">
            <button
              onClick={handleNext}
              className="w-full rounded-xl bg-white px-8 py-4 text-lg font-semibold text-black transition-all hover:bg-zinc-200 active:scale-95"
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next Step'}
            </button>
            
            <div className="mt-4 flex justify-center gap-2">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStep ? 'bg-white w-6' : 'bg-zinc-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
