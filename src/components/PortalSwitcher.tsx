'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

// PORTAL SWITCHER — FOUNDER ONLY
// Allows the Founder to preview the dashboard as any role.
// This ONLY changes what the UI renders — backend RBAC still enforces real permissions.

type PortalView = 'FOUNDER' | 'PA' | 'MANAGER' | 'DEVELOPER' | 'INVESTOR' | 'NGO_PARTNER' | 'VIDEOGRAPHER' | 'CONTENT_CREATOR';

const PORTAL_OPTIONS: { view: PortalView; label: string; icon: string; description: string }[] = [
  { view: 'FOUNDER',     label: 'Admin View',     icon: '', description: 'Full system access' },
  { view: 'PA',          label: 'PA View',         icon: '', description: 'Admin operations' },
  { view: 'MANAGER',     label: 'Manager View',    icon: '', description: 'Operational oversight' },
  { view: 'DEVELOPER',   label: 'Developer View',  icon: '', description: 'Technical integrations' },
  { view: 'INVESTOR',    label: 'Investor View',   icon: '', description: 'Read-only analytics' },
  { view: 'NGO_PARTNER', label: 'NGO View',        icon: '🤝', description: 'Partner portal' },
  { view: 'VIDEOGRAPHER', label: 'Videographer View', icon: '📹', description: 'Media & footage management' },
  { view: 'CONTENT_CREATOR', label: 'Creator View', icon: '🎨', description: 'Marketing & broadcast content' },
];

// Export the active portal view so other components can consume it
export function usePortalView() {
  const [view, setView] = useState<PortalView>('FOUNDER');
  
  useEffect(() => {
    const stored = sessionStorage.getItem('portalView') as PortalView;
    if (stored) setView(stored);
  }, []);

  return view;
}


export default function PortalSwitcher() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [activeView, setActiveView] = useState<PortalView>('FOUNDER');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('portalView') as PortalView;
      if (stored && stored !== 'FOUNDER') {
        setActiveView(stored);
      }
    }
  }, []);


  // GUARD: Only render for FOUNDER role
  if (session?.user?.role !== 'FOUNDER') return null;

  const handleSwitch = (view: PortalView) => {
    setActiveView(view);
    // Persist in sessionStorage — resets when browser tab closes
    sessionStorage.setItem('portalView', view);
    setIsOpen(false);
    // Trigger a page reload so all role-gated components re-evaluate
    window.location.reload();
  };

  const current = PORTAL_OPTIONS.find(p => p.view === activeView)!;

  return (
    <div className="relative">
      {/* Trigger button — GSC Outlined Style */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-[4px] bg-white border border-[#dadce0] hover:bg-[#f8f9fa] transition-colors text-sm w-full text-[#202124]"
        aria-label="Switch portal view"
      >
        <span className="flex-1 text-left truncate">{current.label}</span>
        {/* Indicator badge when not in default Founder view */}
        {activeView !== 'FOUNDER' && (
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#e8f0fe] text-[#1a73e8] font-medium">
            Preview
          </span>
        )}
        <svg className={`w-4 h-4 text-[#5f6368] transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown - GSC Menu Style */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full min-w-[200px] rounded-[4px] bg-white border border-[#dadce0] shadow-[0_2px_6px_rgba(60,64,67,0.3)] z-50 overflow-hidden py-1">
          <div className="px-3 py-2 border-b border-[#f1f3f4]">
            <p className="text-[11px] text-[#5f6368] font-medium uppercase tracking-normal">Switch Portal View</p>
          </div>
          {PORTAL_OPTIONS.map(option => (
            <button
              key={option.view}
              onClick={() => handleSwitch(option.view)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-[#f1f3f4] transition-colors ${
                activeView === option.view ? 'bg-[#e8f0fe] text-[#1a73e8]' : 'text-[#202124]'
              }`}
            >
              <div>
                <p className={`text-[14px] ${activeView === option.view ? 'font-medium' : 'font-normal'}`}>{option.label}</p>
                <p className="text-[12px] text-[#5f6368]">{option.description}</p>
              </div>
              {activeView === option.view && (
                <svg className="ml-auto w-4 h-4 text-[#1a73e8]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>

  );
}