import React from 'react';
import { Contact, Reminder, MessageDraft, UserSubscription, ActiveTab } from '../types';
import { getDaysUntil, formatDatePretty, getLoveLanguageLabel, getRelationshipLabel } from '../services/scheduler';
import { SAMPLE_AVATARS } from '../services/storage';
import {
  Calendar,
  Sparkles,
  Heart,
  Plus,
  ArrowRight,
  Clock,
  Send,
  AlertCircle,
  CheckCircle2,
  Gift,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

interface DashboardProps {
  contacts: Contact[];
  reminders: Reminder[];
  drafts: MessageDraft[];
  subscription: UserSubscription;
  setActiveTab: (tab: ActiveTab) => void;
  onSelectContactForDraft: (contact: Contact, occasion?: string) => void;
  onOpenNewContactModal: () => void;
  onOpenNewReminderModal: () => void;
  onOpenUpgradeModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  contacts,
  reminders,
  drafts,
  subscription,
  setActiveTab,
  onSelectContactForDraft,
  onOpenNewContactModal,
  onOpenNewReminderModal,
  onOpenUpgradeModal,
}) => {
  // Compute upcoming reminders (next 14 days)
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

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* Editorial Hero Banner — Mobile-First Responsive */}
      <div className="relative rounded-2xl sm:rounded-3xl border border-neutral-200 bg-white overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Top visual on mobile, side on desktop */}
          <div className="lg:order-2 lg:col-span-5 relative h-44 sm:h-56 lg:h-auto min-h-[160px] bg-neutral-100">
            <img
              src={SAMPLE_AVATARS.hero}
              alt="Thoughtful handwritten love letters and flowers"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 text-white p-2.5 rounded-xl bg-black/40 backdrop-blur-md text-xs">
              <p className="font-medium italic leading-snug">
                “To be remembered and deeply known is one of the greatest gifts humans can give.”
              </p>
            </div>
          </div>

          <div className="lg:order-1 lg:col-span-7 p-5 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 mb-1.5">
                <Heart className="w-3.5 h-3.5 fill-rose-600 shrink-0" />
                <span>IsabiLove Relationship SaaS</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-neutral-900 font-display">
                Hello, {subscription.userName.split(' ')[0]}
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Personalized reminders and Gemini-crafted messages to celebrate your partner, family, and closest friends with zero stress.
              </p>
            </div>

            {/* Quick Action Touch Bar (Natural Thumb Zone) */}
            <div className="mt-5 pt-4 border-t border-neutral-100 grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5">
              <button
                onClick={onOpenNewContactModal}
                className="min-h-[44px] px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 active:scale-[0.98] transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Loved One</span>
              </button>
              <button
                onClick={onOpenNewReminderModal}
                className="min-h-[44px] px-3.5 py-2 text-xs font-semibold text-neutral-800 bg-neutral-100 rounded-xl hover:bg-neutral-200 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-neutral-600" />
                <span>Schedule</span>
              </button>
              <button
                onClick={() => setActiveTab('studio')}
                className="col-span-2 sm:col-span-1 min-h-[44px] px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-rose-600" />
                <span>Craft AI Message</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4-KPI Metric Grid (Touch & Tabular Formatted) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-xl sm:rounded-2xl border border-neutral-200 bg-white">
          <div className="text-[11px] text-neutral-500 font-medium">Upcoming (14d)</div>
          <div className="mt-1.5 text-2xl font-bold text-neutral-900 font-mono tabular-nums">
            {upcomingReminders.length}
          </div>
          <div className="mt-0.5 text-[11px] text-neutral-400">Next 2 weeks</div>
        </div>

        {/* Metric 2 */}
        <div
          onClick={() => setActiveTab('queue')}
          className="p-4 rounded-xl sm:rounded-2xl border border-neutral-200 bg-white active:bg-neutral-50 hover:border-neutral-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-neutral-500 font-medium">Approval Queue</span>
            {pendingDrafts.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-600" />
            )}
          </div>
          <div className="mt-1.5 text-2xl font-bold text-rose-600 font-mono tabular-nums">
            {pendingDrafts.length}
          </div>
          <div className="mt-0.5 text-[11px] text-rose-600 font-medium flex items-center gap-0.5">
            <span>Review drafts</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-xl sm:rounded-2xl border border-neutral-200 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-neutral-500 font-medium">Loved Ones</span>
            <span className="text-[10px] font-mono text-neutral-400">
              {contacts.length}/{subscription.contactsLimit}
            </span>
          </div>
          <div className="mt-1.5 text-2xl font-bold text-neutral-900 font-mono tabular-nums">
            {contacts.length}
          </div>
          <div className="mt-0.5 text-[11px] text-neutral-500">
            {subscription.tier === 'free' ? (
              <button
                onClick={onOpenUpgradeModal}
                className="text-neutral-700 underline cursor-pointer"
              >
                Free: 3 contacts
              </button>
            ) : (
              'Unlimited Pro'
            )}
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-xl sm:rounded-2xl border border-neutral-200 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-neutral-500 font-medium">AI Drafts</span>
            <span className="text-[10px] font-mono text-neutral-400">
              {subscription.aiDraftsUsed}/{subscription.aiDraftsLimit}
            </span>
          </div>
          <div className="mt-1.5 text-2xl font-bold text-neutral-900 font-mono tabular-nums">
            {subscription.aiDraftsUsed}
          </div>
          <div className="mt-0.5 text-[11px] text-neutral-400 font-mono tabular-nums">
            {subscription.aiDraftsLimit - subscription.aiDraftsUsed} remaining
          </div>
        </div>
      </div>

      {/* Main Grid: Urgent Attention & Pending Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Upcoming Dates (7 cols) */}
        <div className="lg:col-span-7 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 font-display">
                Upcoming Milestones
              </h2>
              <p className="text-xs text-neutral-500">Approaching in the next 14 days</p>
            </div>
            <button
              onClick={() => setActiveTab('reminders')}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer min-h-[44px] items-center"
            >
              <span>See all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {upcomingReminders.length === 0 ? (
            <div className="p-8 rounded-2xl border border-neutral-200 bg-white text-center">
              <Clock className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-neutral-900">No dates in the next 14 days</h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                Schedule a birthday, an anniversary, or a monthly check-in to stay in touch.
              </p>
              <button
                onClick={onOpenNewReminderModal}
                className="mt-4 min-h-[44px] px-4 py-2 text-xs font-semibold bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Schedule First Reminder
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingReminders.map(({ reminder, contact, days }) => {
                if (!contact) return null;
                const draft = drafts.find(
                  (d) => d.reminderId === reminder.id && d.status === 'pending_approval'
                );

                return (
                  <div
                    key={reminder.id}
                    className="p-4 rounded-xl sm:rounded-2xl border border-neutral-200 bg-white hover:border-neutral-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={contact.avatarUrl || SAMPLE_AVATARS.partner}
                        alt={contact.name}
                        className="w-12 h-12 rounded-full object-cover shrink-0 border border-neutral-200"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-sm font-bold text-neutral-900 truncate">
                            {contact.name}
                          </h4>
                          <span className="text-xs text-neutral-400">
                            · {getRelationshipLabel(contact.relationship)}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-neutral-700 mt-0.5 truncate">
                          {reminder.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                          <span className="font-mono tabular-nums">{formatDatePretty(reminder.eventDate)}</span>
                          <span aria-hidden="true">·</span>
                          <span className="truncate">{getLoveLanguageLabel(contact.loveLanguage)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
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
                          {days === 0 ? 'Today!' : days === 1 ? 'Tomorrow' : `in ${days} days`}
                        </span>
                      </div>

                      {draft ? (
                        <button
                          onClick={() => setActiveTab('queue')}
                          className="min-h-[44px] px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
                        >
                          Review Draft
                        </button>
                      ) : (
                        <button
                          onClick={() => onSelectContactForDraft(contact, reminder.occasionType)}
                          className="min-h-[44px] px-3.5 py-2 text-xs font-medium text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-xl active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                          <span>Generate Note</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Pending Approvals & Love Language Insights (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* In-App Approval Queue Widget */}
          <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-neutral-200 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-bold text-neutral-900 font-display">In-App Approval Queue</h3>
              </div>
              <span className="text-xs font-mono font-semibold text-neutral-500 tabular-nums">
                {pendingDrafts.length} pending
              </span>
            </div>

            {pendingDrafts.length === 0 ? (
              <div className="py-6 text-center text-xs text-neutral-500">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                <span>All scheduled messages have been reviewed!</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {pendingDrafts.slice(0, 2).map((draft) => {
                  const contact = contacts.find((c) => c.id === draft.contactId);
                  return (
                    <div
                      key={draft.id}
                      className="p-3.5 rounded-xl border border-neutral-100 bg-neutral-50/80 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-neutral-900">
                          {contact ? contact.name : 'Recipient'}
                        </span>
                        <span className="text-neutral-500 font-mono tabular-nums">
                          {formatDatePretty(draft.scheduledDate)}
                        </span>
                      </div>
                      <p className="text-neutral-600 italic line-clamp-2 leading-relaxed">
                        "{draft.customizedText || draft.generatedText}"
                      </p>
                      <div className="pt-1 flex items-center justify-between">
                        <span className="text-neutral-400 capitalize">Tone: {draft.tone}</span>
                        <button
                          onClick={() => setActiveTab('queue')}
                          className="font-semibold text-rose-600 hover:text-rose-700 cursor-pointer min-h-[36px] flex items-center"
                        >
                          Approve in Queue →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              onClick={() => setActiveTab('queue')}
              className="w-full min-h-[44px] py-2.5 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 active:scale-[0.98] rounded-xl transition-all text-center cursor-pointer flex items-center justify-center"
            >
              Open Full Approval Queue ({pendingDrafts.length})
            </button>
          </div>

          {/* Love Language Insights */}
          <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-neutral-200 bg-white space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900">
              <Gift className="w-4 h-4 text-amber-600" />
              <span>Love Language Playbook</span>
            </div>
            <ul className="text-xs text-neutral-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold shrink-0">·</span>
                <span>
                  <strong className="text-neutral-900">Words of Affirmation:</strong> Slip a handwritten note into their pocket or bag.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold shrink-0">·</span>
                <span>
                  <strong className="text-neutral-900">Quality Time:</strong> Schedule an unplugged evening with phones away.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold shrink-0">·</span>
                <span>
                  <strong className="text-neutral-900">Acts of Service:</strong> Quietly take care of their biggest daily hassle before they ask.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
