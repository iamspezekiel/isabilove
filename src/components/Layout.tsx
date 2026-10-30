"use client";

import React, { useState, useRef, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  Heart,
  Sparkles,
  Users,
  Calendar,
  Clock,
  Home,
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  LogOut,
  LogIn,
  Bell,
  Settings,
  Crown,
  User as UserIcon,
  BookOpen,
} from 'lucide-react';

// Local NavLink component that mirrors react-router-dom's NavLink using Next.js
const NavLink = ({
  to,
  children,
  className,
  end = false,
  ...rest
}: {
  to: string;
  children: ReactNode;
  className: (props: { isActive: boolean }) => string;
  end?: boolean;
}) => {
  const pathname = usePathname();
  const isActive = end
    ? pathname === to
    : pathname === to || pathname.startsWith(to + '/');
  return (
    <Link href={to} className={className({ isActive })} {...rest}>
      {children}
    </Link>
  );
};

export const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { drafts, subscription, toast, hideToast } = useApp();
  const { user, isAuthenticated, logout, loginAsGuest } = useAuth();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const authRoutes = ['/auth/login', '/auth/signup', '/auth/forgot-password', '/auth/reset-password', '/demo'];
  const pathname = usePathname();
  const isAuthPage = authRoutes.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  const pendingApprovalsCount = isAuthenticated
    ? drafts.filter((d) => d.status === 'pending_approval').length
    : 0;

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-[#f3ece1] text-[#2a241c] flex flex-col font-sans selection:bg-[#8c6239]/20 selection:text-[#2a241c] overflow-x-hidden w-full">
      {/* ================= Ultra-Clean Floating Top Bar: Hidden on Auth Pages ================= */}
      {!isAuthPage && (
        <div className="sticky top-2 sm:top-3 z-30 px-3 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto pointer-events-none">
          <header className="pointer-events-auto bg-[#faf6ef]/95 backdrop-blur-md border border-[#8c6239]/20 shadow-[0_4px_24px_rgba(42,36,28,0.06)] rounded-2xl sm:rounded-3xl px-3.5 sm:px-5">
            <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Left Zone: Brand Mark & Title */}
            <div className="flex items-center gap-2.5 shrink-0">
              <Link
                href="/"
                className="flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8c6239] rounded-lg min-h-[44px] min-w-[44px] py-1"
                aria-label="IsabiLove Home"
              >
                {/* Brand Mark with bronze tone */}
                <div className="w-8 h-8 rounded-lg bg-[#8c6239] flex items-center justify-center text-[#faf6ef] shadow-xs shrink-0">
                  <Heart className="w-4 h-4 fill-[#faf6ef]" />
                </div>
                {/* Brand Title in Fraunces display font */}
                <div className="flex flex-col">
                  <span className="text-lg sm:text-xl font-bold tracking-tight text-[#2a241c] font-display">
                    IsabiLove
                  </span>
                </div>
              </Link>
            </div>

            {/* Center Zone: Desktop Primary Navigation */}
            {isAuthenticated && (
              <nav className="hidden md:flex items-center gap-1 bg-[#f3ece1]/80 p-1 rounded-2xl border border-[#8c6239]/15" aria-label="Desktop Primary Navigation">
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `px-3 py-1.5 text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5 min-h-[38px] ${
                      isActive
                        ? 'bg-[#faf6ef] text-[#2a241c] shadow-xs border border-[#8c6239]/30 font-bold'
                        : 'text-[#6f665c] hover:text-[#2a241c] hover:bg-[#faf6ef]/60'
                    }`
                  }
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Home</span>
                </NavLink>

                <NavLink
                  to="/contacts"
                  className={({ isActive }) =>
                    `px-3 py-1.5 text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5 min-h-[38px] ${
                      isActive
                        ? 'bg-[#faf6ef] text-[#2a241c] shadow-xs border border-[#8c6239]/30 font-bold'
                        : 'text-[#6f665c] hover:text-[#2a241c] hover:bg-[#faf6ef]/60'
                    }`
                  }
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Loved Ones</span>
                </NavLink>

                <NavLink
                  to="/queue"
                  className={({ isActive }) =>
                    `px-3 py-1.5 text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5 min-h-[38px] relative ${
                      isActive
                        ? 'bg-[#faf6ef] text-[#2a241c] shadow-xs border border-[#8c6239]/30 font-bold'
                        : 'text-[#6f665c] hover:text-[#2a241c] hover:bg-[#faf6ef]/60'
                    }`
                  }
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Queue</span>
                  {pendingApprovalsCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[#8c6239] text-[#faf6ef] text-[9px] font-mono font-bold flex items-center justify-center">
                      {pendingApprovalsCount}
                    </span>
                  )}
                </NavLink>

                <NavLink
                  to="/reminders"
                  className={({ isActive }) =>
                    `px-3 py-1.5 text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5 min-h-[38px] ${
                      isActive
                        ? 'bg-[#faf6ef] text-[#2a241c] shadow-xs border border-[#8c6239]/30 font-bold'
                        : 'text-[#6f665c] hover:text-[#2a241c] hover:bg-[#faf6ef]/60'
                    }`
                  }
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Schedule</span>
                </NavLink>

                <NavLink
                  to="/studio"
                  className={({ isActive }) =>
                    `px-3 py-1.5 text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5 min-h-[38px] ${
                      isActive
                        ? 'bg-[#faf6ef] text-[#2a241c] shadow-xs border border-[#8c6239]/30 font-bold'
                        : 'text-[#6f665c] hover:text-[#8c6239] hover:bg-[#faf6ef]/60'
                    }`
                  }
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#8c6239]" />
                  <span>AI Studio</span>
                </NavLink>

                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    `px-3 py-1.5 text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5 min-h-[38px] ${
                      isActive
                        ? 'bg-[#faf6ef] text-[#2a241c] shadow-xs border border-[#8c6239]/30 font-bold'
                        : 'text-[#6f665c] hover:text-[#2a241c] hover:bg-[#faf6ef]/60'
                    }`
                  }
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Settings & Account</span>
                </NavLink>
              </nav>
            )}

            {/* Right Zone: Remembrances & Profile Access */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              {/* Notification Page Link */}
              <NavLink
                to="/notifications"
                className={({ isActive }) =>
                  `w-10 h-10 flex items-center justify-center rounded-xl transition-colors relative min-h-[44px] min-w-[44px] cursor-pointer ${
                    isActive
                      ? 'bg-[#f3ece1] text-[#2a241c] border border-[#8c6239]/30 font-bold'
                      : 'text-[#6f665c] hover:text-[#2a241c] hover:bg-[#f3ece1]/80'
                  }`
                }
                aria-label="Remembrances & Notifications"
              >
                <Bell className="w-5 h-5" />
                {pendingApprovalsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#8c6239] text-[#faf6ef] text-[9px] font-mono font-bold flex items-center justify-center shadow-xs">
                    {pendingApprovalsCount}
                  </span>
                )}
              </NavLink>

              {/* Profile Icon Button on Header */}
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(!isProfileOpen);
                  }}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors relative cursor-pointer min-h-[44px] min-w-[44px] ${
                    isProfileOpen
                      ? 'bg-[#f3ece1] text-[#2a241c]'
                      : 'text-[#6f665c] hover:text-[#2a241c] hover:bg-[#f3ece1]/80'
                  }`}
                  aria-label="User Profile"
                >
                  {isAuthenticated && user ? (
                    user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile Avatar"
                        className="w-7 h-7 rounded-full object-cover border border-[#8c6239]/30"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#8c6239] text-[#faf6ef] text-[11px] font-bold flex items-center justify-center">
                        {(user.displayName || user.email || 'U')[0]!.toUpperCase()}
                      </div>
                    )
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#f3ece1] border border-[#8c6239]/30 flex items-center justify-center text-[#6f665c]">
                      <UserIcon className="w-4 h-4" />
                    </div>
                  )}

                  {/* Active authentication status dot */}
                  {isAuthenticated && (
                    <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-[#8c6239] border-2 border-[#faf6ef]" />
                  )}
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#faf6ef] border border-[#8c6239]/25 rounded-2xl shadow-xl p-3 z-50 space-y-2">
                    {isAuthenticated && user ? (
                      <>
                        <Link
                          href="/settings"
                          onClick={() => setIsProfileOpen(false)}
                          className="block p-3 bg-[#f3ece1]/70 hover:bg-[#f3ece1] rounded-xl border border-[#8c6239]/15 transition-colors"
                        >
                          <p className="text-xs font-bold text-[#2a241c] font-display truncate">
                            {user.displayName || 'Faithful Scribe'}
                          </p>
                          <p className="text-[11px] text-[#6f665c] truncate">
                            {user.email || 'companion@isabilove.demo'}
                          </p>
                        </Link>

                        <div className="space-y-1 text-xs">
                          <Link
                            href="/settings"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#2a241c] hover:bg-[#f3ece1] transition-colors min-h-[44px]"
                          >
                            <Settings className="w-4 h-4 text-[#8c6239]" />
                            <span className="font-medium">Settings & Account</span>
                          </Link>
                        </div>

                        <div className="pt-2 border-t border-[#8c6239]/15">
                          <button
                            type="button"
                            onClick={async () => {
                              setIsProfileOpen(false);
                              await logout();
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#8c6239] hover:bg-[#f3ece1] rounded-xl transition-colors cursor-pointer min-h-[44px]"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-3 bg-[#f3ece1]/70 rounded-xl border border-[#8c6239]/15">
                          <p className="text-xs font-bold text-[#2a241c] font-display">Your Haven</p>
                          <p className="text-[11px] text-[#6f665c]">Sign in to access your records</p>
                        </div>

                        <p className="text-xs text-[#6f665c] px-1 leading-relaxed">
                          Enter your haven to keep cherished dates, memories, and heartfelt words.
                        </p>

                        <div className="pt-1">
                          <Link
                            href="/auth/login"
                            onClick={() => setIsProfileOpen(false)}
                            className="w-full py-2.5 px-3 bg-[#2a241c] hover:bg-[#2a241c]/90 text-[#faf6ef] rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer min-h-[44px]"
                          >
                            <LogIn className="w-3.5 h-3.5" />
                            <span>Sign In / Sign Up</span>
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
      </div>
      )}

      {/* Main Page Viewport with clearance for bottom thumb bar on mobile */}
      <main
        className={`flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 ${
          isAuthPage ? 'pt-6 sm:pt-12 flex flex-col justify-center' : 'pt-4 sm:pt-6'
        } ${isAuthenticated ? 'pb-16 md:pb-8' : 'pb-8'}`}
      >
        {children}
      </main>

      {/* ================= Mobile-First Thumb-Zone Bottom App Navigation Bar ================= */}
      {isAuthenticated && (
        <div className="fixed bottom-3 inset-x-0 mx-auto w-[calc(100%-1.25rem)] max-w-lg z-40 pointer-events-none md:hidden">
          <nav
            className="pointer-events-auto bg-[#faf6ef]/95 backdrop-blur-md border border-[#8c6239]/25 shadow-[0_8px_24px_rgba(42,36,28,0.12)] rounded-2xl p-1.5 flex items-center justify-around"
            aria-label="Mobile Bottom Navigation"
          >
            {/* Tab 1: Home */}
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl min-h-[44px] transition-colors ${
                  isActive
                    ? 'bg-[#f3ece1] text-[#2a241c] font-bold border border-[#8c6239]/30'
                    : 'text-[#6f665c] hover:text-[#2a241c]'
                }`
              }
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px] tracking-tight mt-0.5">Home</span>
            </NavLink>

            {/* Tab 2: Loved Ones */}
            <NavLink
              to="/contacts"
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl min-h-[44px] transition-colors ${
                  isActive
                    ? 'bg-[#f3ece1] text-[#2a241c] font-bold border border-[#8c6239]/30'
                    : 'text-[#6f665c] hover:text-[#2a241c]'
                }`
              }
            >
              <Users className="w-5 h-5" />
              <span className="text-[10px] tracking-tight mt-0.5">Loved Ones</span>
            </NavLink>

            {/* Tab 3: Central Studio (Primary Thumb Trigger) */}
            <NavLink
              to="/studio"
              className="flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl min-h-[44px] relative"
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`w-9 h-9 -mt-3 rounded-xl flex items-center justify-center shadow-xs transition-colors ${
                      isActive
                        ? 'bg-[#2a241c] text-[#faf6ef] ring-2 ring-[#8c6239]'
                        : 'bg-[#8c6239] text-[#faf6ef]'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 fill-current" />
                  </div>
                  <span
                    className={`text-[10px] tracking-tight mt-0.5 font-medium ${
                      isActive ? 'text-[#2a241c] font-bold' : 'text-[#6f665c]'
                    }`}
                  >
                    Scribe
                  </span>
                </>
              )}
            </NavLink>

            {/* Tab 4: Queue */}
            <NavLink
              to="/queue"
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl min-h-[44px] transition-colors relative ${
                  isActive
                    ? 'bg-[#f3ece1] text-[#2a241c] font-bold border border-[#8c6239]/30'
                    : 'text-[#6f665c] hover:text-[#2a241c]'
                }`
              }
            >
              <div className="relative">
                <Clock className="w-5 h-5" />
                {pendingApprovalsCount > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#8c6239] text-[#faf6ef] text-[9px] font-mono font-bold flex items-center justify-center">
                    {pendingApprovalsCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">Queue</span>
            </NavLink>

            {/* Tab 5: Schedule */}
            <NavLink
              to="/reminders"
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl min-h-[44px] transition-colors ${
                  isActive
                    ? 'bg-[#f3ece1] text-[#2a241c] font-bold border border-[#8c6239]/30'
                    : 'text-[#6f665c] hover:text-[#2a241c]'
                }`
              }
            >
              <Calendar className="w-5 h-5" />
              <span className="text-[10px] tracking-tight mt-0.5">Schedule</span>
            </NavLink>
          </nav>
        </div>
      )}

      {/* Global Floating Toast */}
      {toast && (
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-50 flex items-center justify-between sm:justify-start gap-3 px-4 py-3 rounded-2xl bg-[#2a241c] text-[#faf6ef] border border-[#8c6239]/40 shadow-xl text-xs sm:text-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#faf6ef] shrink-0" />}
            {toast.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-300 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-[#8c6239] shrink-0" />}
            <span className="font-medium truncate">{toast.message}</span>
          </div>
          <button
            onClick={hideToast}
            className="w-8 h-8 flex items-center justify-center text-[#faf6ef]/70 hover:text-white rounded-lg cursor-pointer shrink-0 min-h-[44px] min-w-[44px]"
            aria-label="Dismiss Notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
