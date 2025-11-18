// src/hooks/use-inactivity-timer.ts
'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

interface UseInactivityTimerProps {
  onIdle: () => void;
  onActive: () => void;
  timeout: number;
}

export function useInactivityTimer({ onIdle, onActive, timeout }: UseInactivityTimerProps) {
  const [isIdle, setIsIdle] = useState(false);
  const [idleProgress, setIdleProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    setIdleProgress(0);
    if (isIdle) {
      onActive();
      setIsIdle(false);
    }
    
    timerRef.current = setTimeout(() => {
      onIdle();
      setIsIdle(true);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    }, timeout);
    
    const startTime = Date.now();
    progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        setIdleProgress((elapsed / timeout) * 100);
    }, 100);

  }, [isIdle, onActive, onIdle, timeout]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
    
    const handleActivity = () => {
      resetTimer();
    };

    events.forEach(event => window.addEventListener(event, handleActivity));
    
    resetTimer(); // Initial call

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [resetTimer]);

  return { isIdle, idleProgress };
}
