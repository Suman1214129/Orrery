'use client';

// ==========================================================================
// AUTH GUARD - Protects the app, shows AuthPage if not authenticated
// ==========================================================================
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { AuthPage } from './AuthPage';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, initialize } = useAuthStore();

  // Subscribe to Firebase auth state on mount
  useEffect(() => {
    const unsubscribe = initialize();
    return unsubscribe;
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-[12px] text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return <>{children}</>;
}
