// src/hooks/use-user.ts
import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useFirebase } from '@/firebase/provider';

export const useUser = () => {
  const firebase = useFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firebase?.auth) {
      setIsLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(firebase.auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [firebase?.auth]);

  return { user, isLoading };
};
