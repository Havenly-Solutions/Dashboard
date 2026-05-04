'use client';
import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type BannerType = 'success' | 'error' | 'warning' | 'info';

interface BannerMessage {
  id: string;
  type: BannerType;
  title: string;
  description?: string;
  duration?: number; // ms — 0 = sticky (manual dismiss only)
}

// Global queue — modules dispatch events to this component
const bannerQueue: BannerMessage[] = [];
let addBannerFn: ((msg: Omit<BannerMessage, 'id'>) => void) | null = null;

export function showBanner(msg: Omit<BannerMessage, 'id'>) {
  if (addBannerFn) {
    addBannerFn(msg);
  } else {
    // Queue it until the component mounts
    bannerQueue.push({ ...msg, id: Math.random().toString(36).slice(2) });
  }
}

const ICONS: Record<BannerType, React.ReactNode> = {
  success: <CheckCircle2 size={18} className="text-green-600 shrink-0" />,
  error:   <XCircle     size={18} className="text-red-600 shrink-0" />,
  warning: <AlertTriangle size={18} className="text-amber-600 shrink-0" />,
  info:    <Info        size={18} className="text-blue-600 shrink-0" />,
};

const STYLES: Record<BannerType, string> = {
  success: 'bg-green-50  border-green-200  text-green-900',
  error:   'bg-red-50    border-red-200    text-red-900',
  warning: 'bg-amber-50  border-amber-200  text-amber-900',
  info:    'bg-blue-50   border-blue-200   text-blue-900',
};

export default function SystemBanner() {
  const [banners, setBanners] = useState<BannerMessage[]>([]);

  const add = useCallback((msg: Omit<BannerMessage, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    const banner: BannerMessage = { ...msg, id, duration: msg.duration ?? 5000 };
    setBanners(prev => [banner, ...prev].slice(0, 4)); // max 4 visible

    if (banner.duration && banner.duration > 0) {
      setTimeout(() => {
        setBanners(prev => prev.filter(b => b.id !== id));
      }, banner.duration);
    }
  }, []);

  useEffect(() => {
    addBannerFn = add;
    // Flush any banners queued before mount
    bannerQueue.forEach(add);
    bannerQueue.length = 0;
    return () => { addBannerFn = null; };
  }, [add]);

  const dismiss = (id: string) => setBanners(prev => prev.filter(b => b.id !== id));

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[150] w-full max-w-xl px-4 space-y-2 pointer-events-none">
      <AnimatePresence>
        {banners.map(banner => (
          <motion.div key={banner.id}
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,   scale: 1 }}
            exit={{   opacity: 0, y: -16,  scale: 0.97 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className={`flex items-start gap-3 p-4 rounded-2xl border shadow-lg pointer-events-auto ${STYLES[banner.type]}`}
            role="alert"
          >
            {ICONS[banner.type]}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{banner.title}</p>
              {banner.description && (
                <p className="text-xs mt-0.5 opacity-80 leading-relaxed">{banner.description}</p>
              )}
            </div>
            <button onClick={() => dismiss(banner.id)} className="opacity-50 hover:opacity-100 transition-opacity ml-1 shrink-0">
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
