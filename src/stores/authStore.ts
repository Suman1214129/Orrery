'use client';

// ==========================================================================
// AUTH STORE - Zustand State Management for Firebase Auth
// ==========================================================================
import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updatePassword as firebaseUpdatePassword,
  deleteUser,
  onAuthStateChanged,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth, getFirebaseAuth, getGoogleProvider } from '@/lib/firebase';

// ==========================================================================
// TYPES
// ==========================================================================
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: (password?: string) => Promise<void>;
  clearError: () => void;
  initialize: () => () => void; // returns unsubscribe function
}

// ==========================================================================
// STORE
// ==========================================================================
export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isLoading: true, // starts true until Firebase resolves auth state
  isAuthenticated: false,
  error: null,

  // ─── Sign in with email/password ─────────────────────────────────────────
  signInWithEmail: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const firebaseAuth = getFirebaseAuth();
      await signInWithEmailAndPassword(firebaseAuth, email, password);
      // onAuthStateChanged will update the user state
    } catch (err: any) {
      set({ error: getFirebaseError(err.code), isLoading: false });
      throw err;
    }
  },

  // ─── Sign up with email/password ─────────────────────────────────────────
  signUpWithEmail: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const firebaseAuth = getFirebaseAuth();
      const { user } = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      await updateProfile(user, { displayName: name });
      // onAuthStateChanged will update the user state
    } catch (err: any) {
      set({ error: getFirebaseError(err.code), isLoading: false });
      throw err;
    }
  },

  // ─── Sign in with Google ─────────────────────────────────────────────────
  signInWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      const firebaseAuth = getFirebaseAuth();
      const provider = getGoogleProvider();
      await signInWithPopup(firebaseAuth, provider);
      // onAuthStateChanged will update the user state
    } catch (err: any) {
      set({ error: getFirebaseError(err.code), isLoading: false });
      throw err;
    }
  },

  // ─── Sign out ────────────────────────────────────────────────────────────
  signOut: async () => {
    set({ isLoading: true, error: null });
    try {
      const firebaseAuth = getFirebaseAuth();
      await firebaseSignOut(firebaseAuth);
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (err: any) {
      set({ error: getFirebaseError(err.code), isLoading: false });
      throw err;
    }
  },

  // ─── Password reset email ────────────────────────────────────────────────
  sendPasswordReset: async (email) => {
    set({ error: null });
    try {
      const firebaseAuth = getFirebaseAuth();
      await sendPasswordResetEmail(firebaseAuth, email);
    } catch (err: any) {
      set({ error: getFirebaseError(err.code) });
      throw err;
    }
  },

  // ─── Update password (requires re-auth) ─────────────────────────────────
  updatePassword: async (currentPassword, newPassword) => {
    set({ error: null });
    const user = get().user;
    if (!user || !user.email) throw new Error('Not authenticated');
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await firebaseUpdatePassword(user, newPassword);
    } catch (err: any) {
      set({ error: getFirebaseError(err.code) });
      throw err;
    }
  },

  // ─── Delete account (requires re-auth for email users) ──────────────────
  deleteAccount: async (password) => {
    set({ isLoading: true, error: null });
    const user = get().user;
    if (!user) throw new Error('Not authenticated');
    try {
      // Re-authenticate if password provided (email users)
      if (password && user.email) {
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
      }
      await deleteUser(user);
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (err: any) {
      set({ error: getFirebaseError(err.code), isLoading: false });
      throw err;
    }
  },

  // ─── Clear error ─────────────────────────────────────────────────────────
  clearError: () => set({ error: null }),

  // ─── Subscribe to auth state changes ────────────────────────────────────
  initialize: () => {
    if (!auth) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* values to your environment.',
      });
      return () => {};
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      set({
        user,
        isAuthenticated: !!user,
        isLoading: false,
      });
    });
    return unsubscribe;
  },
}));

// ==========================================================================
// HELPERS
// ==========================================================================
function getFirebaseError(code: string): string {
  const errors: Record<string, string> = {
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/requires-recent-login': 'Please sign out and sign back in to do this.',
    'auth/invalid-api-key': 'Firebase configuration is invalid or missing. Check your NEXT_PUBLIC_FIREBASE_* variables.',
  };
  return errors[code] ?? 'An unexpected error occurred. Please try again.';
}
