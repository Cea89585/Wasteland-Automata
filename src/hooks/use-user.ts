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

    // Keep loading until we either:
    //  - successfully attach the auth listener, or
    //  - confirm auth is never available.
    //
    // This avoids an infinite spinner when Firebase context becomes
    // available after the initial render (common on production).
    if (!firebase?.auth) {
      // If Firebase isn't available (missing/invalid env on Vercel), avoid an infinite loader.
      setIsLoading(false);
      setUser(null);
      return;
    }

    const unsubscribe = onAuthStateChanged(firebase.auth, (nextUser) => {
      log('[useUser] auth state changed', { user: nextUser });
      setUser(nextUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [firebase?.auth]);

  return { user, isLoading };
};
