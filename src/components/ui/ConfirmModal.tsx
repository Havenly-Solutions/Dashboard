'use client';
import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  const variantStyles = {
    danger:  { icon: 'text-red-500',    bg: 'bg-red-50',    btn: 'bg-[#C0392B] hover:bg-[#a93226] text-white' },
    warning: { icon: 'text-amber-500',  bg: 'bg-amber-50',  btn: 'bg-amber-500 hover:bg-amber-600 text-white' },
    info:    { icon: 'text-blue-500',   bg: 'bg-blue-50',   btn: 'bg-blue-600 hover:bg-blue-700 text-white' },
  };
  const s = variantStyles[variant];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }} transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10">
            <button 
              onClick={onCancel} 
              title="Close Modal"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>
            <div className={`w-11 h-11 ${s.bg} rounded-xl flex items-center justify-center mb-4`}>
              <AlertTriangle size={22} className={s.icon} />
            </div>
            <h3 id="confirm-title" className="font-bold text-[#1A1A2E] text-base mb-1">{title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">{description}</p>
            <div className="flex gap-3">
              <button onClick={onCancel}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                {cancelLabel}
              </button>
              <button onClick={onConfirm}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${s.btn}`}>
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
