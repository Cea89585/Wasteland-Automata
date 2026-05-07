// src/hooks/use-user.ts
import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useFirebase } from '@/firebase/provider';
import { log } from '@/lib/logger';

export const useUser = () => {
  const firebase = useFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    log('[useUser] effect', { auth: !!firebase?.auth });

    if (!firebase?.auth) {
      setIsLoading(false);
      setUser(null);
      return;
    }

    let didUnsubscribe = false;
    const timeoutId = window.setTimeout(() => {
      if (!didUnsubscribe) {
        log('[useUser] auth state timeout, assuming no user');
        setIsLoading(false);
      }
    }, 5000);

    const unsubscribe = onAuthStateChanged(firebase.auth, (nextUser) => {
      if (didUnsubscribe) return;
      clearTimeout(timeoutId);
      log('[useUser] auth state changed', { user: nextUser });
      setUser(nextUser);
      setIsLoading(false);
    });

    return () => {
      didUnsubscribe = true;
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [firebase?.auth]);

  return { user, isLoading };
};
