import { Role } from '../types';
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

// PORTAL SWITCHER — FOUNDER ONLY
// Allows the Founder to preview the dashboard as any role.
// This ONLY changes what the UI renders — backend RBAC still enforces real permissions.

type PortalView = 'FOUNDER' | 'PA' | 'MANAGER' | 'DEVELOPER' | 'INVESTOR' | 'NGO_PARTNER';

const PORTAL_OPTIONS: { view: PortalView; label: string; icon: string; description: string }[] = [
  { view: 'FOUNDER',     label: 'Admin View',     icon: '', description: 'Full system access' },
  { view: 'PA',          label: 'PA View',         icon: '', description: 'Admin operations' },
  { view: 'MANAGER',     label: 'Manager View',    icon: '', description: 'Operational oversight' },
  { view: 'DEVELOPER',   label: 'Developer View',  icon: '', description: 'Technical integrations' },
  { view: 'INVESTOR',    label: 'Investor View',   icon: '', description: 'Read-only analytics' },
  { view: 'NGO_PARTNER', label: 'NGO View',        icon: '🤝', description: 'Partner portal' },
];

// Export the active portal view so other components can consume it
export function usePortalView() {
  // Read from sessionStorage so it persists across navigations but resets on tab close
  const stored = typeof window !== 'undefined' ? sessionStorage.getItem('portalView') : null;
  return (stored as PortalView) || 'FOUNDER';
}

export default function PortalSwitcher() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [activeView, setActiveView] = useState<PortalView>(() => {
    if (typeof window !== 'undefined') {
      return (sessionStorage.getItem('portalView') as PortalView) || 'FOUNDER';
    }
    return 'FOUNDER';
  });

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
      {/* Trigger button — shows current portal view */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 hover:border-red-500 transition-colors text-sm w-full"
        aria-label="Switch portal view"
      >
        <span>{current.icon}</span>
        <span className="text-gray-200">{current.label}</span>
        {/* Indicator badge when not in default Founder view */}
        {activeView !== 'FOUNDER' && (
          <span className="ml-1 px-1.5 py-0.5 rounded text-xs bg-red-600 text-white font-bold">
            PREVIEW
          </span>
        )}
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 rounded-xl bg-gray-900 border border-gray-700 shadow-2xl z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-700">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Switch Portal View</p>
            <p className="text-xs text-gray-500 mt-0.5">Frontend only — backend RBAC unchanged</p>
          </div>
          {PORTAL_OPTIONS.map(option => (
            <button
              key={option.view}
              onClick={() => handleSwitch(option.view)}
              className={`w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-gray-800 transition-colors ${
                activeView === option.view ? 'bg-gray-800 border-l-2 border-red-500' : ''
              }`}
            >
              <span className="text-xl">{option.icon}</span>
              <div>
                <p className="text-sm text-gray-100 font-medium">{option.label}</p>
                <p className="text-xs text-gray-400">{option.description}</p>
              </div>
              {activeView === option.view && (
                <svg className="ml-auto w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
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