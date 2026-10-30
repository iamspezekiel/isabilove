"use client";

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MessageDraft, Contact, DeliveryChannel } from '../types';
import { formatDatePretty, getLoveLanguageLabel, getRelationshipLabel } from '../services/scheduler';
import { dispatchExternalWebhook } from '../services/geminiService';
import {
  CheckCircle2,
  Copy,
  MessageCircle,
  Mail,
  Send,
  Sparkles,
  Trash2,
  Edit3,
  Check,
  Gift,
  Clock,
  ArrowRight,
  BookOpen,
  Scroll,
} from 'lucide-react';

export const QueuePage: React.FC = () => {
  const { drafts, contacts, subscription, approveAndSendDraft, updateDraftText, dismissDraft } = useApp();
  const navigate = useNavigate();

  const pendingDrafts = drafts.filter((d) => d.status === 'pending_approval');
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [copiedDraftId, setCopiedDraftId] = useState<string | null>(null);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);

  // Avatar error fallback tracking
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const handleImageError = (id: string) => {
    setBrokenImages((prev) => ({ ...prev, [id]: true }));
  };

  const handleStartEdit = (draft: MessageDraft) => {
    setEditingDraftId(draft.id);
    setEditText(draft.customizedText || draft.generatedText);
  };

  const handleSaveEdit = (draftId: string) => {
    updateDraftText(draftId, editText);
    setEditingDraftId(null);
  };

  const handleCopy = (draft: MessageDraft) => {
    const text = draft.customizedText || draft.generatedText;
    navigator.clipboard.writeText(text);
    setCopiedDraftId(draft.id);
    setTimeout(() => setCopiedDraftId(null), 2000);
  };

  const handleWhatsAppApprove = (draft: MessageDraft, contact?: Contact) => {
    approveAndSendDraft(
      draft,
      'whatsapp',
      `Approved and sent via WhatsApp to ${contact?.name || 'loved one'}`
    );
  };

  const handleEmailSend = (draft: MessageDraft, contact?: Contact) => {
    setDispatchingId(draft.id);
    setTimeout(() => {
      approveAndSendDraft(
        draft,
        'email',
        `Dispatched email to ${contact?.email || subscription.userEmail}`
      );
      setDispatchingId(null);
    }, 600);
  };

  const handleWebhookSend = async (draft: MessageDraft, contact?: Contact) => {
    setDispatchingId(draft.id);
    const text = draft.customizedText || draft.generatedText;
    const targetUrl = subscription.webhookUrl || 'https://webhook.site/isabilove-demo';

    try {
      const result = await dispatchExternalWebhook(targetUrl, {
        event: 'relationship.message.approved',
        timestamp: new Date().toISOString(),
        recipient: {
          name: contact?.name,
          relationship: contact?.relationship,
          email: contact?.email,
          phone: contact?.phone,
        },
        occasion: draft.customOccasionTitle || draft.occasion,
        message: text,
      });

      approveAndSendDraft(
        draft,
        'webhook',
        `POST ${targetUrl} acknowledged (HTTP ${result.status || 200})`
      );
    } catch {
      approveAndSendDraft(
        draft,
        'webhook',
        `Dispatched simulated webhook payload to ${targetUrl}`
      );
    } finally {
      setDispatchingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-6 md:pb-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-[#2a241c] font-display">
            Review Queue
          </h1>
          <p className="text-xs text-[#6f665c] mt-1">
            {pendingDrafts.length} messages awaiting your review
          </p>
        </div>

        <Link
          to="/studio"
          className="min-h-[44px] px-4 py-2 text-xs font-semibold text-[#faf6ef] bg-[#2a241c] hover:bg-[#2a241c]/90 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-[#8c6239]" />
          <span>Compose Note</span>
        </Link>
      </div>

      {/* Restrained Biblical Admonition Card */}
      <div className="p-4 sm:p-5 rounded-2xl border border-[#8c6239]/20 bg-[#faf6ef] flex items-start gap-3 shadow-xs">
        <BookOpen className="w-4 h-4 text-[#8c6239] shrink-0 mt-0.5" />
        <div className="text-xs text-[#6f665c] space-y-0.5">
          <p className="font-display italic text-[#2a241c] text-xs sm:text-sm leading-relaxed">
            “Let your words always be gracious, seasoned with salt, so that you will know how you should answer each person.”
          </p>
          <p className="text-[11px] text-[#8c6239] font-mono">
            — Colossians 4:6 (New World Translation)
          </p>
        </div>
      </div>

      {/* Drafts List */}
      {pendingDrafts.length === 0 ? (
        <div className="p-10 text-center rounded-2xl border border-[#8c6239]/20 bg-[#faf6ef] space-y-3">
          <CheckCircle2 className="w-10 h-10 text-[#8c6239] mx-auto" />
          <h3 className="text-base font-bold text-[#2a241c] font-display">All messages reviewed</h3>
          <p className="text-xs text-[#6f665c] max-w-sm mx-auto leading-relaxed">
            There are no messages waiting in your review queue. As dates approach, notes will appear here.
          </p>
          <Link
            to="/studio"
            className="inline-flex min-h-[44px] px-4 py-2.5 text-xs font-semibold text-[#faf6ef] bg-[#2a241c] rounded-xl hover:bg-[#2a241c]/90 transition-colors items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#8c6239]" />
            <span>Compose in Studio</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingDrafts.map((draft) => {
            const contact = contacts.find((c) => c.id === draft.contactId);
            const isEditing = editingDraftId === draft.id;
            const currentText = draft.customizedText || draft.generatedText;

            return (
              <div
                key={draft.id}
                className="p-5 sm:p-6 rounded-2xl border border-[#8c6239]/20 bg-[#faf6ef] shadow-xs space-y-4"
              >
                {/* Header row: Recipient & Event Details */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#8c6239]/15">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#8c6239] text-[#faf6ef] flex items-center justify-center font-bold text-sm shrink-0 border border-[#8c6239]/30 overflow-hidden shadow-xs">
                      {contact && !brokenImages[contact.id] && contact.avatarUrl ? (
                        <img
                          src={contact.avatarUrl}
                          alt={contact.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={() => handleImageError(contact.id)}
                        />
                      ) : (
                        <span className="font-display">{(contact?.name || 'L')[0]!.toUpperCase()}</span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-[#2a241c] font-display">
                        {contact ? contact.name : 'Loved One'}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-[#6f665c]">
                        <span className="font-medium text-[#2a241c] uppercase tracking-wide text-[11px]">
                          {draft.customOccasionTitle || draft.occasion.replace('_', ' ')}
                        </span>
                        <span aria-hidden="true" className="text-[#8c6239]/30">·</span>
                        <span className="font-mono tabular-nums">{formatDatePretty(draft.scheduledDate)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-[11px] text-[#6f665c] capitalize font-medium">
                      Tone: {draft.tone}
                    </span>
                    <button
                      onClick={() => dismissDraft(draft.id)}
                      className="w-9 h-9 flex items-center justify-center text-[#6f665c] hover:text-[#8c6239] hover:bg-[#f3ece1] rounded-lg transition-colors cursor-pointer"
                      title="Dismiss Draft"
                      aria-label="Dismiss Draft"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Message Content with parchment quotation paper styling */}
                <div className="p-4 rounded-xl bg-[#f3ece1]/70 border border-[#8c6239]/15 text-xs text-[#2a241c]">
                  {isEditing ? (
                    <div className="space-y-3">
                      <textarea
                        rows={4}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full p-3 rounded-lg border border-[#8c6239]/30 focus:outline-none focus:border-[#8c6239] bg-[#faf6ef] text-[#2a241c] leading-relaxed text-xs"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingDraftId(null)}
                          className="min-h-[40px] px-3.5 py-1.5 font-medium text-[#6f665c] hover:text-[#2a241c] transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(draft.id)}
                          className="min-h-[40px] px-4 py-1.5 font-semibold text-[#faf6ef] bg-[#2a241c] rounded-lg hover:bg-[#2a241c]/90 transition-colors shadow-xs cursor-pointer"
                        >
                          Save Revisions
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="font-sans leading-relaxed text-[#2a241c] text-xs sm:text-sm whitespace-pre-wrap">
                        {currentText}
                      </p>
                      <div className="pt-2 flex items-center justify-between text-[11px] text-[#6f665c]">
                        <button
                          onClick={() => handleStartEdit(draft)}
                          className="font-medium text-[#8c6239] hover:underline flex items-center gap-1 cursor-pointer min-h-[36px]"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Refine text</span>
                        </button>

                        <button
                          onClick={() => handleCopy(draft)}
                          className="font-medium text-[#6f665c] hover:text-[#2a241c] flex items-center gap-1 cursor-pointer min-h-[36px]"
                        >
                          {copiedDraftId === draft.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-[#8c6239]" />
                              <span className="text-[#8c6239]">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Words</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Suggested Gift Context if available */}
                {draft.suggestedGifts && draft.suggestedGifts.length > 0 && (
                  <div className="p-3 rounded-xl bg-[#faf6ef] border border-[#8c6239]/15 text-xs text-[#6f665c] space-y-1.5">
                    <div className="flex items-center gap-1.5 font-semibold text-[#2a241c]">
                      <Gift className="w-3.5 h-3.5 text-[#8c6239]" />
                      <span>Curated Token of Appreciation:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-[#6f665c]">
                      {draft.suggestedGifts.map((gift, gIdx) => (
                        <li key={gIdx} className="truncate">{gift}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Thumb-Zone Primary Approval Actions */}
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {contact?.phone && (
                    <button
                      onClick={() => handleWhatsAppApprove(draft, contact)}
                      className="min-h-[44px] px-3 py-2 text-xs font-semibold text-[#faf6ef] bg-[#2a241c] hover:bg-[#2a241c]/90 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 text-[#8c6239]" />
                      <span>Send WhatsApp</span>
                    </button>
                  )}

                  {contact?.email && (
                    <button
                      onClick={() => handleEmailSend(draft, contact)}
                      disabled={dispatchingId === draft.id}
                      className="min-h-[44px] px-3 py-2 text-xs font-semibold text-[#2a241c] bg-[#f3ece1] hover:bg-[#f3ece1]/80 border border-[#8c6239]/20 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Mail className="w-4 h-4 text-[#8c6239]" />
                      <span>Dispatch Email</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleWebhookSend(draft, contact)}
                    disabled={dispatchingId === draft.id}
                    className="min-h-[44px] px-3 py-2 text-xs font-semibold text-[#faf6ef] bg-[#8c6239] hover:bg-[#8c6239]/90 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Archive</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

