"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function DemoPage() {
  const router = useRouter();
  const { loginAsGuest, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      loginAsGuest();
    }
  }, [isAuthenticated, isLoading, loginAsGuest]);

  // After guest login, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f3ece1] flex items-center justify-center p-6">
        <div className="text-center max-w-xs">
          <div className="w-12 h-12 rounded-xl bg-[#8c6239] flex items-center justify-center text-[#faf6ef] mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path>
            </svg>
          </div>
          <h2 className="text-lg font-bold text-[#2a241c] font-display mb-2">Entering IsabiLove demo</h2>
          <p className="text-xs text-[#6f665c]">Redirecting to your demo workspace…</p>
        </div>
      </div>
    );
  }

  return null;
}