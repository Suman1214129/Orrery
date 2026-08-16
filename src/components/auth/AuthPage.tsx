'use client';

// ==========================================================================
// AUTH PAGE - Premium Login/Signup/Forgot Password UI
// ==========================================================================
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

type View = 'login' | 'register' | 'forgot';

// Google Icon SVG
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

// ─── Input Field ─────────────────────────────────────────────────────────────
function AuthInput({
  type = 'text',
  placeholder,
  value,
  onChange,
  icon: Icon,
  rightElement,
  error,
  autoComplete,
}: {
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  icon: React.ElementType;
  rightElement?: React.ReactNode;
  error?: boolean;
  autoComplete?: string;
}) {
  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        autoComplete={autoComplete}
        className={cn(
          'w-full h-11 rounded-lg border bg-background pl-10 pr-10 text-sm outline-none transition-all duration-150',
          'placeholder:text-muted-foreground/50',
          'focus:ring-2 focus:ring-ring/30 focus:border-ring',
          error ? 'border-destructive focus:ring-destructive/30' : 'border-border',
        )}
      />
      {rightElement && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {rightElement}
        </div>
      )}
    </div>
  );
}

// ─── Password Input ──────────────────────────────────────────────────────────
function PasswordInput({
  placeholder = 'Password',
  value,
  onChange,
  error,
  autoComplete,
}: {
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  error?: boolean;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <AuthInput
      type={show ? 'text' : 'password'}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      icon={Lock}
      error={error}
      autoComplete={autoComplete}
      rightElement={
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="text-muted-foreground hover:text-foreground transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      }
    />
  );
}

// ─── Login View ──────────────────────────────────────────────────────────────
function LoginView({ onSwitch }: { onSwitch: (v: View) => void }) {
  const { signInWithEmail, signInWithGoogle, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => { clearError(); }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signInWithEmail(email, password);
    } catch {
      // error set by store
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch {
      // error set by store
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <AuthInput
          type="email"
          placeholder="Email address"
          value={email}
          onChange={setEmail}
          icon={Mail}
          autoComplete="email"
          error={!!error}
        />
        <PasswordInput
          value={password}
          onChange={setPassword}
          error={!!error}
          autoComplete="current-password"
        />
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-destructive text-[13px] bg-destructive/8 px-3 py-2 rounded-lg border border-destructive/20"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </motion.div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onSwitch('forgot')}
          className="text-[12px] text-muted-foreground hover:text-foreground transition-colors"
        >
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        disabled={submitting || !email || !password}
        className="h-11 w-full rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>Sign in <ArrowRight className="h-4 w-4" /></>
        )}
      </button>

      <div className="relative flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[11px] text-muted-foreground">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={googleLoading}
        className="h-11 w-full rounded-lg border border-border bg-background text-sm font-medium flex items-center justify-center gap-2.5 transition-all hover:bg-muted disabled:opacity-50"
      >
        {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
        Continue with Google
      </button>

      <p className="text-center text-[12px] text-muted-foreground">
        Don&apos;t have an account?{' '}
        <button
          type="button"
          onClick={() => onSwitch('register')}
          className="font-medium text-foreground hover:underline underline-offset-2"
        >
          Sign up
        </button>
      </p>
    </form>
  );
}

// ─── Register View ───────────────────────────────────────────────────────────
function RegisterView({ onSwitch }: { onSwitch: (v: View) => void }) {
  const { signUpWithEmail, signInWithGoogle, isLoading, error, clearError } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => { clearError(); }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    if (password !== confirm) {
      setValidationError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters.');
      return;
    }
    setSubmitting(true);
    try {
      await signUpWithEmail(name, email, password);
    } catch {
      // error set by store
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch {
      // error set by store
    } finally {
      setGoogleLoading(false);
    }
  };

  const displayError = validationError || error;

  return (
    <form onSubmit={handleSignUp} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <AuthInput
          placeholder="Your name"
          value={name}
          onChange={setName}
          icon={User}
          autoComplete="name"
        />
        <AuthInput
          type="email"
          placeholder="Email address"
          value={email}
          onChange={setEmail}
          icon={Mail}
          autoComplete="email"
          error={!!displayError}
        />
        <PasswordInput
          value={password}
          onChange={setPassword}
          error={!!displayError}
          autoComplete="new-password"
        />
        <PasswordInput
          placeholder="Confirm password"
          value={confirm}
          onChange={setConfirm}
          error={!!displayError}
          autoComplete="new-password"
        />
      </div>

      {displayError && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-destructive text-[13px] bg-destructive/8 px-3 py-2 rounded-lg border border-destructive/20"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {displayError}
        </motion.div>
      )}

      <button
        type="submit"
        disabled={submitting || !email || !password || !name}
        className="h-11 w-full rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>Create account <ArrowRight className="h-4 w-4" /></>
        )}
      </button>

      <div className="relative flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[11px] text-muted-foreground">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={googleLoading}
        className="h-11 w-full rounded-lg border border-border bg-background text-sm font-medium flex items-center justify-center gap-2.5 transition-all hover:bg-muted disabled:opacity-50"
      >
        {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
        Continue with Google
      </button>

      <p className="text-center text-[12px] text-muted-foreground">
        Already have an account?{' '}
        <button
          type="button"
          onClick={() => onSwitch('login')}
          className="font-medium text-foreground hover:underline underline-offset-2"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}

