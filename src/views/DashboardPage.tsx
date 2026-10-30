"use client";

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getDaysUntil, formatDatePretty, getLoveLanguageLabel, getRelationshipLabel } from '../services/scheduler';
import { SAMPLE_AVATARS } from '../services/storage';
import {
  Calendar,
  Sparkles,
  Heart,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  BookOpen,
  ChevronRight,
  Scroll,
  Users,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { contacts, reminders, drafts, subscription } = useApp();
  const navigate = useNavigate();

  const upcomingReminders = reminders
    .filter((r) => r.status === 'active')
    .map((r) => {
      const contact = contacts.find((c) => c.id === r.contactId);
      const days = getDaysUntil(r.eventDate);
      return { reminder: r, contact, days };
    })
    .filter((item) => item.days >= 0 && item.days <= 14)
    .sort((a, b) => a.days - b.days);

  const pendingDrafts = drafts.filter((d) => d.status === 'pending_approval');

  // Track image load failures for resilient parchment fallbacks
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const handleImageError = (id: string) => {
    setBrokenImages((prev) => ({ ...prev, [id]: true }));
  };

  // Religion-aware inspiration configuration
  const userReligion = subscription.religion || 'christianity';
  const inspirationConfig = {
    christianity: {
      heroQuote: '“Like apples of gold in silver carvings is a word spoken at the right time.”',
      heroCitation: '— Proverbs 25:11 (New World Translation)',
      sectionTitle: 'Scriptures on Kindness',
      quotes: [
        {
          text: '“Love is patient and kind. Love is not jealous. It does not brag, does not get puffed up,”',
          cite: '1 Corinthians 13:4 (NWT)',
        },
        {
          text: '“Therefore, keep encouraging one another and building one another up, just as you are in fact doing.”',
          cite: '1 Thessalonians 5:11 (NWT)',
        },
        {
          text: '“As iron sharpens iron, so one man sharpens his friend.”',
          cite: 'Proverbs 27:17 (NWT)',
        },
      ],
    },
    muslim: {
      heroQuote: '“And of His signs is that He created for you mates from among yourselves, that you may dwell in tranquility with them; and He has put love and mercy between your hearts.”',
      heroCitation: '— Surah Ar-Rum 30:21',
      sectionTitle: 'Wisdom on Kindness & Mercy',
      quotes: [
        {
          text: '“The best among you are those who have the best character and are kindest to their families.”',
          cite: 'Sunan al-Tirmidhi',
        },
        {
          text: '“A kind and gentle word is a charity.”',
          cite: 'Sahih al-Bukhari & Muslim',
        },
        {
          text: '“None of you truly believes until he loves for his brother what he loves for himself.”',
          cite: 'Sahih al-Bukhari',
        },
      ],
    },
    none: {
      heroQuote: "“I've learned that people will forget what you said, people will forget what you did, but people will never forget how you made them feel.”",
      heroCitation: '— Maya Angelou',
      sectionTitle: 'Reflections on Friendship & Devotion',
      quotes: [
        {
          text: '“What is a friend? A single soul dwelling in two bodies.”',
          cite: 'Aristotle',
        },
        {
          text: '“To love and be loved is to feel the sun from both sides.”',
          cite: 'David Viscott',
        },
        {
          text: '“It is the time you have spent for your rose that makes your rose so important.”',
          cite: 'Antoine de Saint-Exupéry',
        },
      ],
    },
  }[userReligion];

  return (
    <div className="space-y-6 pb-6 md:pb-4 max-w-7xl mx-auto">
      {/* Calm Editorial Hero Card */}
      <div className="relative rounded-2xl border border-[#8c6239]/20 bg-[#faf6ef] overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Right Image on Desktop / Top Image on Mobile */}
          <div className="lg:order-2 lg:col-span-5 relative h-48 sm:h-56 lg:h-auto min-h-[190px] bg-[#2a241c] overflow-hidden">
            <img
              src={SAMPLE_AVATARS.hero}
              alt="Handwritten parchment letter and quiet remembrance"
              className="w-full h-full object-cover opacity-85"
              referrerPolicy="no-referrer"
              onError={() => handleImageError('hero')}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2a241c]/90 via-[#2a241c]/40 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 text-[#faf6ef] p-3 rounded-xl bg-[#2a241c]/75 backdrop-blur-sm border border-[#8c6239]/30 text-xs">
              <p className="font-display italic text-[#faf6ef] leading-relaxed">
                {inspirationConfig.heroQuote}
              </p>
              <p className="mt-1 text-[11px] text-[#8c6239] font-medium tracking-wide">
                {inspirationConfig.heroCitation}
              </p>
            </div>
          </div>

          {/* Left Editorial Content */}
          <div className="lg:order-1 lg:col-span-7 p-5 sm:p-8 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#8c6239]">
                <div className="w-5 h-5 rounded bg-[#f3ece1] border border-[#8c6239]/25 flex items-center justify-center">
                  <Scroll className="w-3 h-3 text-[#8c6239]" />
                </div>
                <span className="tracking-wide uppercase text-[11px]">The Haven of Remembrance</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-[#2a241c] font-display">
                Welcome in peace, {subscription.userName.split(' ')[0]}
              </h1>

              <p className="text-xs sm:text-sm text-[#6f665c] leading-relaxed max-w-xl">
                Remember appointed days, honor personal preferences, and send timely words of grace.
              </p>
            </div>

            {/* Quick Action Touch Strip (Thumb-Zone Friendly) */}
            <div className="mt-5 pt-4 border-t border-[#8c6239]/15 grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
              <Link
                to="/contacts?action=new"
                className="min-h-[44px] px-3.5 py-2.5 text-xs font-semibold text-[#faf6ef] bg-[#2a241c] hover:bg-[#2a241c]/90 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#8c6239]" />
                <span>Add Loved One</span>
              </Link>
              <Link
                to="/reminders?action=new"
                className="min-h-[44px] px-3.5 py-2.5 text-xs font-semibold text-[#2a241c] bg-[#f3ece1] hover:bg-[#f3ece1]/80 border border-[#8c6239]/20 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-[#8c6239]" />
                <span>Schedule Date</span>
              </Link>
              <Link
                to="/studio"
                className="col-span-2 sm:col-span-1 min-h-[44px] px-3.5 py-2.5 text-xs font-semibold text-[#8c6239] bg-[#faf6ef] border border-[#8c6239]/30 rounded-xl hover:bg-[#f3ece1] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Compose Words</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 4-KPI Metric Ribbon ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Link
          to="/reminders"
          className="p-4 sm:p-5 rounded-2xl border border-[#8c6239]/20 bg-[#faf6ef] hover:border-[#8c6239]/40 transition-colors shadow-xs flex flex-col justify-between group min-h-[110px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#6f665c] font-medium">Upcoming (14d)</span>
            <Calendar className="w-4 h-4 text-[#8c6239]" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-normal text-[#2a241c] font-display tabular-nums">
            {upcomingReminders.length}
          </div>
          <div className="mt-1 text-[11px] text-[#6f665c]">
            {upcomingReminders.length === 1 ? '1 date in 14 days' : `${upcomingReminders.length} dates in 14 days`}
          </div>
        </Link>

        <Link
          to="/queue"
          className="p-4 sm:p-5 rounded-2xl border border-[#8c6239]/20 bg-[#faf6ef] hover:border-[#8c6239]/40 transition-colors shadow-xs flex flex-col justify-between group min-h-[110px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#6f665c] font-medium">Awaiting Review</span>
            {pendingDrafts.length > 0 ? (
              <span className="w-2.5 h-2.5 rounded-full bg-[#8c6239]" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#8c6239]" />
            )}
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-normal text-[#8c6239] font-display tabular-nums">
            {pendingDrafts.length}
          </div>
          <div className="mt-1 text-[11px] text-[#8c6239] font-medium flex items-center gap-1">
            <span>Review drafts</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </Link>

        <Link
          to="/contacts"
          className="p-4 sm:p-5 rounded-2xl border border-[#8c6239]/20 bg-[#faf6ef] hover:border-[#8c6239]/40 transition-colors shadow-xs flex flex-col justify-between group min-h-[110px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#6f665c] font-medium">Loved Ones</span>
            <Users className="w-4 h-4 text-[#8c6239]" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-normal text-[#2a241c] font-display tabular-nums">
            {contacts.length}
          </div>
          <div className="mt-1 text-[11px] text-[#6f665c]">
            Cherished family & friends
          </div>
        </Link>

        <Link
          to="/history"
          className="p-4 sm:p-5 rounded-2xl border border-[#8c6239]/20 bg-[#faf6ef] hover:border-[#8c6239]/40 transition-colors shadow-xs flex flex-col justify-between group min-h-[110px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#6f665c] font-medium">Composed Epistles</span>
            <Sparkles className="w-4 h-4 text-[#8c6239]" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-normal text-[#2a241c] font-display tabular-nums">
            {drafts.length}
          </div>
          <div className="mt-1 text-[11px] text-[#6f665c]">
            Free & unlimited AI compositions
          </div>
        </Link>
      </div>

      {/* ================= Main Grid: Milestones & Approval Queue ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Upcoming Milestones (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#2a241c] font-display">
                Approaching Appointments
              </h2>
              <p className="text-xs text-[#6f665c]">Moments within the next 14 days</p>
            </div>
            <Link
              to="/reminders"
              className="text-xs font-semibold text-[#8c6239] hover:underline flex items-center gap-1 min-h-[44px]"
            >
              <span>Full schedule</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {upcomingReminders.length === 0 ? (
            <div className="p-8 sm:p-10 rounded-2xl border border-[#8c6239]/20 bg-[#faf6ef] text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#f3ece1] border border-[#8c6239]/20 flex items-center justify-center mx-auto text-[#8c6239]">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[#2a241c] font-display">Quiet in the next 14 days</h3>
              <p className="text-xs text-[#6f665c] max-w-sm mx-auto leading-relaxed">
                Record an anniversary, birthday, or relationship check-in so that no appointed time slips away unremembered.
              </p>
              <Link
                to="/reminders?action=new"
                className="inline-flex min-h-[44px] px-4 py-2.5 text-xs font-semibold bg-[#2a241c] text-[#faf6ef] rounded-xl hover:bg-[#2a241c]/90 transition-colors items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-[#8c6239]" />
                <span>Schedule First Date</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingReminders.map(({ reminder, contact, days }) => {
                if (!contact) return null;
                const draft = drafts.find(
                  (d) => d.reminderId === reminder.id && d.status === 'pending_approval'
                );

                const isImageBroken = brokenImages[contact.id];

                return (
                  <div
                    key={reminder.id}
                    className="p-4 sm:p-5 rounded-2xl border border-[#8c6239]/20 bg-[#faf6ef] hover:border-[#8c6239]/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                  >
                    <Link
                      to={`/contacts/${contact.id}`}
                      className="flex items-center gap-3.5 group min-w-0 flex-1"
                    >
                      {/* Avatar with fallback */}
                      <div className="w-12 h-12 rounded-xl bg-[#8c6239] text-[#faf6ef] flex items-center justify-center font-bold text-sm shrink-0 border border-[#8c6239]/30 overflow-hidden shadow-xs">
                        {!isImageBroken && contact.avatarUrl ? (
                          <img
                            src={contact.avatarUrl}
                            alt={contact.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={() => handleImageError(contact.id)}
                          />
                        ) : (
                          <span className="font-display">{contact.name[0]!.toUpperCase()}</span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-[#2a241c] group-hover:text-[#8c6239] transition-colors truncate">
                            {contact.name}
                          </h4>
                          <span className="text-xs text-[#6f665c]">
                            · {getRelationshipLabel(contact.relationship)}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-[#2a241c] mt-0.5 truncate">
                          {reminder.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-[#6f665c] mt-0.5">
                          <span className="font-mono tabular-nums">{formatDatePretty(reminder.eventDate)}</span>
                          <span aria-hidden="true" className="text-[#8c6239]/40">·</span>
                          <span className="truncate">{getLoveLanguageLabel(contact.loveLanguage)}</span>
                        </div>
                      </div>
                    </Link>

                    {/* Milestone Countdown & Action Button */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#8c6239]/15">
                      <div className="text-left sm:text-right">
                        <span
                          className={`text-xs font-mono font-bold tabular-nums ${
                            days === 0
                              ? 'text-[#8c6239]'
                              : days <= 3
                              ? 'text-[#8c6239]'
                              : 'text-[#6f665c]'
                          }`}
                        >
                          {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `in ${days} days`}
                        </span>
                      </div>

                      {draft ? (
                        <Link
                          to="/queue"
                          className="min-h-[44px] px-3.5 py-2 text-xs font-semibold text-[#faf6ef] bg-[#8c6239] hover:bg-[#8c6239]/90 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Review Draft</span>
                        </Link>
                      ) : (
                        <button
                          onClick={() => navigate(`/studio?contactId=${contact.id}&occasion=${reminder.occasionType}`)}
                          className="min-h-[44px] px-3.5 py-2 text-xs font-semibold text-[#2a241c] bg-[#f3ece1] hover:bg-[#f3ece1]/80 border border-[#8c6239]/25 rounded-xl transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#8c6239]" />
                          <span>Compose Note</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Review Queue & Biblical Relationship Wisdom (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* In-App Approval Queue Card */}
          <div className="p-5 rounded-2xl border border-[#8c6239]/20 bg-[#faf6ef] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#f3ece1] border border-[#8c6239]/20 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-[#8c6239]" />
                </div>
                <h3 className="text-sm font-bold text-[#2a241c] font-display">
                  Awaiting Review
                </h3>
              </div>
              <span className="text-xs font-mono font-semibold text-[#6f665c] tabular-nums">
                {pendingDrafts.length} pending
              </span>
            </div>

            {pendingDrafts.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#6f665c] space-y-1.5">
                <CheckCircle2 className="w-7 h-7 text-[#8c6239] mx-auto" />
                <p className="font-semibold text-[#2a241c]">All words reviewed</p>
                <p className="text-[#6f665c]">No drafts are waiting in your queue.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {pendingDrafts.slice(0, 2).map((draft) => {
                  const contact = contacts.find((c) => c.id === draft.contactId);
                  return (
                    <div
                      key={draft.id}
                      className="p-3.5 rounded-xl border border-[#8c6239]/15 bg-[#f3ece1]/60 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#2a241c]">
                          {contact ? contact.name : 'Recipient'}
                        </span>
                        <span className="text-[#6f665c] font-mono tabular-nums text-[11px]">
                          {formatDatePretty(draft.scheduledDate)}
                        </span>
                      </div>
                      <p className="text-[#2a241c] italic line-clamp-2 leading-relaxed">
                        “{draft.customizedText || draft.generatedText}”
                      </p>
                      <div className="pt-1 flex items-center justify-between">
                        <span className="text-[#6f665c] capitalize text-[11px]">Tone: {draft.tone}</span>
                        <Link
                          to="/queue"
                          className="font-semibold text-[#8c6239] hover:underline flex items-center gap-1 min-h-[36px]"
                        >
                          <span>Review</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <Link
              to="/queue"
              className="w-full min-h-[44px] py-2.5 px-4 text-xs font-semibold text-[#2a241c] bg-[#f3ece1] hover:bg-[#f3ece1]/80 border border-[#8c6239]/20 rounded-xl transition-colors text-center flex items-center justify-center gap-1.5"
            >
              <span>Open Review Queue</span>
              <span className="font-mono tabular-nums">({pendingDrafts.length})</span>
            </Link>
          </div>

          {/* Religion-Tailored Relationship Wisdom Card */}
          <div className="p-5 rounded-2xl border border-[#8c6239]/20 bg-[#faf6ef] shadow-xs space-y-3.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#f3ece1] border border-[#8c6239]/20 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-[#8c6239]" />
              </div>
              <h3 className="text-sm font-bold text-[#2a241c] font-display">
                {inspirationConfig.sectionTitle}
              </h3>
            </div>
            <ul className="text-xs text-[#6f665c] space-y-3">
              {inspirationConfig.quotes.map((q, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="text-[#8c6239] font-bold mt-0.5">·</span>
                  <div>
                    <p className="text-[#2a241c] font-medium leading-snug">
                      {q.text}
                    </p>
                    <p className="text-[11px] text-[#8c6239] font-mono mt-0.5">{q.cite}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

