'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { AlertCircle, Clock, LogOut } from 'lucide-react';

// Banking app logic: 15 minutes inactivity timeout
const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const WARNING_THRESHOLD = 2 * 60 * 1000; // 2 minutes warning

export default function SessionManager() {
  const { data: session, status } = useSession();
  const [showWarning, setShowWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(WARNING_THRESHOLD / 1000);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const handleLogout = useCallback(async () => {
    // Clear everything first
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    
    // Attempt secure sign out
    await signOut({ callbackUrl: '/' });
  }, []);

  const startCountdown = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    
    let seconds = WARNING_THRESHOLD / 1000;
    setRemainingSeconds(seconds);
    
    countdownRef.current = setInterval(() => {
      seconds -= 1;
      setRemainingSeconds(seconds);
      
      if (seconds <= 0) {
        if (countdownRef.current) clearInterval(countdownRef.current);
        handleLogout();
      }
    }, 1000);
  }, [handleLogout]);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (showWarning) {
      setShowWarning(false);
      setRemainingSeconds(WARNING_THRESHOLD / 1000);
    }
    
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    timerRef.current = setTimeout(() => {
      setShowWarning(true);
      startCountdown();
    }, INACTIVITY_TIMEOUT - WARNING_THRESHOLD);
  }, [showWarning, startCountdown]);

  useEffect(() => {
    if (status !== 'authenticated') return;

    // Monitor user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const activityHandler = () => {
      resetTimer();
    };

    activityEvents.forEach(event => {
      window.addEventListener(event, activityHandler);
    });

    // Initial timer start
    resetTimer();

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, activityHandler);
      });
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [status, resetTimer]);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 transform animate-in zoom-in-95 duration-300">
        <div className="bg-[#1A1A2E] p-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_2px_2px,_white_1px,_transparent_0)] bg-[length:20px_20px]" />
          <div className="relative w-16 h-16 bg-[#C0392B] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg ring-4 ring-white/10">
            <Clock size={32} className="text-white animate-pulse" />
          </div>
          <h2 className="relative text-xl font-display font-bold text-white tracking-tight">Session Security Alert</h2>
          <p className="relative text-white/60 text-sm mt-1 uppercase tracking-widest font-medium">Automatic Logout Pending</p>
        </div>

        <div className="p-8">
          <div className="flex items-start gap-4 mb-8 bg-amber-50/50 p-4 rounded-xl border border-amber-100/50">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertCircle size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-gray-900 font-semibold text-sm mb-1">Inactivity Timeout</p>
              <p className="text-gray-500 text-xs leading-relaxed">
                For your protection, sessions are limited to 15 minutes of inactivity. Your session will expire in <span className="text-[#C0392B] font-bold">{Math.floor(remainingSeconds / 60)}:{(remainingSeconds % 60).toString().padStart(2, '0')}</span>.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={resetTimer}
              className="w-full bg-[#1A1A2E] hover:bg-[#2A2A4E] text-white py-3.5 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 group"
            >
              Extend Session
              <Clock size={16} className="group-hover:rotate-12 transition-transform" />
            </button>
            <button
              onClick={handleLogout}
              className="w-full bg-white hover:bg-gray-50 text-gray-500 py-3.5 rounded-xl text-sm font-bold border border-gray-200 transition-all flex items-center justify-center gap-2 group"
            >
              <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              Sign Out Now
            </button>
          </div>
          
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Secure Terminal Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
