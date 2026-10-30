"use client";

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Lock,
  KeyRound,
  LogOut,
  AlertTriangle,
  Check,
  AlertCircle,
  ArrowLeft,
  Copy,
} from 'lucide-react';

export const AccountPage: React.FC = () => {
  const { subscription, updateSubscription } = useApp();
  const { user, logout, sendPasswordReset, error, clearError, isLoading } = useAuth();
  const navigate = useNavigate();

  const [userName, setUserName] = useState(subscription.userName || user?.displayName || '');
  const [userEmail, setUserEmail] = useState(subscription.userEmail || user?.email || '');
  const [userPhone, setUserPhone] = useState(subscription.userPhone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const [copyEmail, setCopyEmail] = useState(false);
  const [copyPhone, setCopyPhone] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();
    try {
      await updateSubscription({
        ...subscription,
        userName: userName.trim(),
        userEmail: userEmail.trim(),
        userPhone: userPhone.trim() || undefined,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save profile';
      setLocalError(msg);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();
    if (!newPassword || newPassword.length < 6) {
      setLocalError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }
    setLocalError('Password change requires signing out and back in. Use "Forgot Password" on the login page.');
  };

  const handlePasswordReset = async () => {
    setLocalError(null);
    clearError();
    try {
      await sendPasswordReset(userEmail.trim() || user?.email || '');
      setResetSent(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Password reset failed';
      setLocalError(msg);
    }
  };

  const handleCopyEmail = () => {
    const email = userEmail || user?.email;
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopyEmail(true);
    setTimeout(() => setCopyEmail(false), 2000);
  };

  const handleCopyPhone = () => {
    if (!userPhone) return;
    navigator.clipboard.writeText(userPhone);
    setCopyPhone(true);
    setTimeout(() => setCopyPhone(false), 2000);
  };

  const displayError = localError || error;

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center py-6 px-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl border border-[#8c6239]/30 flex items-center justify-center text-[#6f665c] hover:bg-[#f3ece1] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl font-normal tracking-tight text-[#2a241c] font-display">
              Account Settings
            </h1>
            <p className="text-xs text-[#6f665c]">Manage your profile and sign-in details.</p>
          </div>
        </div>

        <div className="bg-[#faf6ef] border border-[#8c6239]/25 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
          {displayError && (
            <div className="p-3.5 rounded-xl bg-[#f3ece1] border border-[#8c6239]/25 text-xs text-[#2a241c] flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#8c6239] shrink-0 mt-0.5" />
              <span>{displayError}</span>
            </div>
          )}

          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-[#2a241c] uppercase tracking-wider">Profile</h2>
            <div className="space-y-3">
              <div className="relative group">
                <label className="block font-semibold text-[#2a241c] mb-1">Full Name</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Your name"
                    className="w-full pl-9 pr-3 py-2.5 min-h-[44px] rounded-xl border border-[#8c6239]/30 focus:outline-none focus:border-[#8c6239] bg-[#faf6ef] text-[#2a241c]"
                  />
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6f665c]" />
                </div>
              </div>

              <div className="relative group flex items-center gap-2">
                <label className="block font-semibold text-[#2a241c] mb-1">Email Address</label>
                <div className="flex-1 relative">
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-12 py-2.5 min-h-[44px] rounded-xl border border-[#8c6239]/30 focus:outline-none focus:border-[#8c6239] bg-[#faf6ef] text-[#2a241c]"
                  />
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6f665c]" />
                  <button
                    onClick={handleCopyEmail}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs transition-colors ${copyEmail ? 'text-[#8c6239]' : 'text-[#6f665c]'}`}
                    title="Copy email"
                  >
                    {copyEmail ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="relative group flex items-center gap-2">
                <label className="block font-semibold text-[#2a241c] mb-1">Phone Number</label>
                <div className="flex-1 relative">
                  <input
                    type="tel"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-9 pr-12 py-2.5 min-h-[44px] rounded-xl border border-[#8c6239]/30 focus:outline-none focus:border-[#8c6239] bg-[#faf6ef] text-[#2a241c]"
                  />
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6f665c]" />
                  {userPhone && (
                    <button
                      onClick={handleCopyPhone}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs transition-colors ${copyPhone ? 'text-[#8c6239]' : 'text-[#6f665c]'}`}
                      title="Copy phone"
                    >
                      {copyPhone ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                className="w-full min-h-[44px] px-4 py-2.5 bg-[#2a241c] hover:bg-[#2a241c]/90 text-[#faf6ef] rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 text-[#8c6239]" />
                Save Profile
              </button>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-[#2a241c] uppercase tracking-wider">Password</h2>
            <p className="text-xs text-[#6f665c]">
              Change your account password or reset it via email.
            </p>

            <div className="space-y-3">
              <div className="relative">
                <label className="block font-semibold text-[#2a241c] mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 min-h-[44px] rounded-xl border border-[#8c6239]/30 focus:outline-none focus:border-[#8c6239] bg-[#faf6ef] text-[#2a241c]"
                />
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6f665c]" />
              </div>

              <div className="relative">
                <label className="block font-semibold text-[#2a241c] mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 min-h-[44px] rounded-xl border border-[#8c6239]/30 focus:outline-none focus:border-[#8c6239] bg-[#faf6ef] text-[#2a241c]"
                />
                <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6f665c]" />
              </div>

              <div className="relative">
                <label className="block font-semibold text-[#2a241c] mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 min-h-[44px] rounded-xl border border-[#8c6239]/30 focus:outline-none focus:border-[#8c6239] bg-[#faf6ef] text-[#2a241c]"
                />
                <Check className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6f665c]" />
              </div>

              <button
                onClick={handleChangePassword}
                disabled={isLoading}
                className="w-full min-h-[44px] px-4 py-2.5 bg-[#8c6239] hover:bg-[#8c6239]/90 text-[#faf6ef] rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Password
              </button>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#f3ece1]/40 border border-[#8c6239]/15">
              <div>
                <p className="font-semibold text-[#2a241c]">Forgot Password?</p>
                <p className="text-[#6f665c] text-[11px]">
                  Send a secure password recovery link to your email ({userEmail || user?.email || ''})
                </p>
                {resetSent && (
                  <p className="text-[11px] text-[#8c6239] font-medium mt-1">
                    Recovery link sent to your inbox.
                  </p>
                )}
              </div>
              <button
                onClick={handlePasswordReset}
                disabled={isLoading || resetSent}
                className="min-h-[44px] px-4 py-2 text-xs font-semibold text-[#2a241c] bg-[#faf6ef] hover:bg-[#f3ece1] border border-[#8c6239]/25 rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed self-start sm:self-auto shrink-0 shadow-xs"
              >
                {resetSent ? 'Link Sent' : 'Send Reset Link'}
              </button>
            </div>
          </section>

          {showResetConfirm ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2a241c]/50 backdrop-blur-xs p-4">
              <div className="bg-[#faf6ef] border border-[#8c6239]/30 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
                <div className="flex items-center gap-2.5 text-[#8c6239]">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="font-bold text-sm text-[#2a241c] font-display">Sign Out?</h3>
                </div>
                <p className="text-xs text-[#6f665c] leading-relaxed">
                  You will be signed out of your account on this browser.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="min-h-[44px] px-3 py-2 text-xs font-semibold rounded-xl bg-[#f3ece1] text-[#6f665c] hover:bg-[#f3ece1]/80 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await logout();
                      navigate('/login', { replace: true });
                    }}
                    className="min-h-[44px] px-3 py-2 text-xs font-semibold rounded-xl bg-[#2a241c] text-[#faf6ef] hover:bg-[#2a241c]/90 cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <section className="space-y-3 pt-2">
              <h2 className="text-sm font-semibold text-[#2a241c] uppercase tracking-wider">Session</h2>
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="w-full min-h-[44px] px-4 py-2.5 border border-[#8c6239]/25 rounded-xl text-[#8c6239] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer hover:bg-[#f3ece1]"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out of IsabiLove</span>
              </button>
            </section>
          )}
        </div>

        <div className="text-center text-xs text-[#6f665c]">
          IsabiLove • A quiet haven to remember & cherish loved ones
        </div>
      </div>
    </div>
  );
};
