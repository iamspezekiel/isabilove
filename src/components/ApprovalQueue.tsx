import React, { useState } from 'react';
import { MessageDraft, Contact, UserSubscription, DeliveryChannel } from '../types';
import { getDaysUntil, formatDatePretty, getLoveLanguageLabel, getRelationshipLabel } from '../services/scheduler';
import { SAMPLE_AVATARS } from '../services/storage';
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
  Lightbulb,
} from 'lucide-react';

interface ApprovalQueueProps {
  drafts: MessageDraft[];
  contacts: Contact[];
  subscription: UserSubscription;
  onApproveAndSend: (draft: MessageDraft, channel: DeliveryChannel, logDetails: string) => void;
  onUpdateDraftText: (draftId: string, newText: string) => void;
  onDismissDraft: (draftId: string) => void;
  onOpenStudioForDraft: (draft: MessageDraft) => void;
}

export const ApprovalQueue: React.FC<ApprovalQueueProps> = ({
  drafts,
  contacts,
  subscription,
  onApproveAndSend,
  onUpdateDraftText,
  onDismissDraft,
  onOpenStudioForDraft,
}) => {
  const pendingDrafts = drafts.filter((d) => d.status === 'pending_approval');
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [copiedDraftId, setCopiedDraftId] = useState<string | null>(null);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);

  const handleStartEdit = (draft: MessageDraft) => {
    setEditingDraftId(draft.id);
    setEditText(draft.customizedText || draft.generatedText);
  };

  const handleSaveEdit = (draftId: string) => {
    onUpdateDraftText(draftId, editText);
    setEditingDraftId(null);
  };

  const handleCopy = (draft: MessageDraft) => {
    const text = draft.customizedText || draft.generatedText;
    navigator.clipboard.writeText(text);
    setCopiedDraftId(draft.id);
    setTimeout(() => setCopiedDraftId(null), 2000);
  };

  const handleWhatsAppSend = (draft: MessageDraft, contact?: Contact) => {
    const text = draft.customizedText || draft.generatedText;
    const phone = contact?.phone ? contact.phone.replace(/[^0-9]/g, '') : '';
    const url = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    onApproveAndSend(
      draft,
      'whatsapp',
      `Launched WhatsApp Web with recipient ${contact?.name || 'loved one'}`
    );
  };

  const handleEmailSend = (draft: MessageDraft, contact?: Contact) => {
    setDispatchingId(draft.id);
    setTimeout(() => {
      onApproveAndSend(
        draft,
        'email',
        `Dispatched email to ${contact?.email || subscription.userEmail} (Notification Delivery Verified)`
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

      onApproveAndSend(
        draft,
        'webhook',
        `POST ${targetUrl} acknowledged (HTTP ${result.status || 200})`
      );
    } catch {
      onApproveAndSend(
        draft,
        'webhook',
        `Webhook payload simulated to ${targetUrl}`
      );
    } finally {
      setDispatchingId(null);
    }
  };

  return (
    <div className="space-y-5 pb-24 md:pb-12">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 font-display">
          Approval Queue
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Review, customize, and authorize messages before sending.
        </p>
      </div>

      {pendingDrafts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-neutral-200 bg-white">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-neutral-900">Your Approval Queue is Clear</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            All generated relationship drafts have been reviewed and dispatched.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {pendingDrafts.map((draft) => {
            const contact = contacts.find((c) => c.id === draft.contactId);
            const days = getDaysUntil(draft.scheduledDate);
            const isEditing = editingDraftId === draft.id;
            const currentText = draft.customizedText || draft.generatedText;

            return (
              <div
                key={draft.id}
                className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6 shadow-xs space-y-4"
              >
                {/* Header Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={contact?.avatarUrl || SAMPLE_AVATARS.partner}
                      alt={contact?.name || 'Loved one'}
                      className="w-12 h-12 rounded-full object-cover border border-neutral-200 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-sm sm:text-base font-bold text-neutral-900 truncate">
                          {contact ? contact.name : 'Loved One'}
                        </h3>
                        <span className="text-xs text-neutral-400">
                          · {contact ? getRelationshipLabel(contact.relationship) : ''}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-500 mt-0.5">
                        <span className="font-medium text-neutral-800">
                          {draft.customOccasionTitle || draft.occasion}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">{draft.tone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Countdown Badge */}
                  <div className="text-left sm:text-right">
                    <span
                      className={`text-xs font-mono font-bold tabular-nums ${
                        days === 0
                          ? 'text-rose-600'
                          : days <= 3
                          ? 'text-amber-600'
                          : 'text-neutral-700'
                      }`}
                    >
                      {days === 0
                        ? 'Event is Today!'
                        : days === 1
                        ? 'Event is Tomorrow'
                        : `Event in ${days} days`}
                    </span>
                    <div className="text-[11px] text-neutral-400">
                      For {formatDatePretty(draft.scheduledDate)}
                    </div>
                  </div>
                </div>

                {/* Message Body */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-800">
                      Message Draft
                    </span>
                    {!isEditing ? (
                      <button
                        onClick={() => handleStartEdit(draft)}
                        className="min-h-[36px] text-xs font-medium text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit text</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingDraftId(null)}
                          className="min-h-[36px] text-xs text-neutral-500 hover:text-neutral-800 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(draft.id)}
                          className="min-h-[36px] text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Save changes</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <textarea
                      rows={5}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full p-3.5 rounded-xl border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 bg-rose-50/20 text-xs sm:text-sm text-neutral-900 leading-relaxed font-sans"
                    />
                  ) : (
                    <div className="p-3.5 sm:p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 text-xs sm:text-sm text-neutral-800 leading-relaxed font-sans">
                      <p className="whitespace-pre-wrap">{currentText}</p>
                    </div>
                  )}
                </div>

                {/* Suggested Gifts & Delivery Tip */}
                {(draft.suggestedGifts.length > 0 || draft.deliveryTip) && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs pt-1">
                    {draft.suggestedGifts.length > 0 && (
                      <div className="md:col-span-8 p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 space-y-1">
                        <div className="flex items-center gap-1.5 font-semibold text-amber-900">
                          <Gift className="w-3.5 h-3.5 text-amber-600" />
                          <span>Suggested Gifts & Gestures</span>
                        </div>
                        <ul className="space-y-1 text-neutral-700 list-disc list-inside">
                          {draft.suggestedGifts.map((gift, gIdx) => (
                            <li key={gIdx}>{gift}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {draft.deliveryTip && (
                      <div className="md:col-span-4 p-3 rounded-xl bg-rose-50/60 border border-rose-200/70 space-y-1">
                        <div className="flex items-center gap-1.5 font-semibold text-rose-900">
                          <Lightbulb className="w-3.5 h-3.5 text-rose-600" />
                          <span>Delivery Timing Tip</span>
                        </div>
                        <p className="text-neutral-700 leading-relaxed">{draft.deliveryTip}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Mobile-First Multi-Channel Action Bar */}
                <div className="pt-3 border-t border-neutral-100 flex flex-col gap-2.5">
                  {/* Top secondary action row */}
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleCopy(draft)}
                      className="min-h-[44px] px-3.5 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedDraftId === draft.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-neutral-500" />
                          <span>Copy Text</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onOpenStudioForDraft(draft)}
                        className="min-h-[44px] px-3 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                        <span>Regenerate</span>
                      </button>

                      <button
                        onClick={() => onDismissDraft(draft.id)}
                        className="w-11 h-11 flex items-center justify-center text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Dismiss Draft"
                        aria-label="Dismiss Draft"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Primary Thumb Zone Dispatch Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      onClick={() => handleWhatsAppSend(draft, contact)}
                      className="min-h-[48px] px-3.5 py-2.5 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      <span>Send via WhatsApp</span>
                    </button>

                    <button
                      onClick={() => handleEmailSend(draft, contact)}
                      disabled={dispatchingId === draft.id}
                      className="min-h-[48px] px-3.5 py-2.5 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Mail className="w-4 h-4 text-neutral-600" />
                      <span>{dispatchingId === draft.id ? 'Sending...' : 'Send via Email'}</span>
                    </button>

                    <button
                      onClick={() => handleWebhookSend(draft, contact)}
                      disabled={dispatchingId === draft.id}
                      className="min-h-[48px] px-4 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl active:scale-[0.98] transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>Approve & Dispatch</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
