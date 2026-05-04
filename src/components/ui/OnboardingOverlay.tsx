'use client';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X, CheckCircle2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { ONBOARDING_CONTENT } from '@/lib/onboarding-steps';
import { apiClient } from '@/lib/apiClient';

export default function OnboardingOverlay() {
  const { data: session, update } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });

  const role = session?.user?.role as string;
  const steps = useMemo(() => ONBOARDING_CONTENT[role] || [], [role]);
  const hasCompleted = (session?.user as any)?.hasCompletedOnboarding;

  useEffect(() => {
    if (!session?.user || hasCompleted || steps.length === 0) return;

    const timer = setTimeout(() => setIsVisible(true), 1500);
    return () => clearTimeout(timer);
  }, [session, hasCompleted, steps.length]);

  useEffect(() => {
    if (!isVisible || !steps[currentStep]) return;

    const updateCoords = () => {
      const el = document.querySelector(steps[currentStep].target);
      if (el) {
        const rect = el.getBoundingClientRect();
        setCoords({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    updateCoords();
    window.addEventListener('resize', updateCoords);
    return () => window.removeEventListener('resize', updateCoords);
  }, [isVisible, currentStep, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      finishOnboarding();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const finishOnboarding = async () => {
    try {
      await apiClient('/api/profile/complete-onboarding', { method: 'POST' });
      setIsVisible(false);
      // Update session to reflect completion
      await update({ hasCompletedOnboarding: true });
    } catch (err) {
      console.error('Failed to save onboarding status', err);
      setIsVisible(false);
    }
  };

  if (!isVisible || steps.length === 0) return null;

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none">
      {/* Background Overlay with hole */}
      <div 
        className="absolute inset-0 bg-black/70 transition-opacity duration-500"
        style={{
          clipPath: `polygon(
            0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%,
            ${coords.left}px ${coords.top}px, 
            ${coords.left + coords.width}px ${coords.top}px, 
            ${coords.left + coords.width}px ${coords.top + coords.height}px, 
            ${coords.left}px ${coords.top + coords.height}px, 
            ${coords.left}px ${coords.top}px
          )`
        }}
      />

      {/* Pulse effect around target */}
      <div 
        className="absolute border-2 border-red-500 rounded-lg pointer-events-none"
        style={{
          top: coords.top - 4,
          left: coords.left - 4,
          width: coords.width + 8,
          height: coords.height + 8,
        }}
      >
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-red-500/20 rounded-lg"
        />
      </div>

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute pointer-events-auto bg-white rounded-2xl shadow-2xl p-6 w-[320px] border border-gray-100"
          style={{
            top: step.position === 'bottom' ? coords.top + coords.height + 20 : coords.top,
            left: step.position === 'right' ? coords.left + coords.width + 20 : coords.left,
            transform: step.position === 'top' ? 'translateY(-120%)' : step.position === 'left' ? 'translateX(-120%)' : 'none'
          }}
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Step {currentStep + 1} of {steps.length}
            </span>
            <button 
              onClick={() => setIsVisible(false)} 
              title="Close Onboarding"
              className="text-gray-400 hover:text-black"
            >
              <X size={16} />
            </button>
          </div>

          <h3 className="text-lg font-black text-gray-900 mb-2 leading-tight">
            {step.title}
          </h3>
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            {step.content}
          </p>

          <div className="flex justify-between items-center pt-4 border-t border-gray-50">
            <button 
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`flex items-center gap-1 text-xs font-bold ${currentStep === 0 ? 'text-gray-300' : 'text-gray-600 hover:text-black'}`}
            >
              <ChevronLeft size={14} /> Back
            </button>

            <button 
              onClick={handleNext}
              className="flex items-center gap-2 bg-[#C0392B] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-black transition-all shadow-lg shadow-red-500/20"
            >
              {currentStep === steps.length - 1 ? (
                <>Finish <CheckCircle2 size={14} /></>
              ) : (
                <>Next <ChevronRight size={14} /></>
              )}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
