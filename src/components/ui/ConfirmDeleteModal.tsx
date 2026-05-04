'use client';

import { useEffect, useRef } from 'react';

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

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-desc"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(2px)',
        animation: 'fadeIn 0.15s ease',
      }}
      onClick={(e) => {
        // Close on backdrop click
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
        .confirm-modal-card { animation: slideUp 0.18s ease; }
        .confirm-cancel-btn:hover  { background: var(--hover-cancel, rgba(255,255,255,0.06)) !important; }
        .confirm-delete-btn:hover  { background: var(--hover-delete, #b91c1c) !important; }
        .confirm-delete-btn:active { transform: scale(0.97); }
        .confirm-cancel-btn:active { transform: scale(0.97); }
        .confirm-delete-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
      `}</style>

      <div
        className="confirm-modal-card"
        style={{
          background: '#1a1a1f',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '14px',
          padding: '28px 28px 24px',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
      >
        {/* Icon */}
        <div style={{
          width: 44,
          height: 44,
          borderRadius: '10px',
          background: 'rgba(220, 38, 38, 0.12)',
          border: '1px solid rgba(220, 38, 38, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '18px',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </div>

        {/* Title */}
        <h2
          id="confirm-title"
          style={{
            margin: '0 0 8px',
            fontSize: '16px',
            fontWeight: 600,
            color: '#f4f4f5',
            lineHeight: 1.3,
          }}
        >
          {title}
        </h2>

        {/* Message */}
        <p
          id="confirm-desc"
          style={{
            margin: '0 0 24px',
            fontSize: '14px',
            color: '#a1a1aa',
            lineHeight: 1.55,
          }}
        >
          {message}
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            ref={cancelRef}
            className="confirm-cancel-btn"
            onClick={onCancel}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'transparent',
              color: '#a1a1aa',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 0.15s, transform 0.1s',
            }}
          >
            Cancel
          </button>

          <button
            className="confirm-delete-btn"
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              background: '#dc2626',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s, transform 0.1s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            {isLoading ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.7s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Deleting...
              </>
            ) : confirmLabel}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
