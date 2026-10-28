import React from 'react';
import { ActiveTab, UserSubscription } from '../types';
import {
  Heart,
  Sparkles,
  Users,
  Calendar,
  Clock,
  History,
  Settings,
  Crown,
  Home,
  Plus,
} from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  pendingApprovalsCount: number;
  subscription: UserSubscription;
  onOpenUpgrade: () => void;
  onOpenSettings: () => void;
  onNewMessage: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  pendingApprovalsCount,
  subscription,
  onOpenUpgrade,
  onOpenSettings,
  onNewMessage,
}) => {
  return (
    <>
      {/* ================= Compact Mobile & Desktop Top App Bar ================= */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-4">
            {/* Zone 1: Brand Wordmark */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center gap-2 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded-md min-h-[44px] min-w-[44px]"
                aria-label="IsabiLove Home"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white shadow-xs">
                  <Heart className="w-4 h-4 fill-white" />
                </div>
                <span className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 font-display">
                  IsabiLove
                </span>
              </button>
            </div>

            {/* Desktop Navigation Links (Hidden on Mobile) */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-neutral-600">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-2 rounded-md transition-colors whitespace-nowrap cursor-pointer min-h-[40px] ${
                  activeTab === 'dashboard'
                    ? 'text-neutral-950 font-semibold bg-neutral-100'
                    : 'hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('contacts')}
                className={`px-3 py-2 rounded-md transition-colors whitespace-nowrap cursor-pointer min-h-[40px] ${
                  activeTab === 'contacts'
                    ? 'text-neutral-950 font-semibold bg-neutral-100'
                    : 'hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                Loved Ones
              </button>
              <button
                onClick={() => setActiveTab('reminders')}
                className={`px-3 py-2 rounded-md transition-colors whitespace-nowrap cursor-pointer min-h-[40px] ${
                  activeTab === 'reminders'
                    ? 'text-neutral-950 font-semibold bg-neutral-100'
                    : 'hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                Reminders
              </button>
              <button
                onClick={() => setActiveTab('queue')}
                className={`relative px-3 py-2 rounded-md transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 min-h-[40px] ${
                  activeTab === 'queue'
                    ? 'text-neutral-950 font-semibold bg-neutral-100'
                    : 'hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                <span>Approval Queue</span>
                {pendingApprovalsCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-xs font-mono font-semibold flex items-center justify-center tabular-nums">
                    {pendingApprovalsCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('studio')}
                className={`px-3 py-2 rounded-md transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 min-h-[40px] ${
                  activeTab === 'studio'
                    ? 'text-neutral-950 font-semibold bg-neutral-100'
                    : 'hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                <span>AI Studio</span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-3 py-2 rounded-md transition-colors whitespace-nowrap cursor-pointer min-h-[40px] ${
                  activeTab === 'history'
                    ? 'text-neutral-950 font-semibold bg-neutral-100'
                    : 'hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                History
              </button>
            </nav>

            {/* Zone 3: Actions & Subscription Trigger */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onOpenUpgrade}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer min-h-[38px] ${
                  subscription.tier === 'pro'
                    ? 'bg-amber-50 text-amber-900 border-amber-200'
                    : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                }`}
                aria-label="Manage Subscription"
              >
                {subscription.tier === 'pro' ? (
                  <>
                    <Crown className="w-3.5 h-3.5 text-amber-600" />
                    <span className="font-semibold hidden xs:inline">Pro</span>
                  </>
                ) : (
                  <>
                    <span className="text-neutral-500 hidden xs:inline">Free</span>
                    <span className="text-rose-600 font-semibold">Upgrade</span>
                  </>
                )}
              </button>

              <button
                onClick={onNewMessage}
                className="hidden sm:flex px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors shadow-xs items-center gap-1.5 cursor-pointer min-h-[38px] whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Craft Note</span>
              </button>

              <button
                onClick={onOpenSettings}
                className="w-10 h-10 flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                aria-label="Settings and Timezone"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ================= Fixed Bottom Thumb Tab Bar (Pattern 1 Mobile First) ================= */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 shadow-lg"
        aria-label="Mobile Navigation"
      >
        <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-2">
          {/* Tab 1: Home/Dashboard */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors ${
              activeTab === 'dashboard' ? 'text-rose-600 font-semibold' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1 font-medium">Home</span>
          </button>

          {/* Tab 2: Loved Ones */}
          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors ${
              activeTab === 'contacts' ? 'text-rose-600 font-semibold' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1 font-medium">Loved Ones</span>
          </button>

          {/* Tab 3: AI Studio (Central Prominent Action) */}
          <button
            onClick={() => setActiveTab('studio')}
            className="flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer relative"
          >
            <div
              className={`w-10 h-10 -mt-3 rounded-full flex items-center justify-center shadow-md transition-transform active:scale-95 ${
                activeTab === 'studio' ? 'bg-rose-700 text-white' : 'bg-rose-600 text-white'
              }`}
            >
              <Sparkles className="w-5 h-5 fill-white/20" />
            </div>
            <span
              className={`text-[10px] tracking-tight mt-0.5 font-medium ${
                activeTab === 'studio' ? 'text-rose-600 font-bold' : 'text-neutral-600'
              }`}
            >
              AI Studio
            </span>
          </button>

          {/* Tab 4: Approval Queue */}
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors relative ${
              activeTab === 'queue' ? 'text-rose-600 font-semibold' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <div className="relative">
              <Clock className="w-5 h-5" />
              {pendingApprovalsCount > 0 && (
                <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-mono font-bold flex items-center justify-center">
                  {pendingApprovalsCount}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-1 font-medium">Queue</span>
          </button>

          {/* Tab 5: Reminders / Schedules */}
          <button
            onClick={() => setActiveTab('reminders')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors ${
              activeTab === 'reminders' ? 'text-rose-600 font-semibold' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1 font-medium">Schedule</span>
          </button>
        </div>
      </nav>
    </>
  );
};
