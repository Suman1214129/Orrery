'use client';

// ==========================================================================
// FIREBASE INITIALIZATION
// Project: orrery-2881d
// ==========================================================================
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
};

const hasValidFirebaseConfig = Object.values(firebaseConfig).every(
  (value) => typeof value === 'string' && value.length > 0
);

const app =
  hasValidFirebaseConfig && typeof window !== 'undefined'
    ? getApps().length
      ? getApps()[0]
      : initializeApp(firebaseConfig)
    : null;

export const auth = app ? getAuth(app) : null;
export const googleProvider = app ? new GoogleAuthProvider() : null;

if (googleProvider) {
  googleProvider.setCustomParameters({
    prompt: 'select_account',
  });
}

export function getFirebaseAuth() {
  if (!auth) {
    throw new Error(
      'Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* values to your environment.'
    );
  }

  return auth;
}

export function getGoogleProvider() {
  if (!googleProvider) {
    throw new Error(
      'Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* values to your environment.'
    );
  }

  return googleProvider;
}

export default app;
