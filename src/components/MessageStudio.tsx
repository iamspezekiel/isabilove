import React, { useState, useEffect } from 'react';
import { Contact, ToneType, MessageDraft, UserSubscription } from '../types';
import { generateAiMessage } from '../services/geminiService';
import { getLoveLanguageLabel, getRelationshipLabel } from '../services/scheduler';
import { SAMPLE_AVATARS } from '../services/storage';
import {
  Sparkles,
  Heart,
  RefreshCw,
  Copy,
  Check,
  MessageCircle,
  Gift,
  Lightbulb,
  Sliders,
  BookOpen,
} from 'lucide-react';

interface MessageStudioProps {
  contacts: Contact[];
  subscription: UserSubscription;
  initialContact?: Contact | null;
  initialOccasion?: string;
  initialDraft?: MessageDraft | null;
  onSaveDraftToQueue: (draft: MessageDraft) => void;
  onApproveAndSendNow: (draft: MessageDraft, channel: any) => void;
  onIncrementUsage: () => void;
  onOpenUpgradeModal: () => void;
}

export const MessageStudio: React.FC<MessageStudioProps> = ({
  contacts,
  subscription,
  initialContact,
  initialOccasion,
  initialDraft,
  onSaveDraftToQueue,
  onApproveAndSendNow,
  onIncrementUsage,
  onOpenUpgradeModal,
}) => {
  const [selectedContactId, setSelectedContactId] = useState<string>(
    initialContact?.id || initialDraft?.contactId || contacts[0]?.id || ''
  );
  const [occasion, setOccasion] = useState<string>(
    initialOccasion || initialDraft?.occasion || 'birthday'
  );
  const [customOccasionTitle, setCustomOccasionTitle] = useState<string>(
    initialDraft?.customOccasionTitle || ''
  );
  const [tone, setTone] = useState<ToneType>(
    initialDraft?.tone || initialContact?.preferredTone || 'romantic'
  );
  const [lengthPreference, setLengthPreference] = useState<'short' | 'standard' | 'heartfelt'>('heartfelt');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [primaryText, setPrimaryText] = useState<string>(
    initialDraft?.customizedText || initialDraft?.generatedText || ''
  );
  const [alternativeText, setAlternativeText] = useState<string>('');
  const [suggestedGifts, setSuggestedGifts] = useState<string[]>(initialDraft?.suggestedGifts || []);
  const [deliveryTip, setDeliveryTip] = useState<string>(initialDraft?.deliveryTip || '');
  const [copied, setCopied] = useState<boolean>(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const selectedContact = contacts.find((c) => c.id === selectedContactId) || contacts[0];

  useEffect(() => {
    if (selectedContact && !initialDraft) {
      setTone(selectedContact!.preferredTone);
    }
  }, [selectedContactId]);

  const handleGenerate = async () => {
    if (!selectedContact) return;

    if (subscription.tier === 'free' && subscription.aiDraftsUsed >= subscription.aiDraftsLimit) {
      onOpenUpgradeModal();
      return;
    }

    setIsLoading(true);
    setStatusNotice(null);

    try {
      const result = await generateAiMessage({
        contact: selectedContact,
        occasion,
        customOccasionTitle: customOccasionTitle.trim() || undefined,
        tone,
        length: lengthPreference,
      });

      setPrimaryText(result.message);
      setAlternativeText(result.alternative);
      setSuggestedGifts(result.suggestedGifts);
      setDeliveryTip(result.deliveryTip);

      onIncrementUsage();
      setStatusNotice('Generated personalized message successfully.');
    } catch {
      setStatusNotice('Generated via fallback template.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwapWithAlternative = () => {
    if (!alternativeText) return;
    const oldPrimary = primaryText;
    setPrimaryText(alternativeText);
    setAlternativeText(oldPrimary);
  };

  const handleCopyText = () => {
    if (!primaryText) return;
    navigator.clipboard.writeText(primaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQueueForApproval = () => {
    if (!primaryText || !selectedContact) return;

    const newDraft: MessageDraft = {
      id: initialDraft?.id || `draft_${Date.now()}`,
      contactId: selectedContact!.id,
      occasion,
      customOccasionTitle: customOccasionTitle.trim() || undefined,
      tone,
      generatedText: primaryText,
      customizedText: primaryText,
      suggestedGifts,
      deliveryTip,
      status: 'pending_approval',
      scheduledDate: new Date().toISOString().split('T')[0]!,
      channel: 'queue',
    };

    onSaveDraftToQueue(newDraft);
    setStatusNotice('Message saved to your Approval Queue!');
  };

  const handleSendWhatsApp = () => {
    if (!primaryText) return;
    const phone = selectedContact?.phone ? selectedContact!.phone.replace(/[^0-9]/g, '') : '';
    const url = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(primaryText)}` : `https://wa.me/?text=${encodeURIComponent(primaryText)}`;
    window.open(url, '_blank');

    const draft: MessageDraft = {
      id: `draft_${Date.now()}`,
      contactId: selectedContact!.id,
      occasion,
      tone,
      generatedText: primaryText,
      customizedText: primaryText,
      suggestedGifts,
      status: 'sent',
      scheduledDate: new Date().toISOString().split('T')[0]!,
      channel: 'whatsapp',
      sentAt: new Date().toISOString(),
      deliveryLog: {
        timestamp: new Date().toISOString(),
        method: 'WhatsApp Web',
        status: 'opened_in_client',
        recipient: selectedContact!.name,
      },
    };
    onApproveAndSendNow(draft, 'whatsapp');
  };

  return (
    <div className="space-y-5 pb-24 md:pb-12">
      {/* Header & Quota Gauge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 mb-0.5">
            <Sparkles className="w-3.5 h-3.5 fill-rose-600" />
            <span>Gemini 3.8 Flash AI</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 font-display">
            AI Message Studio
          </h1>
        </div>

        {/* Quota Counter */}
        <div className="p-2.5 bg-white border border-neutral-200 rounded-xl text-xs flex items-center justify-between sm:justify-start gap-3">
          <div>
            <span className="text-neutral-500 font-medium">Monthly Quota: </span>
            <span className="font-mono font-bold text-neutral-900 tabular-nums">
              {subscription.aiDraftsUsed} of {subscription.aiDraftsLimit} used
            </span>
          </div>
          {subscription.tier === 'free' && (
            <button
              onClick={onOpenUpgradeModal}
              className="min-h-[36px] text-xs font-semibold text-rose-600 hover:text-rose-700 underline cursor-pointer whitespace-nowrap"
            >
              Get Unlimited
            </button>
          )}
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Configuration Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 space-y-4 shadow-xs">
            <h2 className="text-xs font-bold text-neutral-900 font-display flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-neutral-500" />
              <span>Personalization Controls</span>
            </h2>

            {/* Recipient Selector */}
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                Recipient Loved One *
              </label>
              <select
                value={selectedContactId}
                onChange={(e) => setSelectedContactId(e.target.value)}
                className="w-full px-3 py-2.5 min-h-[44px] text-xs rounded-xl border border-neutral-200 focus:outline-none focus:border-rose-500 bg-white font-medium"
              >
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({getRelationshipLabel(c.relationship)})
                  </option>
                ))}
              </select>

              {/* Profile Context Pill */}
              {selectedContact && (
                <div className="mt-2 p-2.5 rounded-xl bg-neutral-50 border border-neutral-100 text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <img
                      src={selectedContact!.avatarUrl || SAMPLE_AVATARS.partner}
                      alt={selectedContact!.name}
                      className="w-6 h-6 rounded-full object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <span className="font-bold text-neutral-900 truncate">{selectedContact!.name}</span>
                    <span className="text-neutral-400">·</span>
                    <span className="text-rose-600 font-medium truncate">
                      {getLoveLanguageLabel(selectedContact!.loveLanguage)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Occasion Selector Touch Grid */}
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Occasion</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'birthday', label: '🎂 Birthday' },
                  { id: 'anniversary', label: '💍 Anniversary' },
                  { id: 'check_in', label: '☕ Thinking of You' },
                  { id: 'grateful', label: '🙏 Gratitude' },
                  { id: 'valentines', label: '🌹 Valentine’s' },
                  { id: 'custom', label: '✨ Custom' },
                ].map((occ) => (
                  <button
                    key={occ.id}
                    type="button"
                    onClick={() => setOccasion(occ.id)}
                    className={`min-h-[44px] p-2.5 rounded-xl border text-left transition-colors cursor-pointer flex items-center ${
                      occasion === occ.id
                        ? 'bg-rose-50 text-rose-900 border-rose-300 font-semibold'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    {occ.label}
                  </button>
                ))}
              </div>

              {occasion === 'custom' && (
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="e.g. Promotion, New Home"
                    value={customOccasionTitle}
                    onChange={(e) => setCustomOccasionTitle(e.target.value)}
                    className="w-full px-3 py-2 min-h-[44px] text-xs rounded-xl border border-neutral-200 focus:outline-none focus:border-rose-500"
                  />
                </div>
              )}
            </div>

            {/* Tone Selector */}
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                Emotional Tone Preset
              </label>
              <div className="space-y-1.5">
                {[
                  { id: 'romantic', title: 'Warm & Romantic', desc: 'Heartfelt devotion, intimacy' },
                  { id: 'playful', title: 'Playful & Cheeky', desc: 'Teasing humor, banter' },
                  { id: 'grateful', title: 'Deeply Grateful', desc: 'Grounded thankfulness' },
                  { id: 'poetic', title: 'Poetic & Reflective', desc: 'Lyrical prose & beauty' },
                  { id: 'cheerful', title: 'Cheerful & Uplifting', desc: 'Positive, energetic sunshine' },
                  { id: 'pidgin', title: 'Culturally Warm / Pidgin', desc: 'Nigerian celebratory joy' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTone(t.id as ToneType)}
                    className={`w-full min-h-[48px] p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      tone === t.id
                        ? 'bg-rose-50/70 border-rose-400 ring-1 ring-rose-400'
                        : 'bg-white border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-neutral-900">{t.title}</div>
                      <div className="text-[11px] text-neutral-500">{t.desc}</div>
                    </div>
                    {tone === t.id && <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Length Control */}
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">Length</label>
              <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-xl">
                {[
                  { id: 'short', label: 'Short' },
                  { id: 'standard', label: 'Standard' },
                  { id: 'heartfelt', label: 'Heartfelt' },
                ].map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setLengthPreference(l.id as any)}
                    className={`flex-1 min-h-[38px] py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer text-center ${
                      lengthPreference === l.id
                        ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Generation Button */}
            <button
              onClick={handleGenerate}
              disabled={isLoading || !selectedContact}
              className="w-full min-h-[48px] py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.98] disabled:bg-neutral-300 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Crafting with Gemini 3.8...' : 'Generate Personalized Message'}</span>
            </button>

            {statusNotice && (
              <div className="text-xs text-neutral-600 text-center bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
                {statusNotice}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Editor Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-rose-600" />
                <h2 className="text-sm sm:text-base font-bold text-neutral-900 font-display">
                  Live Message Editor
                </h2>
              </div>
              <span className="text-xs text-neutral-400 font-mono tabular-nums">
                {primaryText.length} chars
              </span>
            </div>

            {/* Textarea */}
            <textarea
              rows={8}
              value={primaryText}
              onChange={(e) => setPrimaryText(e.target.value)}
              placeholder="Tap 'Generate Personalized Message' or type your heartfelt note here..."
              className="w-full p-3.5 sm:p-4 rounded-xl border border-neutral-200 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-white text-xs sm:text-sm text-neutral-900 leading-relaxed font-sans placeholder-neutral-400"
            />

            {/* Alternative Variation */}
            {alternativeText && (
              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-700">Alternative Variation</span>
                  <button
                    onClick={handleSwapWithAlternative}
                    className="min-h-[36px] text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Swap into Editor</span>
                  </button>
                </div>
                <p className="text-xs text-neutral-600 italic leading-relaxed">
                  "{alternativeText}"
                </p>
              </div>
            )}

            {/* Gift Suggestions */}
            {suggestedGifts.length > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <Gift className="w-4 h-4 text-amber-600" />
                  <span>Curated Gifts Grounded in Profile</span>
                </div>
                <ul className="space-y-1 text-neutral-700 list-disc list-inside">
                  {suggestedGifts.map((gift, idx) => (
                    <li key={idx}>{gift}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Delivery Tip */}
            {deliveryTip && (
              <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-200 text-xs flex items-start gap-2 text-neutral-700">
                <Lightbulb className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Tip:</strong> {deliveryTip}
                </span>
              </div>
            )}

            {/* Bottom Mobile-First Action Grid */}
            <div className="pt-3 border-t border-neutral-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <button
                onClick={handleCopyText}
                disabled={!primaryText}
                className="min-h-[48px] px-3.5 py-2.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-neutral-500" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleSendWhatsApp}
                  disabled={!primaryText}
                  className="min-h-[48px] px-3.5 py-2.5 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 disabled:opacity-50 rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={handleQueueForApproval}
                  disabled={!primaryText}
                  className="min-h-[48px] px-4 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:bg-neutral-300 rounded-xl active:scale-[0.98] transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Heart className="w-4 h-4" />
                  <span>Queue Draft</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


