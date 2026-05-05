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

  // ── FOUNDER / CHIEF_OFFICER ──────────────────────────────────────────────────
  FOUNDER: [
    { id: 'f-welcome', target: 'body', title: '👋 Welcome, Founder', content: 'You have full clearance across the entire Havenly Solutions platform. This tour walks you through every module.', path: '/dashboard', position: 'center' },
    { id: 'f-portal-switcher', target: '#portal-switcher', title: '🔄 Portal Switcher', content: 'Switch between role perspectives here. Preview what a Manager, Videographer, or PA sees — without logging out.', path: '/dashboard', position: 'bottom' },
    { id: 'f-sidebar', target: '#sidebar-nav', title: '🧭 Navigation Hub', content: 'Every platform module lives here. Your full clearance means all items are visible and accessible.', path: '/dashboard', position: 'right' },
    { id: 'f-feed', target: '#nav-feed', title: '📡 Live Feed', content: 'Your real-time command centre. Monitor all active incidents, alerts, and system events as they happen.', path: '/dashboard', position: 'right' },
    { id: 'f-sos', target: '#nav-sos', title: '🚨 SOS Alerts', content: 'Live distress signals from community members. Triage, assign, and close incidents from here.', path: '/dashboard/sos-alerts', position: 'right' },
    { id: 'f-mesh', target: '#nav-mesh', title: '🌐 Mesh Topology', content: 'Visual map of the distributed sensor and device network. Monitor connectivity and node health.', path: '/dashboard/mesh-topology', position: 'right' },
    { id: 'f-safety', target: '#nav-safety', title: '📋 Safety Logs', content: 'Full audit trail of all safety events, dispatches, and system actions. Cryptographically signed.', path: '/dashboard/safety-logs', position: 'right' },
    { id: 'f-ngo', target: '#nav-ngo', title: '🤝 NGO Portal', content: 'Manage partner organisations, their field operations, and coordination requests.', path: '/dashboard/ngo-portal', position: 'right' },
    { id: 'f-prereg', target: '#nav-pre-registrations', title: '📝 Pre-Registrations', content: 'All inbound sign-up requests from the Havenly marketing site flow here for review and approval.', path: '/dashboard/pre-registrations', position: 'right' },
    { id: 'f-analytics', target: '#nav-analytics', title: '📊 Analytics', content: 'Platform-wide metrics — growth, incident rates, response times, regional performance, and more.', path: '/dashboard/analytics', position: 'right' },
    { id: 'f-media', target: '#nav-media', title: '🎬 Media Vault', content: 'Centralised repository for all video, image, and document assets. Upload, organise, and share securely.', path: '/dashboard/media', position: 'right' },
    { id: 'f-broadcast', target: '#nav-broadcast', title: '📣 Tour Broadcast', content: 'Publish announcements, schedule tour content, and manage public-facing communications.', path: '/dashboard/broadcast', position: 'right' },
    { id: 'f-team', target: '#nav-team', title: '👥 Team Management', content: 'Invite members, assign roles, remove access, and view the full roster of your organisation.', path: '/dashboard/team', position: 'right' },
    { id: 'f-approvals', target: '#nav-approvals', title: '✅ Approvals Hub', content: 'Pending sign-offs, content approvals, and escalated decisions requiring your authorisation.', path: '/dashboard/approvals', position: 'right' },
    { id: 'f-resource', target: '#nav-resource-centre', title: '📚 Resource Centre', content: 'Training material, SOPs, and reference documents for your entire team.', path: '/dashboard/resource-centre', position: 'right' },
    { id: 'f-support', target: '#nav-support', title: '🛟 Support Tickets', content: 'Internal helpdesk. Raise or review technical and operational issues.', path: '/dashboard/support-tickets', position: 'right' },
    { id: 'f-settings', target: '#nav-settings', title: '⚙️ Settings', content: 'Manage your account, security preferences, notification rules, and platform configuration.', path: '/dashboard/settings', position: 'right' },
  ],

  // ── CHIEF_OFFICER (same full access as FOUNDER) ───────────────────────────────
  CHIEF_OFFICER: [
    { id: 'co-welcome', target: 'body', title: '👋 Welcome, Chief Officer', content: 'You hold executive clearance across the Havenly platform. This tour covers every module available to you.', path: '/dashboard', position: 'center' },
    { id: 'co-feed', target: '#nav-feed', title: '📡 Live Feed', content: 'Command centre for real-time incident and alert monitoring.', path: '/dashboard', position: 'right' },
    { id: 'co-sos', target: '#nav-sos', title: '🚨 SOS Alerts', content: 'Triage live distress signals from community members across all regions.', path: '/dashboard/sos-alerts', position: 'right' },
    { id: 'co-analytics', target: '#nav-analytics', title: '📊 Analytics', content: 'Full platform performance metrics and operational intelligence.', path: '/dashboard/analytics', position: 'right' },
    { id: 'co-media', target: '#nav-media', title: '🎬 Media Vault', content: 'All organisational media assets — upload, view, and manage with full control.', path: '/dashboard/media', position: 'right' },
    { id: 'co-team', target: '#nav-team', title: '👥 Team Management', content: 'Oversee the full team roster, roles, and access levels.', path: '/dashboard/team', position: 'right' },
    { id: 'co-settings', target: '#nav-settings', title: '⚙️ Settings', content: 'Configure your account and platform-wide security settings.', path: '/dashboard/settings', position: 'right' },
  ],

  // ── ADMIN ─────────────────────────────────────────────────────────────────────
  ADMIN: [
    { id: 'admin-welcome', target: 'body', title: '👋 Welcome, Administrator', content: 'Your role covers operational management, incident response, and platform administration.', path: '/dashboard', position: 'center' },
    { id: 'admin-feed', target: '#nav-feed', title: '📡 Live Feed', content: 'Monitor all platform activity in real time — alerts, dispatches, and incidents.', path: '/dashboard', position: 'right' },
    { id: 'admin-sos', target: '#nav-sos', title: '🚨 SOS Alerts', content: 'Manage live distress signals. Assign responders and close incidents.', path: '/dashboard/sos-alerts', position: 'right' },
    { id: 'admin-mesh', target: '#nav-mesh', title: '🌐 Mesh Topology', content: 'Monitor the network of connected devices and sensors.', path: '/dashboard/mesh-topology', position: 'right' },
    { id: 'admin-safety', target: '#nav-safety', title: '📋 Safety Logs', content: 'Audit trail for all system and safety events.', path: '/dashboard/safety-logs', position: 'right' },
    { id: 'admin-ngo', target: '#nav-ngo', title: '🤝 NGO Portal', content: 'Coordinate with partner organisations and field teams.', path: '/dashboard/ngo-portal', position: 'right' },
    { id: 'admin-prereg', target: '#nav-pre-registrations', title: '📝 Pre-Registrations', content: 'Review and process inbound sign-up requests.', path: '/dashboard/pre-registrations', position: 'right' },
    { id: 'admin-analytics', target: '#nav-analytics', title: '📊 Analytics', content: 'Track platform-wide performance and operational metrics.', path: '/dashboard/analytics', position: 'right' },
    { id: 'admin-media', target: '#nav-media', title: '🎬 Media Vault', content: 'Access all organisational media assets. You can view, upload, and manage files here.', path: '/dashboard/media', position: 'right' },
    { id: 'admin-broadcast', target: '#nav-broadcast', title: '📣 Tour Broadcast', content: 'Manage tour announcements and public-facing communications.', path: '/dashboard/broadcast', position: 'right' },
    { id: 'admin-settings', target: '#nav-settings', title: '⚙️ Settings', content: 'Manage your account preferences and security settings.', path: '/dashboard/settings', position: 'right' },
  ],

  // ── PA ────────────────────────────────────────────────────────────────────────
  PA: [
    { id: 'pa-welcome', target: 'body', title: '👋 Welcome, PA', content: 'Your portal is focused on executive-level oversight — approvals, analytics, team management, and media.', path: '/dashboard', position: 'center' },
    { id: 'pa-feed', target: '#nav-feed', title: '📡 Live Feed', content: 'The main dashboard shows you a live snapshot of platform activity across all regions.', path: '/dashboard', position: 'right' },
    { id: 'pa-sos', target: '#nav-sos', title: '🚨 SOS Alerts', content: 'Monitor and escalate critical SOS signals. You have full visibility across all active incidents.', path: '/dashboard/sos-alerts', position: 'right' },
    { id: 'pa-analytics', target: '#nav-analytics', title: '📊 Analytics', content: 'Review platform performance, regional stats, and growth metrics to brief the executive team.', path: '/dashboard/analytics', position: 'right' },
    { id: 'pa-team', target: '#nav-team', title: '👥 Team Management', content: 'Invite new team members, review existing roles, and manage access permissions across the organisation.', path: '/dashboard/team', position: 'right' },
    { id: 'pa-prereg', target: '#nav-pre-registrations', title: '📝 Pre-Registrations', content: 'All marketing sign-ups land here. Review and approve or decline incoming registrations.', path: '/dashboard/pre-registrations', position: 'right' },
    { id: 'pa-media', target: '#nav-media', title: '🎬 Media Vault', content: 'Review all uploaded media assets. You can view, download, and manage files from the creative team.', path: '/dashboard/media', position: 'right' },
    { id: 'pa-incidents', target: '#nav-incidents', title: '📌 Incidents', content: 'Track open and resolved incidents. Useful for briefing senior leadership on operational status.', path: '/dashboard/incidents', position: 'right' },
    { id: 'pa-approvals', target: '#nav-approvals', title: '✅ Approvals Hub', content: 'Items waiting for your sign-off appear here — content, requests, and escalations.', path: '/dashboard/approvals', position: 'right' },
    { id: 'pa-settings', target: '#nav-settings', title: '⚙️ Settings', content: 'Update your profile, password, and notification preferences.', path: '/dashboard/settings', position: 'right' },
  ],

  // ── MANAGER ───────────────────────────────────────────────────────────────────
  MANAGER: [
    { id: 'mgr-welcome', target: 'body', title: '👋 Welcome, Regional Manager', content: 'Your portal covers regional operations — leads, partners, incidents, team, and media assets.', path: '/dashboard', position: 'center' },
    { id: 'mgr-feed', target: '#nav-feed', title: '📡 Live Feed', content: 'A real-time snapshot of activity in your region — alerts, incidents, and events.', path: '/dashboard', position: 'right' },
    { id: 'mgr-analytics', target: '#nav-analytics', title: '📊 Analytics', content: 'Regional performance metrics — registrations, response times, and growth in your area.', path: '/dashboard/analytics', position: 'right' },
    { id: 'mgr-team', target: '#nav-team', title: '👥 Team Management', content: 'View your regional team roster. Invite new members and manage their roles.', path: '/dashboard/team', position: 'right' },
    { id: 'mgr-prereg', target: '#nav-pre-registrations', title: '📝 Pre-Registrations', content: 'Incoming registration requests specific to your region. Review and process them here.', path: '/dashboard/pre-registrations', position: 'right' },
    { id: 'mgr-incidents', target: '#nav-incidents', title: '📌 Incidents', content: 'Manage and track incidents occurring in your region. Assign and close cases.', path: '/dashboard/incidents', position: 'right' },
    { id: 'mgr-media', target: '#nav-media', title: '🎬 Media Vault', content: 'Access campaign and operational media assets. Review what your creative team has uploaded.', path: '/dashboard/media', position: 'right' },
    { id: 'mgr-settings', target: '#nav-settings', title: '⚙️ Settings', content: 'Manage your account details and notification preferences.', path: '/dashboard/settings', position: 'right' },
  ],

  // ── VIDEOGRAPHER ──────────────────────────────────────────────────────────────
  VIDEOGRAPHER: [
    { id: 'vid-welcome', target: 'body', title: '🎥 Welcome, Videographer', content: 'Your workspace is built for content production. You have access to the Media Vault, Resource Centre, and Broadcast tools.', path: '/dashboard', position: 'center' },
    { id: 'vid-media', target: '#nav-media', title: '🎬 Media Vault — Your Primary Workspace', content: 'Upload videos and images here. Every file is tagged with your name and timestamp automatically. Use the Upload Media button to get started.', path: '/dashboard/media', position: 'right' },
    { id: 'vid-media-upload', target: 'body', title: '⬆️ Uploading Assets', content: 'Click "Upload Media" at the top right. Add a title, description, and category (Raw, B-Roll, Final Edit, etc.) before uploading. Supported: images and videos up to 500MB.', path: '/dashboard/media', position: 'center' },
    { id: 'vid-media-vault', target: 'body', title: '🗂️ Browsing the Vault', content: 'Filter by type (Video / Image) using the tabs. Search by title. Click any asset to preview it in full screen. Hover over a card to download or delete.', path: '/dashboard/media', position: 'center' },
    { id: 'vid-resource', target: '#nav-resource-centre', title: '📚 Resource Centre', content: 'Access SOPs, brand guidelines, and reference documents to ensure your content meets Havenly standards.', path: '/dashboard/resource-centre', position: 'right' },
    { id: 'vid-broadcast', target: '#nav-broadcast', title: '📣 Tour Broadcast', content: 'View published tour content and scheduled announcements. Read-only access to keep you aligned with the campaign timeline.', path: '/dashboard/broadcast', position: 'right' },
    { id: 'vid-settings', target: '#nav-settings', title: '⚙️ Settings', content: 'Update your name, email, and password. Your name appears on every asset you upload.', path: '/dashboard/settings', position: 'right' },
  ],

  // ── CONTENT_CREATOR ───────────────────────────────────────────────────────────
  CONTENT_CREATOR: [
    { id: 'cc-welcome', target: 'body', title: '✍️ Welcome, Content Creator', content: 'Your workspace spans Media, Analytics, Broadcast, and Pre-Registrations — everything you need to create and track campaign content.', path: '/dashboard', position: 'center' },
    { id: 'cc-media', target: '#nav-media', title: '🎬 Media Vault — Your Asset Library', content: 'Upload images and videos for campaigns. Every file is attributed to you with a timestamp. Use the Upload Media button and always add a title and category.', path: '/dashboard/media', position: 'right' },
    { id: 'cc-media-detail', target: 'body', title: '🗂️ Managing Your Assets', content: 'Browse the vault with search and filters. Click any card to preview. Hover to download or send to Bin. Deleted files go to the Bin view and can be recovered.', path: '/dashboard/media', position: 'center' },
    { id: 'cc-analytics', target: '#nav-analytics', title: '📊 Analytics', content: 'Track the performance of your campaigns — registrations driven, engagement trends, and regional reach.', path: '/dashboard/analytics', position: 'right' },
    { id: 'cc-prereg', target: '#nav-pre-registrations', title: '📝 Pre-Registrations', content: 'See the leads your content is generating. Review inbound sign-ups from the marketing site.', path: '/dashboard/pre-registrations', position: 'right' },
    { id: 'cc-broadcast', target: '#nav-broadcast', title: '📣 Tour Broadcast', content: 'Create and publish tour announcements and campaign updates here.', path: '/dashboard/broadcast', position: 'right' },
    { id: 'cc-resource', target: '#nav-resource-centre', title: '📚 Resource Centre', content: 'Brand guidelines, templates, and approved reference material for your content.', path: '/dashboard/resource-centre', position: 'right' },
    { id: 'cc-settings', target: '#nav-settings', title: '⚙️ Settings', content: 'Your name on every uploaded asset comes from here. Keep your profile up to date.', path: '/dashboard/settings', position: 'right' },
  ],

  // ── DEVELOPER ─────────────────────────────────────────────────────────────────
  DEVELOPER: [
    { id: 'dev-welcome', target: 'body', title: '🛠️ Welcome, Developer', content: 'Your portal focuses on network infrastructure, analytics, and platform support tooling.', path: '/dashboard', position: 'center' },
    { id: 'dev-mesh', target: '#nav-mesh', title: '🌐 Mesh Topology', content: 'Real-time map of the distributed device network. Monitor node status, connectivity, and latency.', path: '/dashboard/mesh-topology', position: 'right' },
    { id: 'dev-analytics', target: '#nav-analytics', title: '📊 Analytics', content: 'System performance data — API response times, error rates, and uptime metrics.', path: '/dashboard/analytics', position: 'right' },
    { id: 'dev-support', target: '#nav-support', title: '🛟 Support Tickets', content: 'Technical issues raised by the team land here. Triage, respond, and close tickets.', path: '/dashboard/support-tickets', position: 'right' },
    { id: 'dev-settings', target: '#nav-settings', title: '⚙️ Settings', content: 'Manage your developer account and API access preferences.', path: '/dashboard/settings', position: 'right' },
  ],

  // ── NGO_PARTNER ───────────────────────────────────────────────────────────────
  NGO_PARTNER: [
    { id: 'ngo-welcome', target: 'body', title: '🤝 Welcome, NGO Partner', content: 'Your portal gives you direct access to field coordination tools and partner resources.', path: '/dashboard/ngo-portal', position: 'center' },
    { id: 'ngo-portal', target: '#nav-ngo', title: '🌍 NGO Portal', content: 'Your main workspace. Submit field reports, coordinate community support, and track your requests.', path: '/dashboard/ngo-portal', position: 'right' },
    { id: 'ngo-support', target: '#nav-support', title: '🛟 Support Tickets', content: 'Raise technical or operational issues directly with the Havenly support team.', path: '/dashboard/support-tickets', position: 'right' },
    { id: 'ngo-settings', target: '#nav-settings', title: '⚙️ Settings', content: 'Update your organisation contact details and notification preferences.', path: '/dashboard/settings', position: 'right' },
  ],

  // ── INVESTOR ──────────────────────────────────────────────────────────────────
  INVESTOR: [
    { id: 'inv-welcome', target: 'body', title: '📈 Welcome, Investor', content: 'Your portal gives you visibility into Havenly\'s performance metrics and growth trajectory.', path: '/dashboard', position: 'center' },
    { id: 'inv-analytics', target: '#nav-analytics', title: '📊 Analytics', content: 'Platform-wide growth data, regional penetration, incident metrics, and KPIs.', path: '/dashboard/analytics', position: 'right' },
    { id: 'inv-support', target: '#nav-support', title: '🛟 Support', content: 'Direct line to the Havenly team for any questions or escalations.', path: '/dashboard/support-tickets', position: 'right' },
    { id: 'inv-settings', target: '#nav-settings', title: '⚙️ Settings', content: 'Manage your investor account and contact preferences.', path: '/dashboard/settings', position: 'right' },
  ],

  // ── FALLBACK ──────────────────────────────────────────────────────────────────
  DASHBOARD: [
    { id: 'default-welcome', target: 'body', title: '👋 Welcome to Havenly Solutions', content: 'You\'re now in the operations dashboard. Your accessible modules are listed in the sidebar on the left.', path: '/dashboard', position: 'center' },
    { id: 'default-sidebar', target: '#sidebar-nav', title: '🧭 Your Navigation', content: 'Every module you have access to is listed here. Click any item to navigate to it.', path: '/dashboard', position: 'right' },
    { id: 'default-settings', target: '#nav-settings', title: '⚙️ Settings', content: 'Update your profile and preferences at any time from the Settings page.', path: '/dashboard/settings', position: 'right' },
  ],
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
