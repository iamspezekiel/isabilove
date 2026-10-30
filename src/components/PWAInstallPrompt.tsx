"use client";

import React, { useEffect, useState, useCallback } from 'react';

interface PWAInstallPromptProps {
  className?: string;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ className }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  const handleBeforeInstallPrompt = useCallback((e: Event) => {
    e.preventDefault();
    setDeferredPrompt(e);
  }, []);

  const handleAppInstalled = useCallback(() => {
    setIsInstalled(true);
    setDeferredPrompt(null);
  }, []);

  useEffect(() => {
    // Detect if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const ios =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(ios);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = useCallback(async () => {
    if (isIOS) {
      // iOS: show instructions to add to home screen
      alert('To install IsabiLove on iOS: tap the Share button (square with arrow), then tap "Add to Home Screen".');
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  }, [deferredPrompt, isIOS]);

  if (isInstalled) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#faf6ef] border border-[#8c6239]/25 shadow-xl text-xs sm:text-sm z-50 ${className || ''}`}
    >
      <div className="w-8 h-8 rounded-xl bg-[#8c6239] flex items-center justify-center text-[#faf6ef] shrink-0">
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="font-semibold text-[#2a241c]">Install IsabiLove</span>
        <span className="text-[#6f665c] leading-tight">Add to your home screen for quick access</span>
      </div>
      <button
        onClick={installApp}
        className="px-3 py-1.5 rounded-xl text-[#8c6239] font-semibold hover:bg-[#f3ece1]/50 transition-colors"
      >
        Install
      </button>
    </div>
  );
};