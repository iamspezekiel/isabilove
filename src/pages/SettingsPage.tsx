import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { exportBackupData, importBackupData } from '../services/storage';
import { ToneType, DeliveryChannel } from '../types';
import {
  Clock,
  Download,
  RefreshCw,
  ShieldCheck,
  Check,
  User,
  AlertTriangle,
  Settings as SettingsIcon,
  BookOpen,
  Scroll,
  Moon,
  Sun,
  Bell,
  Heart,
  Volume2,
  Calendar,
  Sparkles,
  Lock,
  Mail,
  Phone,
  KeyRound,
  LogOut,
  Copy,
} from 'lucide-react';

const COMMON_TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Africa/Lagos',
  'Africa/Johannesburg',
  'Africa/Nairobi',
  'Africa/Accra',
  'Asia/Dubai',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
  'UTC',
];

const SCRIPTURE_TRANSLATIONS = [
  { code: 'NWT', name: 'New World Translation of the Holy Scriptures (NWT)', desc: 'Clear, accurate, and faithful rendering based on original languages' },
  { code: 'ESV', name: 'English Standard Version (ESV)', desc: 'Literal word-for-word accuracy and literary beauty' },
  { code: 'KJV', name: 'King James Version (KJV)', desc: 'Timeless poetic cadences and reverent dignity' },
  { code: 'NIV', name: 'New International Version (NIV)', desc: 'Balanced clarity and contemporary readability' },
  { code: 'NKJV', name: 'New King James Version (NKJV)', desc: 'Classic phrasing with modern vocabulary' },
  { code: 'NLT', name: 'New Living Translation (NLT)', desc: 'Warm, thought-for-thought devotional warmth' },
  { code: 'CSB', name: 'Christian Standard Bible (CSB)', desc: 'Optimal blend of fidelity and accessibility' },
];

const TONE_OPTIONS: { id: ToneType; label: string; preview: string }[] = [
  {
    id: 'grateful',
    label: 'Grateful & Devotional',
    preview: '"I give thanks to God always for you, remembering your steadfast love and patient kindness."',
  },
  {
    id: 'romantic',
    label: 'Poetic & Romantic',
    preview: '"You are a tender blessing in my days; every quiet dawn is richer because you walk beside me."',
  },
  {
    id: 'playful',
    label: 'Warm & Playful',
    preview: '"Just sending a gentle smile your way today—counting my blessings and you are chief among them!"',
  },
  {
    id: 'poetic',
    label: 'Deep & Reflective',
    preview: '"Like a quiet brook in a dry valley, the memory of our days together brings steady peace."',
  },
  {
    id: 'cheerful',
    label: 'Joyful & Uplifting',
    preview: '"May your morning overflow with song and radiant joy! Celebrating you with all my heart today."',
  },
  {
    id: 'pidgin',
    label: 'West African Pidgin (Affectionate)',
    preview: '"My dear, na true love wey God give us! Today na special day to celebrate you—body and soul dey glad."',
  },
];

