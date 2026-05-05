// src/firebase/provider.tsx
'use client';
import { createContext, useContext, useMemo, useState, useEffect } from 'react';
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
  const [firebaseValue, setFirebaseValue] = useState<FirebaseContextValue>(null);

  useEffect(() => {
    // Only initialize Firebase on the client side after component mounts
    try {
      const app = getFirebaseApp();
      const auth = getFirebaseAuth();
      const db = getFirebaseDb();
      setFirebaseValue({ firebaseApp: app, auth, db });
    } catch (error) {
      // Firebase config not available - this is expected during build
      console.warn('Firebase not initialized:', error);
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
  if (!context) {
    throw new Error('Firebase is not available. Make sure FirebaseProvider is mounted and Firebase config is set.');
  }
  return context;
};
