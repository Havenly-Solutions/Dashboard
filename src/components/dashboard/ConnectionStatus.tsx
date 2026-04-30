'use client';

import { useSocket } from '@/hooks/useSocket';

export function ConnectionStatus() {
  const { isConnected } = useSocket();

  return (
    <div className="flex items-center gap-2">
      <span
        className={[
          'h-2 w-2 rounded-full',
          isConnected
            ? 'bg-green-500'
            : 'bg-amber-400',
        ].join(' ')}
      />
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {isConnected ? 'Live' : 'Reconnecting...'}
      </span>
    </div>
  );
}
