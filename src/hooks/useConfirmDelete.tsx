'use client';

import { useState, useCallback } from 'react';
import { ConfirmDeleteModal } from '@/components/ui/ConfirmDeleteModal';

interface ConfirmDeleteState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  isLoading: boolean;
}

export function useConfirmDelete() {
  const [state, setState] = useState<ConfirmDeleteState>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Delete',
    onConfirm: () => {},
    isLoading: false,
  });

  const confirm = useCallback((
    title: string, 
    message: string, 
    onConfirm: () => void, 
    confirmLabel: string = 'Delete'
  ) => {
    setState({ 
      isOpen: true, 
      title, 
      message, 
      onConfirm, 
      confirmLabel,
      isLoading: false 
    });
  }, []);

  const close = useCallback(() => {
    setState((s) => ({ ...s, isOpen: false }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState((s) => ({ ...s, isLoading: loading }));
  }, []);

  const modal = (
    <ConfirmDeleteModal
      isOpen={state.isOpen}
      title={state.title}
      message={state.message}
      confirmLabel={state.confirmLabel}
      onConfirm={async () => {
        setLoading(true);
        try {
          await state.onConfirm();
        } finally {
          setLoading(false);
          close();
        }
      }}
      onCancel={close}
      isLoading={state.isLoading}
    />
  );

  return { confirm, modal, close, setLoading };
}
