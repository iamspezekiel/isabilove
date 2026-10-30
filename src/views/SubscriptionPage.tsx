"use client";

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Check,
  Sparkles,
  ShieldCheck,
  Users,
  Crown,
  User,
  Settings,
  CreditCard,
  Download,
  Tag,
  Calendar,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  HeartHandshake,
} from 'lucide-react';

interface InvoiceRecord {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: 'Paid in Peace' | 'Comped Grace';
}

const SAMPLE_INVOICES: InvoiceRecord[] = [
  {
    id: 'INV-ISABI-2026-10',
    date: 'Oct 01, 2026',
    description: 'Pro Edition (Annual Renewal)',
    amount: '$108.00',
    status: 'Paid in Peace',
  },
  {
    id: 'INV-ISABI-2025-10',
    date: 'Oct 01, 2025',
    description: 'Pro Edition (Annual Renewal)',
    amount: '$108.00',
    status: 'Paid in Peace',
  },
  {
    id: 'INV-ISABI-2024-10',
    date: 'Oct 01, 2024',
    description: 'Pro Edition Initial Subscription',
    amount: '$108.00',
    status: 'Paid in Peace',
  },
];

export const SubscriptionPage: React.FC = () => {
  const { subscription, contacts, toggleTier, updateSubscription, showToast } = useApp();

  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<string | null>(
    subscription.covenantCodeApplied || null
  );
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [last4Card, setLast4Card] = useState(subscription.paymentMethodLast4 || '4022');
  const [newCardInput, setNewCardInput] = useState('');

  const isPro = subscription.tier === 'pro';

  // Capacity calculations
  const contactsLimit = subscription.contactsLimit;
  const contactsUsed = contacts.length;
  const contactsPercent = Math.min(100, Math.round((contactsUsed / contactsLimit) * 100));

  const draftsLimit = subscription.aiDraftsLimit;
  const draftsUsed = subscription.aiDraftsUsed;
  const draftsPercent = Math.min(100, Math.round((draftsUsed / draftsLimit) * 100));

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = voucherCode.trim().toUpperCase();
    if (!clean) return;

    if (['GRACE', 'GRACE2026', 'COVENANT', 'SHALOM', 'HAVEN'].includes(clean)) {
      setAppliedVoucher(clean);
      updateSubscription({
        ...subscription,
        covenantCodeApplied: clean,
      });
      showToast(`Grace voucher "${clean}" applied: 20% discount granted!`, 'success');
      setVoucherCode('');
    } else {
      showToast('Unrecognized voucher code. Try "GRACE2026" or "COVENANT"', 'warning');
    }
  };

  const handleUpdatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const lastDigits = newCardInput.replace(/\D/g, '').slice(-4);
    if (lastDigits.length !== 4) {
      showToast('Please enter at least the last 4 digits of your payment card', 'warning');
      return;
    }
    setLast4Card(lastDigits);
    updateSubscription({
      ...subscription,
      paymentMethodLast4: lastDigits,
    });
    setShowCardModal(false);
    setNewCardInput('');
    showToast(`Payment method updated to card ending in ${lastDigits}`, 'success');
  };

  const handleDownloadInvoice = (inv: InvoiceRecord) => {
    const text = `
========================================
ISABILOVE STEWARDSHIP RECEIPT
========================================
Receipt Number: ${inv.id}
Date Issued:    ${inv.date}
Account:        ${subscription.userName} (${subscription.userEmail})
Tier:           ${inv.description}
Amount Settled: ${inv.amount}
Status:         ${inv.status}
Payment Method: Visa ending in ${last4Card}

"Let the peace of God rule in your hearts."
Colossians 3:15
========================================
`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${inv.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded receipt for ${inv.id}`, 'success');
  };

  const handleConfirmDowngrade = () => {
    toggleTier('free');
    setShowDowngradeModal(false);
    showToast('Switched to Free Edition in peace', 'info');
  };

  return (
    <div className="space-y-6 pb-6 md:pb-4 max-w-5xl mx-auto">
      {/* Sub-Navigation Switcher Bar */}
      <div className="flex items-center gap-2 border-b border-[#8c6239]/20 pb-2 overflow-x-auto no-scrollbar">
        <Link
          to="/account"
          className="min-h-[44px] px-4 py-2 text-xs font-medium rounded-xl text-[#6f665c] hover:text-[#2a241c] hover:bg-[#faf6ef] transition-colors flex items-center gap-2 shrink-0"
        >
          <User className="w-4 h-4 text-[#8c6239]" />
          <span>Account Profile</span>
        </Link>
        <Link
          to="/settings"
          className="min-h-[44px] px-4 py-2 text-xs font-medium rounded-xl text-[#6f665c] hover:text-[#2a241c] hover:bg-[#faf6ef] transition-colors flex items-center gap-2 shrink-0"
        >
          <Settings className="w-4 h-4 text-[#8c6239]" />
          <span>App Settings</span>
        </Link>
        <Link
          to="/subscription"
          className="min-h-[44px] px-4 py-2 text-xs font-bold rounded-xl bg-[#2a241c] text-[#faf6ef] shadow-xs flex items-center gap-2 shrink-0 transition-colors"
        >
          <Crown className="w-4 h-4 text-[#8c6239]" />
          <span>Subscription Quota</span>
        </Link>
      </div>

      {/* Top Banner with Scripture Epigraph */}
      <div className="text-center max-w-2xl mx-auto space-y-2 pt-2">
        <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-[#2a241c] font-display">
          Stewardship & Quotas
        </h1>
        <p className="text-xs sm:text-sm text-[#6f665c]">
          Manage your loved one capacity, AI scribe quotas, and covenant stewardship tier
        </p>

        <div className="p-3 bg-[#faf6ef] border border-[#8c6239]/20 rounded-xl max-w-md mx-auto text-center mt-2">
          <p className="text-[11px] italic font-serif text-[#2a241c] leading-snug">
            "Each of you should use whatever gift you have received to serve others, as faithful stewards of God’s grace."
          </p>
          <span className="text-[10px] text-[#8c6239] font-medium block mt-0.5">
            — 1 Peter 4:10
          </span>
        </div>

        {/* Billing Period Toggle */}
        <div className="pt-2 flex items-center justify-center gap-3">
          <div className="inline-flex p-1 bg-[#faf6ef] border border-[#8c6239]/20 rounded-xl text-xs font-medium">
            <button
              type="button"
              onClick={() => setBillingPeriod('monthly')}
              className={`min-h-[38px] px-4 py-1.5 rounded-lg transition-colors cursor-pointer ${
                billingPeriod === 'monthly'
                  ? 'bg-[#2a241c] text-[#faf6ef] font-semibold'
                  : 'text-[#6f665c] hover:text-[#2a241c]'
              }`}
            >
              Monthly Stewardship ($12/mo)
            </button>
            <button
              type="button"
              onClick={() => setBillingPeriod('yearly')}
              className={`min-h-[38px] px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                billingPeriod === 'yearly'
                  ? 'bg-[#2a241c] text-[#faf6ef] font-semibold'
                  : 'text-[#6f665c] hover:text-[#2a241c]'
              }`}
            >
              <span>Annual Stewardship ($9/mo)</span>
              <span className="text-[#8c6239] text-[10px] font-bold">
                (Save 25%)
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Covenant & Resource Meters Card */}
      <div className="bg-[#faf6ef] border border-[#8c6239]/20 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#8c6239]/15">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#8c6239] uppercase tracking-wider">
                Current Covenant
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#8c6239]/15 text-[#8c6239]">
                Active
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#2a241c] font-display mt-0.5">
              {isPro ? 'Pro Edition (Unbounded Fellowship)' : 'Free Starter Edition'}
            </h2>
            <p className="text-xs text-[#6f665c]">
              {isPro
                ? `Next annual stewardship cycle on ${subscription.nextBillingDate || 'Nov 27, 2026'}`
                : 'Limited to 3 loved ones and 10 scribe epistles per month'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isPro ? (
              <button
                type="button"
                onClick={() => setShowDowngradeModal(true)}
                className="min-h-[44px] px-4 py-2 text-xs font-semibold text-[#6f665c] hover:text-[#2a241c] hover:bg-[#f3ece1] rounded-xl border border-[#8c6239]/20 transition-colors cursor-pointer"
              >
                Downgrade to Free
              </button>
            ) : (
              <button
                type="button"
                onClick={() => toggleTier('pro')}
                className="min-h-[44px] px-5 py-2 text-xs font-semibold text-[#faf6ef] bg-[#2a241c] hover:bg-[#2a241c]/90 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Upgrade to Pro Edition
              </button>
            )}
          </div>
        </div>

        {/* Real Capacity Meters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-[#f3ece1]/60 border border-[#8c6239]/15 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#2a241c] flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#8c6239]" />
                <span>Loved Ones Recorded</span>
              </span>
              <span className="font-mono text-[#6f665c] tabular-nums font-semibold">
                {contactsUsed} / {isPro ? 'Unlimited' : contactsLimit}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#faf6ef] overflow-hidden border border-[#8c6239]/20">
              <div
                className="h-full bg-[#8c6239] rounded-full transition-all"
                style={{ width: `${isPro ? Math.min(100, contactsUsed * 10) : contactsPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-[#6f665c]">
              {isPro
                ? 'You can record infinite family members, mentors, and friends.'
                : `${Math.max(0, contactsLimit - contactsUsed)} loved one slots remaining on Free tier.`}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#f3ece1]/60 border border-[#8c6239]/15 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#2a241c] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#8c6239]" />
                <span>AI Scribe Epistles This Cycle</span>
              </span>
              <span className="font-mono text-[#6f665c] tabular-nums font-semibold">
                {draftsUsed} / {isPro ? 'Unlimited' : draftsLimit}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#faf6ef] overflow-hidden border border-[#8c6239]/20">
              <div
                className="h-full bg-[#8c6239] rounded-full transition-all"
                style={{ width: `${isPro ? Math.min(100, draftsUsed * 5) : draftsPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-[#6f665c]">
              {isPro
                ? 'Unrestricted biblical, poetic, and West African Pidgin drafts.'
                : `${Math.max(0, draftsLimit - draftsUsed)} monthly drafts remaining.`}
            </p>
          </div>
        </div>
      </div>

      {/* Plan Stewardship Tier Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
        {/* Tier 1: Free Starter Plan */}
        <div className="bg-[#faf6ef] border border-[#8c6239]/20 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xs">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-[#6f665c] uppercase tracking-wider">
                Starter Plan
              </span>
              <h3 className="text-lg font-bold text-[#2a241c] font-display mt-0.5">Free</h3>
              <p className="text-xs text-[#6f665c] mt-1">
                For keeping close track of immediate partner or core parents.
              </p>
            </div>

            <div className="text-2xl font-bold text-[#2a241c] font-display">
              $0{' '}
              <span className="text-xs text-[#6f665c] font-sans font-normal">/ forever</span>
            </div>

            <ul className="space-y-2 text-xs text-[#6f665c] pt-2 border-t border-[#8c6239]/15">
              <li className="flex items-center gap-2 text-[#2a241c]">
                <Check className="w-3.5 h-3.5 text-[#8c6239] shrink-0" />
                <span>Up to 3 loved ones</span>
              </li>
              <li className="flex items-center gap-2 text-[#2a241c]">
                <Check className="w-3.5 h-3.5 text-[#8c6239] shrink-0" />
                <span>10 Scribe letters monthly</span>
              </li>
              <li className="flex items-center gap-2 text-[#2a241c]">
                <Check className="w-3.5 h-3.5 text-[#8c6239] shrink-0" />
                <span>Standard intonations</span>
              </li>
              <li className="flex items-center gap-2 text-[#2a241c]">
                <Check className="w-3.5 h-3.5 text-[#8c6239] shrink-0" />
                <span>WhatsApp manual dispatch</span>
              </li>
            </ul>
          </div>

          <div className="pt-6">
            <button
              type="button"
              onClick={() => toggleTier('free')}
              disabled={!isPro}
              className={`w-full min-h-[44px] py-2 px-3 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                !isPro
                  ? 'bg-[#f3ece1] text-[#6f665c] border border-[#8c6239]/25 cursor-default'
                  : 'bg-[#faf6ef] border border-[#8c6239]/30 text-[#2a241c] hover:bg-[#f3ece1]'
              }`}
            >
              {!isPro ? 'Active Tier' : 'Downgrade to Free'}
            </button>
          </div>
        </div>

        {/* Tier 2: Pro Haven (Recommended) */}
        <div className="bg-[#faf6ef] border-2 border-[#8c6239] rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-sm relative">
          <div className="absolute -top-3 right-5 px-3 py-0.5 rounded-full bg-[#8c6239] text-[#faf6ef] text-[10px] font-bold tracking-wide uppercase">
            Recommended
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-[#8c6239] uppercase tracking-wider">
                Pro Haven
              </span>
              <h3 className="text-lg font-bold text-[#2a241c] font-display mt-0.5">Pro Edition</h3>
              <p className="text-xs text-[#6f665c] mt-1">
                For extended families, mentors, community circles, and rich fellowship.
              </p>
            </div>

            <div className="text-2xl font-bold text-[#2a241c] font-display">
              {appliedVoucher
                ? billingPeriod === 'yearly' ? '$7.20' : '$9.60'
                : billingPeriod === 'yearly' ? '$9.00' : '$12.00'}{' '}
              <span className="text-xs text-[#6f665c] font-sans font-normal">/ month</span>
            </div>

            <ul className="space-y-2 text-xs text-[#6f665c] pt-2 border-t border-[#8c6239]/15">
              <li className="flex items-center gap-2 text-[#2a241c]">
                <Check className="w-3.5 h-3.5 text-[#8c6239] shrink-0" />
                <span className="font-semibold">Unlimited loved ones profiles</span>
              </li>
              <li className="flex items-center gap-2 text-[#2a241c]">
                <Check className="w-3.5 h-3.5 text-[#8c6239] shrink-0" />
                <span className="font-semibold">Unlimited AI scribe epistles</span>
              </li>
              <li className="flex items-center gap-2 text-[#2a241c]">
                <Check className="w-3.5 h-3.5 text-[#8c6239] shrink-0" />
                <span>All 6 intonations + West African Pidgin</span>
              </li>
              <li className="flex items-center gap-2 text-[#2a241c]">
                <Check className="w-3.5 h-3.5 text-[#8c6239] shrink-0" />
                <span>Automated webhook dispatching</span>
              </li>
              <li className="flex items-center gap-2 text-[#2a241c]">
                <Check className="w-3.5 h-3.5 text-[#8c6239] shrink-0" />
                <span>Offline archive preservation & restore</span>
              </li>
            </ul>
          </div>

          <div className="pt-6">
            <button
              type="button"
              onClick={() => toggleTier('pro')}
              disabled={isPro}
              className={`w-full min-h-[44px] py-2 px-3 text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-xs ${
                isPro
                  ? 'bg-[#f3ece1] text-[#6f665c] border border-[#8c6239]/25 cursor-default'
                  : 'bg-[#2a241c] hover:bg-[#2a241c]/90 text-[#faf6ef]'
              }`}
            >
              {isPro ? 'Active Pro Tier' : 'Upgrade to Pro'}
            </button>
          </div>
        </div>

        {/* Tier 3: Covenant Ministry / Patron */}
        <div className="bg-[#faf6ef] border border-[#8c6239]/20 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xs">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-[#8c6239] uppercase tracking-wider">
                Perpetual Fellowship
              </span>
              <h3 className="text-lg font-bold text-[#2a241c] font-display mt-0.5">Ministry Patron</h3>
              <p className="text-xs text-[#6f665c] mt-1">
                For pastors, counselors, elders, and covenant lifetime supporters.
              </p>
            </div>

            <div className="text-2xl font-bold text-[#2a241c] font-display">
              $199{' '}
              <span className="text-xs text-[#6f665c] font-sans font-normal">/ lifetime</span>
            </div>

            <ul className="space-y-2 text-xs text-[#6f665c] pt-2 border-t border-[#8c6239]/15">
              <li className="flex items-center gap-2 text-[#2a241c]">
                <Check className="w-3.5 h-3.5 text-[#8c6239] shrink-0" />
                <span>Lifetime Pro privileges forever</span>
              </li>
              <li className="flex items-center gap-2 text-[#2a241c]">
                <Check className="w-3.5 h-3.5 text-[#8c6239] shrink-0" />
                <span>Multi-device synchronization</span>
              </li>
              <li className="flex items-center gap-2 text-[#2a241c]">
                <Check className="w-3.5 h-3.5 text-[#8c6239] shrink-0" />
                <span>Printed prayer letter templates</span>
              </li>
              <li className="flex items-center gap-2 text-[#2a241c]">
                <Check className="w-3.5 h-3.5 text-[#8c6239] shrink-0" />
                <span>Dedicated pastoral assistance</span>
              </li>
            </ul>
          </div>

          <div className="pt-6">
            <button
              type="button"
              onClick={() => {
                toggleTier('pro');
                showToast('Welcome to the Ministry Patron Lifetime Covenant!', 'success');
              }}
              className="w-full min-h-[44px] py-2 px-3 text-xs font-semibold rounded-xl bg-[#8c6239] hover:bg-[#8c6239]/90 text-[#faf6ef] transition-colors cursor-pointer"
            >
              Support as Patron
            </button>
          </div>
        </div>
      </div>

      {/* Grace Voucher & Payment Card Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Grace Voucher Redemption */}
        <div className="p-5 rounded-2xl border border-[#8c6239]/20 bg-[#faf6ef] shadow-xs space-y-3 text-xs">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#8c6239]" />
            <h3 className="font-bold text-[#2a241c] font-display">Grace Voucher or Fellowship Code</h3>
          </div>
          <p className="text-[#6f665c] text-[11px]">
            Church members, ministry companions, and seasonal fellowship participants can apply vouchers here.
          </p>

          {appliedVoucher ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#f3ece1] border border-[#8c6239]/30">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#8c6239]" />
                <div>
                  <span className="font-bold text-[#2a241c]">{appliedVoucher}</span>
                  <p className="text-[10px] text-[#6f665c]">20% Perpetual Fellowship Discount Active</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAppliedVoucher(null);
                  updateSubscription({ ...subscription, covenantCodeApplied: undefined });
                  showToast('Voucher removed', 'info');
                }}
                className="text-[11px] text-[#8c6239] hover:underline cursor-pointer"
              >
                Remove
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyVoucher} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. GRACE2026 or COVENANT"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                className="flex-1 px-3 py-2 min-h-[44px] rounded-xl border border-[#8c6239]/30 bg-[#faf6ef] text-[#2a241c] uppercase placeholder:normal-case font-mono text-xs"
              />
              <button
                type="submit"
                className="min-h-[44px] px-4 py-2 text-xs font-semibold text-[#faf6ef] bg-[#2a241c] hover:bg-[#2a241c]/90 rounded-xl transition-colors cursor-pointer shrink-0"
              >
                Apply Voucher
              </button>
            </form>
          )}
        </div>

        {/* Payment Method Card */}
        <div className="p-5 rounded-2xl border border-[#8c6239]/20 bg-[#faf6ef] shadow-xs space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#8c6239]" />
              <h3 className="font-bold text-[#2a241c] font-display">Payment Method on Record</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowCardModal(true)}
              className="text-[#8c6239] hover:underline font-semibold cursor-pointer text-xs"
            >
              Update
            </button>
          </div>
          <p className="text-[#6f665c] text-[11px]">
            Encrypted and held in PCI-compliant custody via Stripe & Google Pay.
          </p>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#f3ece1]/60 border border-[#8c6239]/20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-6 rounded bg-[#2a241c] text-[#faf6ef] text-[10px] font-bold flex items-center justify-center font-mono">
                VISA
              </div>
              <div>
                <p className="font-semibold text-[#2a241c]">•••• •••• •••• {last4Card}</p>
                <p className="text-[10px] text-[#6f665c]">Expires 08/2028</p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-[#8c6239]">Verified</span>
          </div>
        </div>
      </div>

      {/* Stewardship Ledger / Receipts Table */}
      <div className="p-5 sm:p-6 rounded-2xl border border-[#8c6239]/20 bg-[#faf6ef] shadow-xs space-y-4 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#8c6239]/15">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#f3ece1] border border-[#8c6239]/20 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-[#8c6239]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#2a241c] font-display">
                Stewardship Ledger & Receipts
              </h2>
              <p className="text-xs text-[#6f665c]">
                Records of payments and annual fellowship contributions
              </p>
            </div>
          </div>
        </div>

        {/* Mobile View: Clean Receipt Cards */}
        <div className="block sm:hidden space-y-2.5">
          {SAMPLE_INVOICES.map((inv) => (
            <div
              key={inv.id}
              className="p-3.5 rounded-xl border border-[#8c6239]/15 bg-[#f3ece1]/50 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-[#6f665c]">{inv.date}</span>
                <span className="px-2 py-0.5 rounded-full bg-[#8c6239]/10 text-[#8c6239] text-[10px] font-semibold">
                  {inv.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-[#2a241c] truncate">{inv.description}</span>
                <span className="font-mono font-bold text-[#2a241c] ml-2 shrink-0">{inv.amount}</span>
              </div>
              <div className="pt-1 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => handleDownloadInvoice(inv)}
                  className="min-h-[40px] px-3 py-1.5 text-xs font-semibold text-[#8c6239] hover:bg-[#faf6ef] rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Receipt</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Full Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#8c6239]/15 text-[#6f665c]">
                <th className="pb-2 font-semibold">Date</th>
                <th className="pb-2 font-semibold">Description</th>
                <th className="pb-2 font-semibold">Amount</th>
                <th className="pb-2 font-semibold">Status</th>
                <th className="pb-2 text-right font-semibold">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#8c6239]/10">
              {SAMPLE_INVOICES.map((inv) => (
                <tr key={inv.id} className="text-[#2a241c]">
                  <td className="py-3 font-mono text-[11px] text-[#6f665c]">{inv.date}</td>
                  <td className="py-3 font-medium">{inv.description}</td>
                  <td className="py-3 font-mono font-semibold">{inv.amount}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full bg-[#8c6239]/10 text-[#8c6239] text-[10px] font-semibold">
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDownloadInvoice(inv)}
                      className="min-h-[36px] px-2.5 py-1 text-[11px] font-semibold text-[#8c6239] hover:bg-[#f3ece1] rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Downgrade Confirmation Modal */}
      {showDowngradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2a241c]/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#faf6ef] border border-[#8c6239]/30 rounded-2xl p-6 shadow-xl space-y-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#f3ece1] border border-[#8c6239]/25 flex items-center justify-center text-[#8c6239]">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#2a241c] font-display">
                  Pause or Downgrade Plan
                </h3>
                <p className="text-[11px] text-[#6f665c]">We honor your decisions in every season</p>
              </div>
            </div>

            <p className="text-[#2a241c] leading-relaxed">
              When transitioning to the Free tier, all your current loved ones, memory notes, and drafts remain safely preserved in your archive. Your monthly draft quota will simply adjust to 10 notes per month.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#8c6239]/15">
              <button
                type="button"
                onClick={() => setShowDowngradeModal(false)}
                className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-[#6f665c] hover:text-[#2a241c] cursor-pointer"
              >
                Keep Pro Covenant
              </button>
              <button
                type="button"
                onClick={handleConfirmDowngrade}
                className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-[#faf6ef] bg-[#8c6239] hover:bg-[#8c6239]/90 cursor-pointer"
              >
                Confirm Downgrade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Card Modal */}
      {showCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2a241c]/50 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#faf6ef] border border-[#8c6239]/30 rounded-2xl p-6 shadow-xl space-y-4 text-xs">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-[#8c6239]" />
              <h3 className="text-base font-bold text-[#2a241c] font-display">
                Update Payment Card
              </h3>
            </div>

            <form onSubmit={handleUpdatePayment} className="space-y-3">
              <div>
                <label className="block font-semibold text-[#2a241c] mb-1">
                  New Card Number
                </label>
                <input
                  type="text"
                  placeholder="•••• •••• •••• 1234"
                  value={newCardInput}
                  onChange={(e) => setNewCardInput(e.target.value)}
                  className="w-full px-3 py-2 min-h-[44px] rounded-xl border border-[#8c6239]/30 bg-[#faf6ef] text-[#2a241c] font-mono"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCardModal(false)}
                  className="min-h-[40px] px-3 py-1.5 text-xs text-[#6f665c] hover:text-[#2a241c] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[40px] px-4 py-1.5 text-xs font-semibold text-[#faf6ef] bg-[#2a241c] hover:bg-[#2a241c]/90 rounded-xl cursor-pointer"
                >
                  Save Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
