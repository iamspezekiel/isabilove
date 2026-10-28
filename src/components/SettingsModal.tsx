import React, { useState } from 'react';
import { UserSubscription } from '../types';
import { exportBackupData, importBackupData } from '../services/storage';
import {
  X,
  Clock,
  User,
  Mail,
  Download,
  RefreshCw,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface SettingsModalProps {
  subscription: UserSubscription;
  onSaveSubscription: (sub: UserSubscription) => void;
  onResetData: () => void;
  onClose: () => void;
}

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
  'Asia/Dubai',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
  'UTC',
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  subscription,
  onSaveSubscription,
  onResetData,
  onClose,
}) => {
  const [userName, setUserName] = useState(subscription.userName);
  const [userEmail, setUserEmail] = useState(subscription.userEmail);
  const [userPhone, setUserPhone] = useState(subscription.userPhone || '');
  const [timezone, setTimezone] = useState(subscription.timezone);
  const [webhookUrl, setWebhookUrl] = useState(subscription.webhookUrl || '');
  const [autoSendAuthorized, setAutoSendAuthorized] = useState(subscription.autoSendAuthorized);

  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
    onSaveSubscription({
      ...subscription,
      userName: userName.trim() || 'Loved One Companion',
      userEmail: userEmail.trim() || 'user@isabilove.demo',
      userPhone: userPhone.trim() || undefined,
      timezone,
      webhookUrl: webhookUrl.trim() || undefined,
      autoSendAuthorized,
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
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
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const success = importBackupData(importText);
    if (success) {
      setImportStatus('Backup restored successfully.');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      setImportStatus('Invalid JSON format. Please verify the exported backup file.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#2a241c]/50 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-[#faf6ef] rounded-t-3xl sm:rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-7 border border-[#8c6239]/25 shadow-2xl space-y-5">
        <div className="sm:hidden w-12 h-1 bg-[#8c6239]/30 rounded-full mx-auto -mt-1 mb-2" />

        <div className="flex items-center justify-between pb-3 border-b border-[#8c6239]/15">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-[#2a241c] font-display">
              App Settings & Preservation
            </h2>
            <p className="text-xs text-[#6f665c]">
              Personalized delivery schedules and data backup.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-[#6f665c] hover:text-[#2a241c] hover:bg-[#f3ece1] rounded-lg cursor-pointer min-h-[44px] min-w-[44px]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="space-y-3">
            <h3 className="font-semibold text-[#2a241c]">Scribe Profile</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#6f665c] mb-1">Your Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-[#8c6239]/30 focus:outline-none focus:border-[#8c6239] bg-[#faf6ef] text-[#2a241c]"
                />
              </div>
              <div>
                <label className="block text-[#6f665c] mb-1">Your Email</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-[#8c6239]/30 focus:outline-none focus:border-[#8c6239] bg-[#faf6ef] text-[#2a241c]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-[#8c6239]/15">
            <h3 className="font-semibold text-[#2a241c]">Schedule & Local Time</h3>
            <div>
              <label className="block text-[#6f665c] mb-1">Timezone</label>
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
              <p className="mt-1 text-[11px] text-[#6f665c] font-mono tabular-nums">
                Current time in selected zone: {getCurrentTimeInTz()}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-[#8c6239]/20 flex items-center justify-between">
            {saveSuccess ? (
              <span className="text-xs font-semibold text-[#8c6239] flex items-center gap-1">
                <Check className="w-4 h-4" />
                <span>Saved successfully!</span>
              </span>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-4 py-2 text-xs font-semibold text-[#6f665c] hover:bg-[#f3ece1] rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-h-[44px] px-5 py-2 text-xs font-semibold text-[#faf6ef] bg-[#2a241c] hover:bg-[#2a241c]/90 rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </div>
        </form>

        {/* Data preservation */}
        <div className="pt-3 border-t border-[#8c6239]/15 space-y-2 text-xs">
          <h3 className="font-semibold text-[#2a241c]">Data Preservation & Reset</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="flex-1 min-h-[40px] px-3 py-2 rounded-xl bg-[#f3ece1] hover:bg-[#f3ece1]/80 border border-[#8c6239]/25 text-[#2a241c] font-medium flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#8c6239]" />
              <span>Export Backup JSON</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset all records back to the default demo data?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="min-h-[40px] px-3 py-2 rounded-xl text-[#8c6239] hover:bg-[#f3ece1] font-medium cursor-pointer"
            >
              Reset Demo Records
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