// ─── Forgot Password View ────────────────────────────────────────────────────
function ForgotView({ onSwitch }: { onSwitch: (v: View) => void }) {
  const { sendPasswordReset, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => { clearError(); }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await sendPasswordReset(email);
      setSent(true);
    } catch {
      // error in store
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl">
          ✉️
        </div>
        <div>
          <p className="text-sm font-medium">Check your inbox</p>
          <p className="text-[12px] text-muted-foreground mt-1">
            We sent a password reset link to <strong>{email}</strong>
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSwitch('login')}
          className="text-[13px] text-muted-foreground hover:text-foreground underline underline-offset-2"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleReset} className="flex flex-col gap-4">
      <p className="text-[13px] text-muted-foreground">
        Enter your email and we&apos;ll send you a link to reset your password.
      </p>
      <AuthInput
        type="email"
        placeholder="Email address"
        value={email}
        onChange={setEmail}
        icon={Mail}
        autoComplete="email"
        error={!!error}
      />
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-destructive text-[13px] bg-destructive/8 px-3 py-2 rounded-lg border border-destructive/20"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </motion.div>
      )}
      <button
        type="submit"
        disabled={submitting || !email}
        className="h-11 w-full rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 transition-all hover:bg-primary/90 disabled:opacity-50"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send reset link'}
      </button>
      <button
        type="button"
        onClick={() => onSwitch('login')}
        className="text-center text-[12px] text-muted-foreground hover:text-foreground"
      >
        ← Back to sign in
      </button>
    </form>
  );
}

// ==========================================================================
// MAIN AUTH PAGE
// ==========================================================================
const titles: Record<View, { heading: string; sub: string }> = {
  login: { heading: 'Welcome back', sub: 'Sign in to your workspace' },
  register: { heading: 'Create account', sub: 'Start your personal workspace' },
  forgot: { heading: 'Reset password', sub: 'We\'ll send a link to your inbox' },
};

export function AuthPage() {
  const [view, setView] = useState<View>('login');
  const { heading, sub } = titles[view];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Subtle grid background */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--foreground) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-sm"
      >
        {/* Card */}
        <div className="bg-card border border-border rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="mb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.18 }}
              >
                <h1 className="text-xl font-semibold text-foreground">{heading}</h1>
                <p className="text-[13px] text-muted-foreground mt-0.5">{sub}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Views */}
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, x: view === 'forgot' ? 20 : 0, y: view !== 'forgot' ? 10 : 0 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {view === 'login' && <LoginView onSwitch={setView} />}
              {view === 'register' && <RegisterView onSwitch={setView} />}
              {view === 'forgot' && <ForgotView onSwitch={setView} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-muted-foreground/50 mt-4">
          Your data stays on your device.
        </p>
      </motion.div>
    </div>
  );
}
