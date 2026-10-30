"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ToneType, MessageDraft } from '../types';
import { generateAiMessage } from '../services/geminiService';
import { getLoveLanguageLabel, getRelationshipLabel } from '../services/scheduler';
import {
  Sparkles,
  Heart,
  RefreshCw,
  Copy,
  Check,
  MessageCircle,
  Gift,
  Lightbulb,
  BookOpen,
  ArrowRight,
  Send,
  Scroll,
} from 'lucide-react';

export const StudioPage: React.FC = () => {
  const { contacts, drafts, subscription, saveDraftToQueue, approveAndSendDraft, incrementAiUsage } = useApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const urlContactId = searchParams.get('contactId');
  const urlOccasion = searchParams.get('occasion');
  const urlDraftId = searchParams.get('draftId');

  const existingDraft = urlDraftId ? drafts.find((d) => d.id === urlDraftId) : null;

  const [selectedContactId, setSelectedContactId] = useState<string>(
    urlContactId || existingDraft?.contactId || contacts[0]?.id || ''
  );
  const [occasion, setOccasion] = useState<string>(
    urlOccasion || existingDraft?.occasion || 'birthday'
  );
  const [customOccasionTitle, setCustomOccasionTitle] = useState<string>(
    existingDraft?.customOccasionTitle || ''
  );
  const [tone, setTone] = useState<ToneType>(
    existingDraft?.tone || 'romantic'
  );
  const [lengthPreference, setLengthPreference] = useState<'short' | 'standard' | 'heartfelt'>('heartfelt');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [primaryText, setPrimaryText] = useState<string>(
    existingDraft?.customizedText || existingDraft?.generatedText || ''
  );
  const [alternativeText, setAlternativeText] = useState<string>('');
  const [suggestedGifts, setSuggestedGifts] = useState<string[]>(existingDraft?.suggestedGifts || []);
  const [deliveryTip, setDeliveryTip] = useState<string>(existingDraft?.deliveryTip || '');
  const [copied, setCopied] = useState<boolean>(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const selectedContact = contacts.find((c) => c.id === selectedContactId) || contacts[0];

  useEffect(() => {
    if (selectedContact && !existingDraft) {
      setTone(selectedContact.preferredTone);
    }
  }, [selectedContactId]);

  const handleGenerate = async () => {
    if (!selectedContact) return;

    setIsLoading(true);
    setStatusNotice(null);

    try {
      const result = await generateAiMessage({
        contact: selectedContact,
        occasion,
        customOccasionTitle: customOccasionTitle.trim() || undefined,
        tone,
        length: lengthPreference,
        religion: subscription.religion || 'christianity',
        gender: subscription.gender || 'prefer_not_to_say',
        scriptureTranslation: subscription.defaultScriptureTranslation || 'NWT',
      });

      setPrimaryText(result.message);
      setAlternativeText(result.alternative);
      setSuggestedGifts(result.suggestedGifts);
      setDeliveryTip(result.deliveryTip);

      incrementAiUsage();
      setStatusNotice('Words of blessing composed successfully.');
    } catch {
      setStatusNotice('Composed via sacred offline fallback.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwapWithAlternative = () => {
    if (!alternativeText) return;
    const temp = primaryText;
    setPrimaryText(alternativeText);
    setAlternativeText(temp);
  };

  const handleSaveToQueue = () => {
    if (!selectedContact || !primaryText) return;

    const draft: MessageDraft = {
      id: existingDraft?.id || `draft_${Date.now()}`,
      contactId: selectedContact.id,
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

    saveDraftToQueue(draft);
    navigate('/queue');
  };

  const handleCopy = () => {
    if (!primaryText) return;
    navigator.clipboard.writeText(primaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsAppNow = () => {
    if (!selectedContact || !primaryText) return;
    const textEncoded = encodeURIComponent(primaryText);
    const phoneClean = (selectedContact.phone || '').replace(/[^0-9]/g, '');
    const url = phoneClean
      ? `https://wa.me/${phoneClean}?text=${textEncoded}`
      : `https://wa.me/?text=${textEncoded}`;

    const draft: MessageDraft = {
      id: existingDraft?.id || `draft_${Date.now()}`,
      contactId: selectedContact.id,
      occasion,
      customOccasionTitle: customOccasionTitle.trim() || undefined,
      tone,
      generatedText: primaryText,
      customizedText: primaryText,
      suggestedGifts,
      deliveryTip,
      status: 'sent',
      scheduledDate: new Date().toISOString().split('T')[0]!!,
      channel: 'whatsapp',
      sentAt: new Date().toISOString(),
    };

    approveAndSendDraft(draft, 'whatsapp', `Sent via WhatsApp directly to ${selectedContact.name}`);
    window.location.href = url;
  };

  return (
    <div className="space-y-6 pb-6 md:pb-4 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-[#2a241c] font-display">
            The Scribe's Studio
          </h1>
          <p className="text-xs text-[#6f665c] mt-1">
            Craft words of blessing and remembrance tailored to those you love
          </p>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs text-[#8c6239] bg-[#f3ece1] px-3 py-1.5 rounded-xl border border-[#8c6239]/20 font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Unlimited Scribe</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Composition Parameters (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl border border-[#8c6239]/20 bg-[#faf6ef] shadow-xs space-y-4 text-xs">
            <h2 className="font-bold text-[#2a241c] text-sm font-display flex items-center gap-2">
              <Scroll className="w-4 h-4 text-[#8c6239]" />
              <span>Composition Nuances</span>
            </h2>

            {/* Select Loved One */}
            <div>
              <label className="block font-semibold text-[#2a241c] mb-1">Loved One *</label>
              {contacts.length === 0 ? (
                <div className="p-3 rounded-xl bg-[#f3ece1] text-[#6f665c]">
                  No loved ones found.{' '}
                  <Link to="/contacts?action=new" className="text-[#8c6239] font-bold underline">
                    Add someone first
                  </Link>
                </div>
              ) : (
                <select
                  value={selectedContactId}
                  onChange={(e) => setSelectedContactId(e.target.value)}
                  className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-[#8c6239]/30 focus:outline-none focus:border-[#8c6239] bg-[#faf6ef] text-[#2a241c]"
                >
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({getRelationshipLabel(c.relationship)})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Recipient Snapshot Mini Card */}
            {selectedContact && (
              <div className="p-3 rounded-xl bg-[#f3ece1]/70 border border-[#8c6239]/15 space-y-1 text-[11px] text-[#6f665c]">
                <div className="flex items-center justify-between font-semibold text-[#2a241c]">
                  <span>Love Language:</span>
                  <span className="text-[#8c6239]">{getLoveLanguageLabel(selectedContact.loveLanguage)}</span>
                </div>
                {selectedContact.preferences.favoriteFlowers && (
                  <p className="truncate">Flowers: {selectedContact.preferences.favoriteFlowers}</p>
                )}
                {selectedContact.memories && selectedContact.memories.length > 0 && (
                  <p className="truncate italic">Memory: {selectedContact.memories[0]}</p>
                )}
              </div>
            )}

            {/* Occasion Selection */}
            <div>
              <label className="block font-semibold text-[#2a241c] mb-1">Occasion</label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-[#8c6239]/30 focus:outline-none focus:border-[#8c6239] bg-[#faf6ef] text-[#2a241c] capitalize"
              >
                <option value="birthday">Birthday Celebration</option>
                <option value="anniversary">Relationship Anniversary</option>
                <option value="check_in">Gentle Check-in</option>
                <option value="milestone">Life Milestone</option>
                <option value="valentines">Valentine's Day</option>
                <option value="custom">Custom Remembrance</option>
              </select>
            </div>

            {occasion === 'custom' && (
              <div>
                <label className="block font-semibold text-[#2a241c] mb-1">Custom Occasion Title</label>
                <input
                  type="text"
                  placeholder="e.g. New Home Blessing, New Job"
                  value={customOccasionTitle}
                  onChange={(e) => setCustomOccasionTitle(e.target.value)}
                  className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-[#8c6239]/30 focus:outline-none focus:border-[#8c6239] bg-[#faf6ef] text-[#2a241c]"
                />
              </div>
            )}

            {/* Tone Selector */}
            <div>
              <label className="block font-semibold text-[#2a241c] mb-1.5">Intonation & Voice</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'romantic', label: 'Romantic' },
                  { id: 'grateful', label: 'Grateful' },
                  { id: 'poetic', label: 'Poetic' },
                  { id: 'playful', label: 'Playful' },
                  { id: 'cheerful', label: 'Uplifting' },
                  { id: 'pidgin', label: 'Pidgin (Warmth)' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTone(t.id as ToneType)}
                    className={`min-h-[44px] p-2 text-center rounded-xl border transition-colors cursor-pointer text-xs ${
                      tone === t.id
                        ? 'bg-[#2a241c] text-[#faf6ef] border-[#2a241c] font-semibold'
                        : 'bg-[#faf6ef] text-[#6f665c] border-[#8c6239]/20 hover:border-[#8c6239]/40'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Length Preference */}
            <div>
              <label className="block font-semibold text-[#2a241c] mb-1">Length</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'short', label: 'Concise' },
                  { id: 'standard', label: 'Standard' },
                  { id: 'heartfelt', label: 'Heartfelt' },
                ].map((len) => (
                  <button
                    key={len.id}
                    type="button"
                    onClick={() => setLengthPreference(len.id as any)}
                    className={`min-h-[40px] py-1.5 text-center rounded-xl border transition-colors cursor-pointer text-xs ${
                      lengthPreference === len.id
                        ? 'bg-[#8c6239] text-[#faf6ef] border-[#8c6239] font-semibold'
                        : 'bg-[#faf6ef] text-[#6f665c] border-[#8c6239]/20 hover:border-[#8c6239]/40'
                    }`}
                  >
                    {len.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Thumb Compose Trigger */}
            <button
              onClick={handleGenerate}
              disabled={isLoading || !selectedContact}
              className="w-full min-h-[48px] py-3 px-4 text-xs font-semibold text-[#faf6ef] bg-[#2a241c] hover:bg-[#2a241c]/90 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-[#8c6239]" />
              <span>{isLoading ? 'Composing...' : 'Compose Words'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Parchment Output & Customization (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 sm:p-6 rounded-2xl border border-[#8c6239]/20 bg-[#faf6ef] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#8c6239]/15">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#8c6239]" />
                <h2 className="font-bold text-[#2a241c] text-sm font-display">
                  Composed Parchment
                </h2>
              </div>

              {primaryText && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="min-h-[38px] px-3 text-xs font-medium text-[#6f665c] hover:text-[#2a241c] flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#8c6239]" />
                        <span className="text-[#8c6239]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  {alternativeText && (
                    <button
                      onClick={handleSwapWithAlternative}
                      className="min-h-[38px] px-3 text-xs font-medium text-[#8c6239] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Alternate Version</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Status Notice */}
            {statusNotice && (
              <p className="text-xs text-[#8c6239] font-medium">{statusNotice}</p>
            )}

            {/* Editable Parchment Textarea */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#2a241c]">
                Refine words as your heart directs:
              </label>
              <textarea
                rows={7}
                placeholder="Click 'Compose Words of Blessing' or begin penning your own thoughtful note here..."
                value={primaryText}
                onChange={(e) => setPrimaryText(e.target.value)}
                className="w-full p-4 rounded-xl border border-[#8c6239]/25 focus:outline-none focus:border-[#8c6239] bg-[#f3ece1]/60 text-[#2a241c] leading-relaxed text-sm font-sans"
              />
            </div>

            {/* Curated Token / Gift Advice */}
            {suggestedGifts.length > 0 && (
              <div className="p-4 rounded-xl bg-[#f3ece1]/50 border border-[#8c6239]/15 text-xs text-[#6f665c] space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-[#2a241c]">
                  <Gift className="w-4 h-4 text-[#8c6239]" />
                  <span>Curated Tokens Grounded in Their Preferences:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-xs text-[#2a241c]">
                  {suggestedGifts.map((gift, gIdx) => (
                    <li key={gIdx} className="leading-relaxed">{gift}</li>
                  ))}
                </ul>
                {deliveryTip && (
                  <p className="pt-1 text-[11px] text-[#6f665c] italic border-t border-[#8c6239]/10">
                    Scribe's Tip: {deliveryTip}
                  </p>
                )}
              </div>
            )}

            {/* Thumb-Zone Final Actions */}
            <div className="pt-3 border-t border-[#8c6239]/15 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <button
                onClick={handleSaveToQueue}
                disabled={!primaryText.trim()}
                className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 text-xs font-semibold text-[#2a241c] bg-[#f3ece1] hover:bg-[#f3ece1]/80 border border-[#8c6239]/25 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>Save to Queue</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#8c6239]" />
              </button>

              <button
                onClick={handleSendWhatsAppNow}
                disabled={!primaryText.trim()}
                className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 text-xs font-semibold text-[#faf6ef] bg-[#2a241c] hover:bg-[#2a241c]/90 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <MessageCircle className="w-4 h-4 text-[#8c6239]" />
                <span>Send WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