export const SettingsPage: React.FC = () => {
  const { subscription, updateSubscription, resetAllData, showToast } = useApp();
  const { user, isAuthenticated, logout, sendPasswordReset } = useAuth();

  // Account identity state
  const [userName, setUserName] = useState(subscription.userName || '');
  const [userEmail, setUserEmail] = useState(subscription.userEmail || user?.email || '');
  const [userPhone, setUserPhone] = useState(subscription.userPhone || '');

  // Settings state initialized from subscription
  const [timezone, setTimezone] = useState(subscription.timezone || 'America/New_York');
  const [morningWindow, setMorningWindow] = useState(subscription.morningWindow || '08:30');
  const [eveningWindow, setEveningWindow] = useState(subscription.eveningWindow || '20:00');
  const [defaultTone, setDefaultTone] = useState<ToneType>(subscription.defaultTone || 'grateful');
  const [scriptureTrans, setScriptureTrans] = useState(subscription.defaultScriptureTranslation || 'NWT');
  const [deliveryChannel, setDeliveryChannel] = useState<DeliveryChannel>(subscription.defaultDeliveryChannel || 'queue');
  const [sabbathMode, setSabbathMode] = useState(subscription.sabbathMode !== false);
  const [sabbathDay, setSabbathDay] = useState<'sunday' | 'saturday'>(subscription.sabbathDay || 'sunday');
  const [quietHours, setQuietHours] = useState(subscription.quietHoursEnabled !== false);
  const [weeklyDigest, setWeeklyDigest] = useState(subscription.weeklyDigestEnabled !== false);
  const [advanceDays, setAdvanceDays] = useState<number[]>(subscription.advanceNoticeDays || [7, 3, 0]);

  // Status & dialog state
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [copiedUid, setCopiedUid] = useState(false);

  const getCurrentTimeInTz = () => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
      }).format(new Date());
    } catch {
      return 'Invalid Timezone';
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSubscription({
      ...subscription,
      userName: userName.trim() || 'Loved One Scribe',
      userEmail: userEmail.trim() || user?.email || 'companion@isabilove.demo',
      userPhone: userPhone.trim() || undefined,
      timezone,
      morningWindow,
      eveningWindow,
      defaultTone,
      defaultScriptureTranslation: scriptureTrans,
      defaultDeliveryChannel: deliveryChannel,
      sabbathMode,
      sabbathDay,
      quietHoursEnabled: quietHours,
      weeklyDigestEnabled: weeklyDigest,
      advanceNoticeDays: advanceDays,
    });
    setSaveSuccess(true);
    showToast('Settings & account profile saved in peace', 'success');
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2500);
  };

  const toggleAdvanceDay = (day: number) => {
    if (advanceDays.includes(day)) {
      if (advanceDays.length === 1) {
        showToast('At least one reminder window must remain active', 'warning');
        return;
      }
      setAdvanceDays(advanceDays.filter((d) => d !== day));
    } else {
      setAdvanceDays([...advanceDays, day].sort((a, b) => b - a));
    }
  };

  const handlePasswordReset = async () => {
    const targetEmail = user?.email || userEmail;
    if (!targetEmail) {
      setResetError('No email associated with current session.');
      return;
    }
    setResetError(null);
    try {
      await sendPasswordReset(targetEmail);
      setResetSent(true);
      showToast('Password reset link sent to your email', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send reset link';
      setResetError(msg);
    }
  };

  const handleCopyUid = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    }
  };

  const getProviderLabel = () => {
    if (!isAuthenticated || !user) return 'Guest Session';
    if (user.isGuest) return 'Instant Demo Session';
    if (user.photoURL?.includes('googleusercontent.com')) return 'Google OAuth 2.0';
    return 'Email & Password Auth';
  };

  const handleExport = () => {
    const jsonStr = exportBackupData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `isabilove_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Backup exported successfully', 'success');
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const success = importBackupData(importText);
    if (success) {
      setImportStatus('Backup restored successfully.');
      showToast('Records restored', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } else {
      setImportStatus('Invalid JSON format. Please verify the exported backup file.');
    }
  };

  return (
    <div className="space-y-6 pb-6 md:pb-4 max-w-4xl mx-auto">
      {/* Header with Biblical Epigraph */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-[#2a241c] font-display">
            Settings & Account
          </h1>
          <p className="text-xs text-[#6f665c] mt-1">
            Personal scribe identity, devotional rhythms, scripture standards, and data safety
          </p>
        </div>
        <div className="p-3 bg-[#faf6ef] border border-[#8c6239]/20 rounded-xl text-right sm:max-w-xs shrink-0">
          <p className="text-[11px] italic font-serif text-[#2a241c] leading-snug">
            "Let all things be done decently and in order."
          </p>
          <span className="text-[10px] text-[#8c6239] font-medium block mt-0.5">
            — 1 Corinthians 14:40
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Scribe Identification & Profile */}
        <div className="p-5 sm:p-6 rounded-2xl border border-[#8c6239]/20 bg-[#faf6ef] shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#8c6239]/15">
            <div className="w-8 h-8 rounded-lg bg-[#f3ece1] border border-[#8c6239]/20 flex items-center justify-center">
              <User className="w-4 h-4 text-[#8c6239]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#2a241c] font-display">
                Scribe Profile & Identity
              </h2>
              <p className="text-xs text-[#6f665c]">
                Your personal name and contact information for signing devotional blessings
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#2a241c] mb-1">Display Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-[#8c6239]/30 focus:outline-none focus:border-[#8c6239] bg-[#faf6ef] text-[#2a241c]"
                placeholder="e.g. Alex Taylor"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#2a241c] mb-1">Email Address</label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-[#8c6239]/30 focus:outline-none focus:border-[#8c6239] bg-[#faf6ef] text-[#2a241c]"
                placeholder="e.g. alex@example.com"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#2a241c] mb-1">Phone Number (Optional)</label>
              <input
                type="tel"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-[#8c6239]/30 focus:outline-none focus:border-[#8c6239] bg-[#faf6ef] text-[#2a241c]"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Scribe Intonation & Scripture Standards */}
        <div className="p-5 sm:p-6 rounded-2xl border border-[#8c6239]/20 bg-[#faf6ef] shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#8c6239]/15">
            <div className="w-8 h-8 rounded-lg bg-[#f3ece1] border border-[#8c6239]/20 flex items-center justify-center">
              <Scroll className="w-4 h-4 text-[#8c6239]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#2a241c] font-display">
                Scribe Intonation & Scripture Grounding
              </h2>
              <p className="text-xs text-[#6f665c]">
                Set default speech patterns and translation fidelity for composed love letters
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* Preferred Intonation Selection */}
            <div>
              <label className="block font-semibold text-[#2a241c] mb-1.5">
                Default Scribe Intonation
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {TONE_OPTIONS.map((t) => {
                  const isSelected = defaultTone === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setDefaultTone(t.id)}
                      className={`text-left p-3 rounded-xl border transition-colors cursor-pointer min-h-[44px] flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#8c6239] bg-[#f3ece1] text-[#2a241c]'
                          : 'border-[#8c6239]/20 bg-[#faf6ef] text-[#6f665c] hover:border-[#8c6239]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-semibold ${isSelected ? 'text-[#2a241c]' : 'text-[#6f665c]'}`}>
                          {t.label}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#8c6239]" />}
                      </div>
                      <p className="text-[11px] font-serif italic text-[#6f665c] line-clamp-2">
                        {t.preview}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scripture Translation & Default Channel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block font-semibold text-[#2a241c] mb-1">
                  Scripture Translation Reference
                </label>
                <select
                  value={scriptureTrans}
                  onChange={(e) => setScriptureTrans(e.target.value)}
                  className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-[#8c6239]/30 focus:outline-none focus:border-[#8c6239] bg-[#faf6ef] text-[#2a241c]"
                >
                  {SCRIPTURE_TRANSLATIONS.map((st) => (
                    <option key={st.code} value={st.code}>
                      {st.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-[#6f665c]">
                  Scripture verses embedded in drafts will honor this text.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-[#2a241c] mb-1">
                  Default Dispatch Channel
                </label>
                <select
                  value={deliveryChannel}
                  onChange={(e) => setDeliveryChannel(e.target.value as DeliveryChannel)}
                  className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-[#8c6239]/30 focus:outline-none focus:border-[#8c6239] bg-[#faf6ef] text-[#2a241c]"
                >
                  <option value="queue">In-App Blessing Queue (Manual Review)</option>
                  <option value="whatsapp">WhatsApp Web Direct Dispatch</option>
                  <option value="email">Email Transmission</option>
                </select>
                <p className="mt-1 text-[11px] text-[#6f665c]">
                  New drafts automatically prepare for this preferred conduit.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Timing, Windows & Milestone Warning Windows */}
        <div className="p-5 sm:p-6 rounded-2xl border border-[#8c6239]/20 bg-[#faf6ef] shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#8c6239]/15">
            <div className="w-8 h-8 rounded-lg bg-[#f3ece1] border border-[#8c6239]/20 flex items-center justify-center">
              <Clock className="w-4 h-4 text-[#8c6239]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#2a241c] font-display">
                Timing, Rhythm & Sabbath Rest
              </h2>
              <p className="text-xs text-[#6f665c]">
                Synchronize notifications with quiet morning hours and reverent rest periods
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Timezone Selector */}
            <div>
              <label className="block font-semibold text-[#2a241c] mb-1">
                Your Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-[#8c6239]/30 focus:outline-none focus:border-[#8c6239] bg-[#faf6ef] text-[#2a241c]"
              >
                {COMMON_TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-[#6f665c] font-mono">
                Current Time: {getCurrentTimeInTz()}
              </p>
            </div>

            {/* Morning Digest Window */}
            <div>
              <label className="block font-semibold text-[#2a241c] mb-1 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-[#8c6239]" />
                <span>Morning Dispatch Window</span>
              </label>
              <input
                type="time"
                value={morningWindow}
                onChange={(e) => setMorningWindow(e.target.value)}
                className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-[#8c6239]/30 focus:outline-none focus:border-[#8c6239] bg-[#faf6ef] text-[#2a241c]"
              />
              <p className="mt-1 text-[11px] text-[#6f665c]">
                Blessing drafts generate at this serene hour.
              </p>
            </div>

            {/* Evening Quiet Hours Window */}
            <div>
              <label className="block font-semibold text-[#2a241c] mb-1 flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-[#8c6239]" />
                <span>Evening Quiet Hours</span>
              </label>
              <input
                type="time"
                value={eveningWindow}
                onChange={(e) => setEveningWindow(e.target.value)}
                className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-[#8c6239]/30 focus:outline-none focus:border-[#8c6239] bg-[#faf6ef] text-[#2a241c]"
              />
              <p className="mt-1 text-[11px] text-[#6f665c]">
                No push notifications after this cutoff time.
              </p>
            </div>
          </div>

          {/* Sabbath & Rest Controls */}
          <div className="pt-3 border-t border-[#8c6239]/15 space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#f3ece1]/50 border border-[#8c6239]/15">
              <div>
                <span className="font-semibold text-[#2a241c] block">
                  Honor Holy Day of Rest (Sabbath Mode)
                </span>
                <span className="text-[11px] text-[#6f665c] block mt-0.5">
                  Suppresses non-urgent notifications during sacred reflection hours
                </span>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={sabbathDay}
                  onChange={(e) => setSabbathDay(e.target.value as 'sunday' | 'saturday')}
                  disabled={!sabbathMode}
                  className="px-3 py-1.5 min-h-[38px] rounded-lg border border-[#8c6239]/25 bg-[#faf6ef] text-xs text-[#2a241c] disabled:opacity-50"
                >
                  <option value="sunday">Sunday Sabbath</option>
                  <option value="saturday">Saturday Sabbath</option>
                </select>
                <input
                  type="checkbox"
                  checked={sabbathMode}
                  onChange={(e) => setSabbathMode(e.target.checked)}
                  className="h-4 w-4 rounded border-[#8c6239] text-[#8c6239] focus:ring-[#8c6239]"
                />
              </div>
            </div>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#f3ece1]/50 border border-[#8c6239]/15 cursor-pointer">
              <div>
                <span className="font-semibold text-[#2a241c] block">
                  Weekly Devotional Digest
                </span>
                <span className="text-[11px] text-[#6f665c] block mt-0.5">
                  Receive a gentle summary of upcoming celebrations and anniversaries for the week ahead.
                </span>
              </div>
              <input
                type="checkbox"
                checked={weeklyDigest}
                onChange={(e) => setWeeklyDigest(e.target.checked)}
                className="h-4 w-4 rounded border-[#8c6239] text-[#8c6239] focus:ring-[#8c6239]"
              />
            </label>
          </div>
        </div>

        {/* Section 4: Advance Remembrance Horizons */}
        <div className="p-5 sm:p-6 rounded-2xl border border-[#8c6239]/20 bg-[#faf6ef] shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#8c6239]/15">
            <div className="w-8 h-8 rounded-lg bg-[#f3ece1] border border-[#8c6239]/20 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-[#8c6239]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#2a241c] font-display">
                Advance Remembrance Horizons
              </h2>
              <p className="text-xs text-[#6f665c]">
                Select how many days in advance celebrations are prepared in the Blessing Queue
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
            {[
              { days: 14, label: '14 Days Ahead', desc: 'Gift procuring' },
              { days: 7, label: '7 Days Ahead', desc: 'Devotional letter' },
              { days: 3, label: '3 Days Ahead', desc: 'Calendar alert' },
              { days: 1, label: '1 Day Before', desc: 'Eve preparation' },
              { days: 0, label: 'Day of Event', desc: 'Morning blessing' },
            ].map((item) => {
              const active = advanceDays.includes(item.days);
              return (
                <button
                  key={item.days}
                  type="button"
                  onClick={() => toggleAdvanceDay(item.days)}
                  className={`p-3 rounded-xl border text-left transition-colors cursor-pointer min-h-[44px] flex flex-col justify-between ${
                    active
                      ? 'border-[#8c6239] bg-[#f3ece1] text-[#2a241c]'
                      : 'border-[#8c6239]/20 bg-[#faf6ef] text-[#6f665c] hover:border-[#8c6239]/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs">{item.label}</span>
                    {active && <Check className="w-3.5 h-3.5 text-[#8c6239]" />}
                  </div>
                  <span className="text-[10px] text-[#6f665c]">{item.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#faf6ef] border border-[#8c6239]/25 shadow-xs">
          <div>
            {saveSuccess ? (
              <span className="text-xs font-semibold text-[#8c6239] flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>Settings & account profile saved in peace</span>
              </span>
            ) : (
              <span className="text-xs text-[#6f665c]">
                Changes take effect across reminders and drafting routines immediately.
              </span>
            )}
          </div>

          <button
            type="submit"
            className="min-h-[44px] px-6 py-2.5 text-xs font-semibold text-[#faf6ef] bg-[#2a241c] hover:bg-[#2a241c]/90 rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            Save Settings & Profile
          </button>
        </div>
      </form>

      {/* Section 5: Data Preservation & Portable Backups */}
      <div className="p-5 sm:p-6 rounded-2xl border border-[#8c6239]/20 bg-[#faf6ef] shadow-xs space-y-4 text-xs">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#8c6239]/15">
          <div className="w-8 h-8 rounded-lg bg-[#f3ece1] border border-[#8c6239]/20 flex items-center justify-center">
            <Download className="w-4 h-4 text-[#8c6239]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#2a241c] font-display">
              Data Preservation & Portable Backups
            </h2>
            <p className="text-xs text-[#6f665c]">
              Export your loved ones, memories, and chronicles for total data sovereignty
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-[#f3ece1]/40 border border-[#8c6239]/15 space-y-3">
            <h3 className="font-semibold text-[#2a241c]">Export Backup JSON</h3>
            <p className="text-[11px] text-[#6f665c]">
              Download an offline copy containing all loved ones, memory milestones, and dispatched blessing letters.
            </p>
            <button
              type="button"
              onClick={handleExport}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#2a241c] hover:bg-[#2a241c]/90 text-[#faf6ef] font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer w-full shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download JSON Backup</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-[#f3ece1]/40 border border-[#8c6239]/15 space-y-3">
            <h3 className="font-semibold text-[#2a241c]">Restore Records from JSON Archive</h3>
            <p className="text-[11px] text-[#6f665c]">
              Paste the contents of a previously exported JSON backup to restore your history.
            </p>
            <textarea
              rows={2}
              placeholder="Paste raw JSON backup payload here..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#8c6239]/30 focus:outline-none focus:border-[#8c6239] bg-[#faf6ef] text-[11px] font-mono text-[#2a241c]"
            />
            <button
              type="button"
              onClick={handleImport}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#f3ece1] hover:bg-[#f3ece1]/80 border border-[#8c6239]/25 text-[#2a241c] font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer w-full"
            >
              <RefreshCw className="w-4 h-4 text-[#8c6239]" />
              <span>Restore Backup Data</span>
            </button>
            {importStatus && (
              <p className="text-[11px] font-medium text-[#8c6239] mt-1">{importStatus}</p>
            )}
          </div>
        </div>

        {/* Demo Data Reset Modal Button */}
        <div className="pt-3 border-t border-[#8c6239]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-[#2a241c]">Reset to Initial Demo State</p>
            <p className="text-[11px] text-[#6f665c]">
              Clears current data and re-populates with default demo records.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-[#8c6239] hover:bg-[#f3ece1] transition-colors cursor-pointer self-start sm:self-auto"
          >
            Reset Demo Records
          </button>
        </div>
      </div>

      {/* Section 6: Authentication & Session Security */}
      <div className="p-5 sm:p-6 rounded-2xl border border-[#8c6239]/20 bg-[#faf6ef] shadow-xs space-y-4 text-xs">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#8c6239]/15">
          <div className="w-8 h-8 rounded-lg bg-[#f3ece1] border border-[#8c6239]/20 flex items-center justify-center">
            <Lock className="w-4 h-4 text-[#8c6239]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#2a241c] font-display">
              Authentication & Session Security
            </h2>
            <p className="text-xs text-[#6f665c]">
              Session credentials, account identification, and password recovery
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#f3ece1]/60 border border-[#8c6239]/15">
            <div>
              <p className="font-semibold text-[#2a241c]">Sign-In Method</p>
              <p className="text-[#6f665c] text-[11px] mt-0.5">{getProviderLabel()}</p>
            </div>
            <span className="text-[11px] font-mono text-[#8c6239] font-medium">Active</span>
          </div>

          {user?.uid && (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#f3ece1]/60 border border-[#8c6239]/15">
              <div>
                <p className="font-semibold text-[#2a241c]">Account UID</p>
                <p className="text-[#6f665c] font-mono text-[11px] truncate max-w-[180px]">{user.uid}</p>
              </div>
              <button
                type="button"
                onClick={handleCopyUid}
                className="min-h-[38px] px-3 text-[#6f665c] hover:text-[#2a241c] flex items-center gap-1 cursor-pointer"
              >
                {copiedUid ? <Check className="w-3.5 h-3.5 text-[#8c6239]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUid ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Password Reset */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#f3ece1]/40 border border-[#8c6239]/15">
          <div>
            <p className="font-semibold text-[#2a241c]">Password Reset</p>
            <p className="text-[#6f665c] text-[11px]">Send a secure password recovery link to your email ({user?.email || userEmail})</p>
            {resetSent && (
              <p className="text-[11px] text-[#8c6239] font-medium mt-1">Recovery link sent to your inbox.</p>
            )}
            {resetError && (
              <p className="text-[11px] text-amber-700 mt-1">{resetError}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handlePasswordReset}
            className="min-h-[44px] px-4 py-2 text-xs font-semibold text-[#2a241c] bg-[#faf6ef] hover:bg-[#f3ece1] border border-[#8c6239]/25 rounded-xl transition-colors cursor-pointer self-start sm:self-auto shrink-0 shadow-xs"
          >
            Send Reset Link
          </button>
        </div>

        {/* Sign Out Card */}
        <div className="pt-3 border-t border-[#8c6239]/15 flex items-center justify-between">
          <div>
            <p className="font-semibold text-[#2a241c]">End Session</p>
            <p className="text-[11px] text-[#6f665c]">Sign out of your account on this browser.</p>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className="min-h-[44px] px-4 py-2 text-xs font-semibold text-[#8c6239] hover:bg-[#f3ece1] rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Confirmation Dialog for Reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2a241c]/50 backdrop-blur-xs p-4">
          <div className="bg-[#faf6ef] border border-[#8c6239]/30 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-[#8c6239]">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-sm text-[#2a241c] font-display">Reset All Records?</h3>
            </div>
            <p className="text-xs text-[#6f665c] leading-relaxed">
              This will restore all contacts, memories, and schedules back to the original demo records. Any recent custom entries will be replaced.
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
                onClick={() => {
                  resetAllData();
                  setShowResetConfirm(false);
                }}
                className="min-h-[44px] px-3 py-2 text-xs font-semibold rounded-xl bg-[#2a241c] text-[#faf6ef] hover:bg-[#2a241c]/90 cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
