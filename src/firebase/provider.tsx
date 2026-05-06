// src/firebase/provider.tsx
'use client';
import { createContext, useContext, useMemo } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { getFirebaseApp, getFirebaseAuth, getFirebaseDb } from './config';

type FirebaseContextValue = {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
} | null;

const FirebaseContext = createContext<FirebaseContextValue>(null);

export const FirebaseProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize Firebase synchronously using useMemo to ensure it's available on initial render
  const firebaseValue = useMemo(() => {
    try {
      const app = getFirebaseApp();
      const auth = getFirebaseAuth();
      const db = getFirebaseDb();
      return { firebaseApp: app, auth, firestore: db };
    } catch (error) {
      // Firebase config not available - this is expected during build
      console.warn('Firebase not initialized:', error);
      return null;
    }
  }, []);

  return (
    <FirebaseContext.Provider value={firebaseValue}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  return context;
};
