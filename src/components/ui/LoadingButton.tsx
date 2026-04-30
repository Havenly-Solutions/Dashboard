'use client';

import { Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
}

export function LoadingButton({ loading, children, className, disabled, ...props }: LoadingButtonProps) {
  return (
    <button
      disabled={loading || disabled}
      className={cn(
        "relative flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
        "disabled:opacity-70 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      <span className={cn(loading && "opacity-0")}>{children}</span>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
        </span>
      )}
    </button>
  );
}
