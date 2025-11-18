// src/hooks/use-inactivity-timer.ts
'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

interface UseInactivityTimerProps {
  onIdle: () => void;
  onActive: () => void;
  timeout: number;
}

export function useInactivityTimer({ onIdle, onActive, timeout }: UseInactivityTimerProps) {
  const [idleProgress, setIdleProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const onIdleRef = useRef(onIdle);
  const onActiveRef = useRef(onActive);

  // Keep refs updated with the latest callbacks
  useEffect(() => {
    onIdleRef.current = onIdle;
    onActiveRef.current = onActive;
  }, [onIdle, onActive]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    setIdleProgress(0);
    onActiveRef.current();
    
    timerRef.current = setTimeout(() => {
      onIdleRef.current();
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    }, timeout);
    
    const startTime = Date.now();
    progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = (elapsed / timeout) * 100;
        setIdleProgress(progress);
        if (progress >= 100) {
            if(progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        }
    }, 100);

  }, [timeout]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
    
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

  return { idleProgress, resetTimer };
}
