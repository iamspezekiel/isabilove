"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, useSearchParams, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { ReligionType, GenderType } from '../types';
import {
  Heart,
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle,
  BookOpen,
  Check,
  ArrowDown,
} from 'lucide-react';

interface AuthPageProps {
  initialMode?: 'login' | 'signup' | 'forgot';
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode }) => {
  const {
    user,
    isAuthenticated,
    loginGoogle,
    loginEmail,
    signupEmail,
    sendPasswordReset,
    loginAsGuest,
    error,
    clearError,
    isLoading,
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Mode from props, query param, or pathname
  const getInitialMode = (): 'login' | 'signup' | 'forgot' => {
    if (initialMode) return initialMode;
    const qMode = searchParams.get('mode');
    if (qMode === 'signup' || qMode === 'forgot') return qMode;
    if (location.pathname.includes('signup')) return 'signup';
    if (location.pathname.includes('forgot')) return 'forgot';
    return 'login';
  };

  const { subscription, updateSubscription } = useApp();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(getInitialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [gender, setGender] = useState<GenderType>('female');
  const [religion, setReligion] = useState<ReligionType>('christianity');
  const [localError, setLocalError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    // Hidden direct demo access via dedicated URL /demo or ?mode=demo / ?demo=true
    const isDemoTriggered =
      location.pathname === '/demo' ||
      searchParams.get('mode') === 'demo' ||
      searchParams.get('demo') === 'true' ||
      searchParams.get('demo') === '1';

    if (isDemoTriggered && !isAuthenticated) {
      loginAsGuest();
      navigate(from, { replace: true });
      return;
    }

    setMode(getInitialMode());
  }, [location.pathname, searchParams, isAuthenticated]);

  const stateFrom = (location.state as { from?: { pathname?: string; search?: string } | string })?.from;
  const from = typeof stateFrom === 'string'
    ? stateFrom
    : (stateFrom?.pathname ? `${stateFrom.pathname}${stateFrom.search || ''}` : '/');

  if (isAuthenticated && !isLoading) {
    return <Navigate to={from} replace />;
  }

  if (isLoading && !user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-center max-w-xs">
          <div className="w-12 h-12 rounded-xl bg-[#8c6239] flex items-center justify-center text-[#faf6ef]">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-[#2a241c] font-display">IsabiLove</h2>
            <p className="text-xs text-[#6f665c]">Entering your haven...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email.trim()) {
      setLocalError('Please enter your email address.');
      return;
    }

    try {
      if (mode === 'login') {
        if (!password) {
          setLocalError('Please enter your password.');
          return;
        }
        await loginEmail(email.trim(), password);
        navigate(from, { replace: true });
      } else if (mode === 'signup') {
        if (!password || password.length < 6) {
          setLocalError('Password must contain at least 6 characters.');
          return;
        }
        await signupEmail(email.trim(), password, name.trim() || undefined, religion, gender);
        updateSubscription({
          ...subscription,
          userName: name.trim() || subscription.userName,
          userEmail: email.trim(),
          religion,
          gender,
        });
        navigate(from, { replace: true });
      } else if (mode === 'forgot') {
        await sendPasswordReset(email.trim());
        setResetSent(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication could not be completed';
      setLocalError(msg);
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    clearError();
    try {
      await loginGoogle();
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in could not be completed';
      setLocalError(msg);
    }
  };

  const handleInstantDemo = () => {
    loginAsGuest();
    navigate(from, { replace: true });
  };

  const displayError = localError || error;

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center py-6 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Icon & Heading */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#8c6239] flex items-center justify-center text-[#faf6ef] mx-auto shadow-xs">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-[#2a241c] font-display">
            {mode === 'login' && 'Enter Your Haven'}
            {mode === 'signup' && 'Create Your Haven'}
            {mode === 'forgot' && 'Password Recovery'}
          </h1>
          <p className="text-xs text-[#6f665c] max-w-xs mx-auto leading-relaxed">
            {mode === 'login' && 'Sign in to access your loved ones and scheduled remembrances.'}
            {mode === 'signup' && 'Keep cherished dates, personal preferences, and timely blessings.'}
            {mode === 'forgot' && 'Enter your email to receive a password reset link.'}
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-[#faf6ef] border border-[#8c6239]/25 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
          {displayError && (
            <div className="p-3.5 rounded-xl bg-[#f3ece1] border border-[#8c6239]/25 text-xs text-[#2a241c] flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#8c6239] shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{displayError}</div>
            </div>
          )}

          {mode === 'forgot' && resetSent ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#f3ece1] border border-[#8c6239]/30 flex items-center justify-center text-[#8c6239] mx-auto">
                <CheckCircle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#2a241c] font-display">Check your inbox</h3>
              <p className="text-xs text-[#6f665c] leading-relaxed">
                We sent a password reset link to <strong className="text-[#2a241c]">{email}</strong>. Please follow the instructions in the email.
              </p>
              <button
                type="button"
                onClick={() => {
                  setResetSent(false);
                  setMode('login');
                }}
                className="mt-2 min-h-[44px] px-4 py-2 text-xs font-semibold text-[#8c6239] hover:underline cursor-pointer"
              >
                Return to Sign In
              </button>
            </div>
          ) : (
            <>
              {/* Google OAuth Button */}
              {mode !== 'forgot' && (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full min-h-[46px] py-2.5 px-4 bg-[#faf6ef] hover:bg-[#f3ece1] text-[#2a241c] border border-[#8c6239]/30 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  <div className="flex items-center gap-3 my-2 text-[11px] text-[#6f665c]">
                    <div className="h-px bg-[#8c6239]/15 flex-1" />
                    <span>or continue with email</span>
                    <div className="h-px bg-[#8c6239]/15 flex-1" />
                  </div>
                </div>
              )}

              {/* Email & Password Form */}
              <form onSubmit={handleAuthSubmit} className="space-y-3.5 text-xs">
                {mode === 'signup' && (
                  <>
                    <div>
                      <label className="block font-semibold text-[#2a241c] mb-1">
                        Your Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6f665c]" />
                        <input
                          type="text"
                          placeholder="Samuel Adebayo"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 min-h-[44px] rounded-xl border border-[#8c6239]/30 focus:outline-none focus:border-[#8c6239] bg-[#faf6ef] text-[#2a241c]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-[#2a241c] mb-1.5">
                        Your Gender
                      </label>
                      <div className="relative">
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value as GenderType)}
                          className="w-full pl-3 pr-10 py-2.5 min-h-[44px] rounded-xl border border-[#8c6239]/30 focus:outline-none focus:border-[#8c6239] bg-[#faf6ef] text-[#2a241c] text-xs cursor-pointer appearance-none"
                        >
                          <option value="female">Female</option>
                          <option value="male">Male</option>
                          <option value="prefer_not_to_say">Prefer not to say</option>
                        </select>
                        <ArrowDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#6f665c]" />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-[#2a241c] mb-1.5">
                        Your Faith & Perspective
                        <span className="block text-[11px] font-normal text-[#6f665c] mt-0.5">
                          Tailors devotional verses, tone, and epistles to your heart
                        </span>
                      </label>
                      <div className="relative">
                        <select
                          value={religion}
                          onChange={(e) => setReligion(e.target.value as ReligionType)}
                          className="w-full pl-3 pr-10 py-2.5 min-h-[44px] rounded-xl border border-[#8c6239]/30 focus:outline-none focus:border-[#8c6239] bg-[#faf6ef] text-[#2a241c] text-xs cursor-pointer appearance-none"
                        >
                          <option value="christianity">Christianity</option>
                          <option value="muslim">Muslim</option>
                          <option value="none">No religion</option>
                        </select>
                        <ArrowDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#6f665c]" />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block font-semibold text-[#2a241c] mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6f665c]" />
                    <input
                      type="email"
                      required
                      placeholder="samuel@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 min-h-[44px] rounded-xl border border-[#8c6239]/30 focus:outline-none focus:border-[#8c6239] bg-[#faf6ef] text-[#2a241c]"
                    />
                  </div>
                </div>

                {mode !== 'forgot' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-[#2a241c]">Password</label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => setMode('forgot')}
                          className="text-[11px] font-medium text-[#8c6239] hover:underline cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6f665c]" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2.5 min-h-[44px] rounded-xl border border-[#8c6239]/30 focus:outline-none focus:border-[#8c6239] bg-[#faf6ef] text-[#2a241c]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6f665c] hover:text-[#2a241c]"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Primary Submit Button */}
                <button
                  type="submit"
                  className="w-full min-h-[48px] py-2.5 px-4 bg-[#2a241c] hover:bg-[#2a241c]/90 text-[#faf6ef] rounded-xl text-xs font-semibold transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  <span>
                    {mode === 'login' && 'Sign In'}
                    {mode === 'signup' && 'Create Account'}
                    {mode === 'forgot' && 'Send Recovery Link'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#8c6239]" />
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer Mode Switcher */}
        <div className="text-center text-xs text-[#6f665c]">
          {mode === 'login' && (
            <p>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="font-bold text-[#8c6239] hover:underline cursor-pointer"
              >
                Create Free Account
              </button>
            </p>
          )}
          {mode === 'signup' && (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-bold text-[#8c6239] hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          )}
          {mode === 'forgot' && (
            <button
              type="button"
              onClick={() => setMode('login')}
              className="font-bold text-[#8c6239] hover:underline cursor-pointer"
            >
              Back to Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
