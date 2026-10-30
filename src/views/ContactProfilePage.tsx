"use client";

import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getLoveLanguageLabel, getRelationshipLabel, formatDatePretty, getDaysUntil } from '../services/scheduler';
import {
  ArrowLeft,
  Heart,
  Calendar,
  Sparkles,
  Phone,
  Mail,
  Gift,
  Clock,
  Trash2,
  BookOpen,
} from 'lucide-react';

export const ContactProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { contacts, reminders, drafts, deleteContact } = useApp();

  const contact = contacts.find((c) => c.id === id);

  if (!contact) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#2a241c] font-display">Record Not Found</h2>
        <p className="text-xs text-[#6f665c]">This loved one record does not exist or was removed.</p>
        <Link
          to="/contacts"
          className="inline-flex min-h-[44px] px-4 py-2 text-xs font-semibold text-[#faf6ef] bg-[#2a241c] rounded-xl items-center"
        >
          Return to Loved Ones
        </Link>
      </div>
    );
  }

  const contactReminders = reminders.filter((r) => r.contactId === contact.id);
  const contactDrafts = drafts.filter((d) => d.contactId === contact.id);
  const pendingDrafts = contactDrafts.filter((d) => d.status === 'pending_approval');
  const sentMessages = contactDrafts.filter((d) => d.status === 'sent');

  const handleDelete = () => {
    if (window.confirm(`Are you certain you wish to remove ${contact.name} from your loved ones?`)) {
      deleteContact(contact.id);
      navigate('/contacts');
    }
  };

  return (
    <div className="space-y-6 pb-6 md:pb-4 max-w-4xl mx-auto">
      {/* Back button & profile action header */}
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/contacts"
          className="min-h-[44px] text-xs font-semibold text-[#6f665c] hover:text-[#2a241c] flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4 text-[#8c6239]" />
          <span>Loved Ones</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to={`/studio?contactId=${contact.id}`}
            className="min-h-[44px] px-4 py-2 text-xs font-semibold text-[#faf6ef] bg-[#2a241c] hover:bg-[#2a241c]/90 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#8c6239]" />
            <span>Compose Words</span>
          </Link>
          <button
            onClick={handleDelete}
            className="w-11 h-11 flex items-center justify-center text-[#6f665c] hover:text-[#8c6239] hover:bg-[#f3ece1] rounded-xl transition-colors cursor-pointer"
            title="Remove Profile"
            aria-label="Remove Profile"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="p-6 sm:p-7 rounded-2xl border border-[#8c6239]/20 bg-[#faf6ef] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-[#8c6239] text-[#faf6ef] flex items-center justify-center font-bold text-2xl border border-[#8c6239]/30 shadow-xs shrink-0 overflow-hidden">
            {contact.avatarUrl ? (
              <img
                src={contact.avatarUrl}
                alt={contact.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="font-display">{contact.name[0]!.toUpperCase()}</span>
            )}
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-[#2a241c] font-display">
                {contact.name}
              </h1>
              <span className="text-xs text-[#6f665c]">
                · {getRelationshipLabel(contact.relationship)}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-[#6f665c] flex-wrap pt-0.5">
              <div className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-[#8c6239]" />
                <span>{getLoveLanguageLabel(contact.loveLanguage)}</span>
              </div>
              <span aria-hidden="true" className="text-[#8c6239]/30">·</span>
              <span className="capitalize text-[#2a241c] font-medium">{contact.preferredTone} Tone</span>
            </div>

            {(contact.phone || contact.email) && (
              <div className="flex items-center gap-4 text-xs text-[#6f665c] pt-1 flex-wrap">
                {contact.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#8c6239]" />
                    <span>{contact.phone}</span>
                  </span>
                )}
                {contact.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-[#8c6239]" />
                    <span>{contact.email}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Biblical Epigraph */}
        <div className="p-3.5 rounded-xl bg-[#f3ece1]/80 border border-[#8c6239]/20 text-xs text-[#6f665c] flex items-start gap-2.5">
          <BookOpen className="w-4 h-4 text-[#8c6239] shrink-0 mt-0.5" />
          <div>
            <p className="italic text-[#2a241c] leading-relaxed">
              “Above all things, have intense love for one another, because love covers a multitude of sins.”
            </p>
            <p className="mt-0.5 text-[11px] text-[#8c6239] font-mono">1 Peter 4:8 (New World Translation)</p>
          </div>
        </div>

        {/* Detailed Attributes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#8c6239]/15 text-xs">
          <div className="space-y-3">
            <h3 className="font-bold text-[#2a241c] uppercase tracking-wider text-[11px]">
              Delights & Preferences
            </h3>
            <div className="space-y-2 text-[#6f665c]">
              <div>
                <span className="font-medium text-[#2a241c]">Favorite Flowers:</span>{' '}
                {contact.preferences.favoriteFlowers || 'Not specified'}
              </div>
              <div>
                <span className="font-medium text-[#2a241c]">Favorite Treats:</span>{' '}
                {contact.preferences.favoriteTreats || 'Not specified'}
              </div>
              <div>
                <span className="font-medium text-[#2a241c]">Preferred Colors:</span>{' '}
                {contact.preferences.favoriteColors || 'Not specified'}
              </div>
              <div>
                <span className="font-medium text-[#2a241c]">Passions & Hobbies:</span>{' '}
                {contact.preferences.hobbies || 'Not specified'}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-[#2a241c] uppercase tracking-wider text-[11px]">
              Sacred Memories & Context
            </h3>
            {contact.memories && contact.memories.length > 0 ? (
              <ul className="space-y-1.5 list-disc list-inside text-[#6f665c]">
                {contact.memories.map((m, idx) => (
                  <li key={idx} className="leading-relaxed">
                    <span className="text-[#2a241c]">{m}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[#6f665c] italic">No shared memories recorded yet.</p>
            )}

            {contact.importantNotes && (
              <div className="mt-3 p-3 rounded-xl bg-[#f3ece1]/60 border border-[#8c6239]/15">
                <p className="text-[11px] font-semibold text-[#8c6239] uppercase">Gentle Note</p>
                <p className="text-xs text-[#2a241c] mt-0.5 leading-relaxed">{contact.importantNotes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Appointed Schedules Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#2a241c] font-display">
            Scheduled Dates
          </h2>
          <Link
            to={`/reminders?contactId=${contact.id}&action=new`}
            className="text-xs font-semibold text-[#8c6239] hover:underline flex items-center gap-1 min-h-[44px]"
          >
            <span>+ Add Date</span>
          </Link>
        </div>

        {contactReminders.length === 0 ? (
          <div className="p-6 rounded-2xl border border-[#8c6239]/20 bg-[#faf6ef] text-center text-xs text-[#6f665c]">
            <Calendar className="w-6 h-6 mx-auto mb-1.5 text-[#8c6239]" />
            <p>No scheduled dates recorded for {contact.name}.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {contactReminders.map((r) => {
              const days = getDaysUntil(r.eventDate);
              return (
                <div
                  key={r.id}
                  className="p-4 rounded-xl border border-[#8c6239]/20 bg-[#faf6ef] flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <p className="font-bold text-[#2a241c]">{r.title}</p>
                    <p className="text-[#6f665c] mt-0.5 font-mono tabular-nums">
                      {formatDatePretty(r.eventDate)} ({days >= 0 ? `in ${days} days` : 'past'})
                    </p>
                  </div>
                  <Link
                    to={`/studio?contactId=${contact.id}&occasion=${r.occasionType}`}
                    className="min-h-[44px] px-3.5 py-2 text-xs font-semibold text-[#faf6ef] bg-[#8c6239] hover:bg-[#8c6239]/90 rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Compose</span>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Words Prepared in Queue or Sent */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-[#2a241c] font-display">
          Message History
        </h2>

        {sentMessages.length === 0 && pendingDrafts.length === 0 ? (
          <div className="p-6 rounded-2xl border border-[#8c6239]/20 bg-[#faf6ef] text-center text-xs text-[#6f665c]">
            <Clock className="w-6 h-6 mx-auto mb-1.5 text-[#8c6239]" />
            <p>No message history exists for {contact.name} yet.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {contactDrafts.map((draft) => (
              <div
                key={draft.id}
                className="p-4 rounded-xl border border-[#8c6239]/20 bg-[#faf6ef] space-y-2 text-xs"
              >
                <div className="flex items-center justify-between text-[#6f665c]">
                  <span className="font-bold text-[#2a241c] uppercase tracking-wider text-[11px]">
                    {draft.customOccasionTitle || draft.occasion}
                  </span>
                  <span className="font-mono tabular-nums">{draft.scheduledDate}</span>
                </div>
                <p className="text-[#2a241c] italic leading-relaxed">
                  “{draft.customizedText || draft.generatedText}”
                </p>
                <div className="pt-1 flex items-center justify-between text-[11px] text-[#6f665c]">
                  <span className="capitalize">Status: {draft.status.replace('_', ' ')}</span>
                  <span className="capitalize">Tone: {draft.tone}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

