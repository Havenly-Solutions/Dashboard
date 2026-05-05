'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { apiClient } from '@/lib/apiClientClient';

interface TourStep {
  id: string;
  target: string; // CSS selector
  title: string;
  content: string;
  path: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface TourContextType {
  isActive: boolean;
  currentStepIndex: number;
  startTour: () => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  steps: TourStep[];
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export function useTour() {
  const context = useContext(TourContext);
  if (!context) throw new Error('useTour must be used within a TourProvider');
  return context;
}

const TOUR_STEPS: Record<string, TourStep[]> = {
  FOUNDER: [
    {
      id: 'welcome',
      target: 'body',
      title: 'Welcome to Havenly Solutions',
      content: 'This is your Command Centre. Let\'s walk through the tools available to you.',
      path: '/dashboard',
      position: 'center',
    },
    {
      id: 'sidebar',
      target: '#sidebar-nav',
      title: 'Navigation Hub',
      content: 'All your accessible modules are listed here. You have full clearance across the platform.',
      path: '/dashboard',
      position: 'right',
    },
    {
      id: 'portal-switcher',
      target: '#portal-switcher',
      title: 'Portal Switcher',
      content: 'As a Founder, you can preview the dashboard from the perspective of other roles.',
      path: '/dashboard',
      position: 'bottom',
    },
    {
      id: 'analytics',
      target: '#nav-analytics',
      title: 'Real-time Analytics',
      content: 'Track system performance, growth metrics, and incident trends here.',
      path: '/dashboard',
      position: 'right',
    },
    {
      id: 'settings',
      target: '#nav-settings',
      title: 'System Settings',
      content: 'Configure global platform parameters and security protocols.',
      path: '/dashboard/settings',
      position: 'right',
    }
  ],
  PA: [
    {
      id: 'welcome-pa',
      target: 'body',
      title: 'PA Operations Portal',
      content: 'Welcome back. Your portal is focused on high-level administrative oversight and strategic approvals.',
      path: '/dashboard',
      position: 'center',
    },
    {
      id: 'sos-alerts',
      target: '#nav-sos-alerts',
      title: 'Strategic Oversight',
      content: 'Monitor live SOS signals and coordinate regional responses from the command centre.',
      path: '/dashboard',
      position: 'right',
    },
    {
      id: 'pre-registrations',
      target: '#nav-pre-registrations',
      title: 'Lead Conversion',
      content: 'Review and approve registration requests from the Marketing Portal. You have global visibility across all regions.',
      path: '/dashboard',
      position: 'right',
    },
    {
      id: 'ngo-portal',
      target: '#nav-ngo-portal',
      title: 'Partner Management',
      content: 'Oversee and coordinate with our growing network of NGO partners.',
      path: '/dashboard/ngo-portal',
      position: 'right',
    },
    {
      id: 'team',
      target: '#nav-team',
      title: 'Human Resources',
      content: 'Manage team access levels, invite new members, and ensure operational readiness.',
      path: '/dashboard',
      position: 'right',
    }
  ],
  MANAGER: [
    {
      id: 'welcome-manager',
      target: 'body',
      title: 'Regional Operations',
      content: 'Welcome to your regional hub. Track local performance and logistics from this view.',
      path: '/dashboard',
      position: 'center',
    },
    {
      id: 'pre-registrations',
      target: '#nav-pre-registrations',
      title: 'Local Leads',
      content: 'Process new registrations specific to your assigned region.',
      path: '/dashboard',
      position: 'right',
    },
    {
      id: 'ngo-portal',
      target: '#nav-ngo-portal',
      title: 'Regional Partners',
      content: 'Coordinate with local NGOs and community organizations.',
      path: '/dashboard/ngo-portal',
      position: 'right',
    }
  ],
  NGO_PARTNER: [
    {
      id: 'welcome-ngo',
      target: 'body',
      title: 'Partner Portal',
      content: 'Coordinate your field operations and community support requests here.',
      path: '/dashboard/ngo-portal',
      position: 'center',
    },
    {
      id: 'ngo-portal-tools',
      target: '#nav-ngo-portal',
      title: 'Operation Tools',
      content: 'All your partner-specific tools are consolidated in this module.',
      path: '/dashboard/ngo-portal',
      position: 'right',
    }
  ],
  DASHBOARD: [
     {
      id: 'welcome-ops',
      target: 'body',
      title: 'Operations Dashboard',
      content: 'Welcome to the operational hub. This is where you manage real-time events.',
      path: '/dashboard',
      position: 'center',
    },
    {
      id: 'sos-alerts',
      target: '#nav-sos-alerts',
      title: 'Live Alerts',
      content: 'Respond to community SOS signals and coordinate dispatches from this module.',
      path: '/dashboard',
      position: 'right',
    },
    {
      id: 'ngo-portal',
      target: '#nav-ngo-portal',
      title: 'NGO Collaboration',
      content: 'Manage and coordinate with our network of NGO partners.',
      path: '/dashboard/ngo-portal',
      position: 'right',
    }
  ]
};

export function TourProvider({ children }: { children: ReactNode }) {
  const { data: session, update } = useSession();
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  const role = (session?.user as any)?.role as string;
  const portalId = (session?.user as any)?.portalId;
  const hasCompletedOnboarding = (session?.user as any)?.hasCompletedOnboarding;
  
  // Selection priority: Role-specific tour -> Portal-specific tour -> Default DASHBOARD tour
  const steps = TOUR_STEPS[role] || (portalId ? TOUR_STEPS[portalId] : TOUR_STEPS['DASHBOARD']);

  useEffect(() => {
    // Only activate tour on dashboard routes. Never on the login page.
    const isDashboard = pathname.startsWith('/dashboard');
    
    if (isDashboard && session?.user && hasCompletedOnboarding !== true) {
      setIsActive(true);
    }
  }, [session, hasCompletedOnboarding, pathname]);

  const startTour = () => {
    setCurrentStepIndex(0);
    setIsActive(true);
  };

  const endTour = async () => {
    setIsActive(false);
    try {
      await apiClient('/api/profile/complete-onboarding', { method: 'POST' });
      await update({ ...session, user: { ...session?.user, hasCompletedOnboarding: true } });
    } catch (err) {
      console.error('Failed to mark onboarding as complete', err);
    }
  };

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextStep = steps[currentStepIndex + 1];
      if (nextStep.path !== pathname) {
        router.push(nextStep.path);
      }
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      endTour();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      const prevStep = steps[currentStepIndex - 1];
       if (prevStep.path !== pathname) {
        router.push(prevStep.path);
      }
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  return (
    <TourContext.Provider value={{ isActive, currentStepIndex, startTour, endTour, nextStep, prevStep, steps }}>
      {children}
      <GuidedTourUI />
    </TourContext.Provider>
  );
}

function GuidedTourUI() {
  const { isActive, currentStepIndex, steps, nextStep, prevStep, endTour } = useTour();
  const pathname = usePathname();
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [mounted, setMounted] = useState(false);

  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isActive || !currentStep) return;

    const updateCoords = () => {
      if (currentStep.target === 'body') {
        setCoords({ top: window.innerHeight / 2, left: window.innerWidth / 2, width: 0, height: 0 });
        return;
      }

      const element = document.querySelector(currentStep.target);
      if (element && currentStep.path === pathname) {
        const rect = element.getBoundingClientRect();
        setCoords({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
      }
    };

    updateCoords();
    window.addEventListener('resize', updateCoords);
    window.addEventListener('scroll', updateCoords);

    // Initial delay for page transitions
    const timer = setTimeout(updateCoords, 500);

    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords);
      clearTimeout(timer);
    };
  }, [isActive, currentStep, pathname]);

  if (!isActive || !mounted || !currentStep) return null;

  const getTooltipStyle = () => {
    if (currentStep.target === 'body') {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }

    const padding = 12;
    switch (currentStep.position) {
      case 'right':
        return { top: coords.top, left: coords.left + coords.width + padding };
      case 'bottom':
        return { top: coords.top + coords.height + padding, left: coords.left };
      case 'top':
        return { top: coords.top - padding, left: coords.left, transform: 'translateY(-100%)' };
      case 'left':
        return { top: coords.top, left: coords.left - padding, transform: 'translateX(-100%)' };
      default:
        return { top: coords.top + coords.height + padding, left: coords.left };
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] pointer-events-none overflow-hidden">
      {/* Backdrop with Hole */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-all duration-500" style={{
        clipPath: currentStep.target === 'body' 
          ? 'none' 
          : `polygon(0% 0%, 0% 100%, ${coords.left}px 100%, ${coords.left}px ${coords.top}px, ${coords.left + coords.width}px ${coords.top}px, ${coords.left + coords.width}px ${coords.top + coords.height}px, ${coords.left}px ${coords.top + coords.height}px, ${coords.left}px 100%, 100% 100%, 100% 0%)`
      }} />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className="absolute pointer-events-auto w-[320px] bg-white rounded-xl shadow-[0_24px_54px_rgba(0,0,0,0.15)] border border-[#dadce0] overflow-hidden"
          style={getTooltipStyle() as any}
        >
          {/* Header & Progress */}
          <div className="relative">
            <div className="bg-[#1A1A2E] px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-[#C0392B] rounded flex items-center justify-center text-[10px] font-bold text-white">H</div>
                <span className="text-[11px] font-bold text-white tracking-widest uppercase">
                  Step {currentStepIndex + 1} of {steps.length}
                </span>
              </div>
              <button onClick={endTour} title="Close Tour" className="text-white/40 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 h-[2px] bg-[#C0392B] transition-all duration-500 ease-in-out" style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }} />
          </div>

          <div className="p-6">
            <h3 className="text-[20px] font-display font-bold text-[#202124] mb-2 leading-tight">
              {currentStep.title}
            </h3>
            <p className="text-[14px] text-[#5f6368] leading-relaxed mb-8">
              {currentStep.content}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-[#f1f3f4]">
              <button 
                onClick={prevStep}
                disabled={currentStepIndex === 0}
                className="text-[13px] font-medium text-[#1a73e8] disabled:text-gray-300 hover:bg-[#e8f0fe] px-3 py-2 rounded-md transition-colors"
              >
                Back
              </button>

              <div className="flex items-center gap-3">
                <button 
                  onClick={endTour}
                  className="text-[13px] font-medium text-[#5f6368] hover:text-[#202124] px-2"
                >
                  Skip
                </button>
                <button 
                  onClick={nextStep}
                  className="flex items-center gap-2 bg-[#1a73e8] text-white px-5 py-2 rounded-md text-[13px] font-medium hover:bg-[#185abc] hover:shadow-md transition-all active:scale-95"
                >
                  {currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'}
                  {currentStepIndex < steps.length - 1 && <ChevronRight size={16} />}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
