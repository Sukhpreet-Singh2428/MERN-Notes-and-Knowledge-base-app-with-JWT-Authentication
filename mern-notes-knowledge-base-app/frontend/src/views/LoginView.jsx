import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginView({ onSwitchToRegister }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please provide both your email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password);
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-200">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl sm:rounded-3xl shadow-[0_4px_24px_-4px_rgba(48,55,47,0.08)] border border-surface-container p-6 sm:p-8 flex flex-col gap-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary flex items-center justify-center font-serif text-2xl font-bold shadow-sm">
            H
          </div>
          <div className="flex flex-col mt-1">
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-normal">
              Welcome back
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Sign in to your quiet workspace for ideas
            </p>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-error-container text-on-error-container font-body-sm text-body-sm flex items-start gap-2.5 animate-in fade-in"
          >
            <span className="material-symbols-outlined text-lg text-error shrink-0 mt-0.5">
              error
            </span>
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface" htmlFor="login-email">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-2.5 bg-surface-container-low rounded-xl font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/50 border border-transparent focus:border-primary-container focus:bg-surface-container-lowest focus:outline-none transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-surface-container-low rounded-xl font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/50 border border-transparent focus:border-primary-container focus:bg-surface-container-lowest focus:outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary transition-all shadow-[0_1px_2px_rgba(48,55,47,0.12)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-lg animate-spin">
                  progress_activity
                </span>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="pt-2 border-t border-surface-container/60 text-center">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="font-label-md text-primary hover:underline font-medium cursor-pointer ml-1"
            >
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

