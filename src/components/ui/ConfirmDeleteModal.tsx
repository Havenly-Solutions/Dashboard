'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Loader2, AlertCircle } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmDeleteModal({
  isOpen,
  title = 'Delete this asset?',
  message = 'This action is permanent and cannot be undone.',
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDeleteModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Focus cancel button when modal opens (safer default)
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => cancelRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onCancel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-desc"
            className="relative bg-[#1a1a1f] border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl overflow-hidden"
          >
            {/* Background Gradient Detail */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
            
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>

            {/* Title */}
            <h2
              id="confirm-title"
              className="text-xl font-bold text-slate-100 mb-2 leading-tight"
            >
              {title}
            </h2>

            {/* Message */}
            <p
              id="confirm-desc"
              className="text-slate-400 text-sm mb-8 leading-relaxed"
            >
              {message}
            </p>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                ref={cancelRef}
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                Cancel
              </button>

              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-all shadow-lg shadow-red-600/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    {confirmLabel}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
