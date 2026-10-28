import React, { useState } from 'react';
import { Reminder, Contact, OccasionType, CadenceType, DeliveryChannel, UserSubscription } from '../types';
import { getDaysUntil, formatDatePretty, getRelationshipLabel } from '../services/scheduler';
import { SAMPLE_AVATARS } from '../services/storage';
import {
  Plus,
  Calendar,
  Clock,
  Sparkles,
  Edit2,
  Trash2,
  PauseCircle,
  PlayCircle,
  X,
} from 'lucide-react';

interface ReminderManagerProps {
  reminders: Reminder[];
  contacts: Contact[];
  subscription: UserSubscription;
  onSaveReminder: (reminder: Reminder) => void;
  onDeleteReminder: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onSelectForDraft: (contact: Contact, occasion?: string) => void;
  onOpenUpgradeModal: () => void;
  isOpenCreateModal: boolean;
  setIsOpenCreateModal: (open: boolean) => void;
  preselectedContactId?: string;
}

export const ReminderManager: React.FC<ReminderManagerProps> = ({
  reminders,
  contacts,
  subscription,
  onSaveReminder,
  onDeleteReminder,
  onToggleStatus,
  onSelectForDraft,
  onOpenUpgradeModal,
  isOpenCreateModal,
  setIsOpenCreateModal,
  preselectedContactId,
}) => {
  const [filterCadence, setFilterCadence] = useState<string>('all');
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  const filteredReminders = reminders.filter((r) => {
    if (filterCadence === 'all') return true;
    if (filterCadence === 'upcoming') {
      const days = getDaysUntil(r.eventDate);
      return days >= 0 && days <= 30;
    }
    return r.cadence === filterCadence;
  });

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setIsOpenCreateModal(true);
  };

  const handleCreateNew = () => {
    setEditingReminder(null);
    setIsOpenCreateModal(true);
  };

  return (
    <div className="space-y-5 pb-24 md:pb-12">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 font-display">
            Schedules & Reminders
          </h1>
          <p className="text-xs text-neutral-500">
            {reminders.filter((r) => r.status === 'active').length} active cadence schedules
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="min-h-[44px] px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 rounded-xl hover:bg-rose-700 active:scale-[0.98] transition-all shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule</span>
        </button>
      </div>

      {/* Horizontal Cadence Filter Bar (Mobile-first Touch Pills) */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
        {[
          { id: 'all', label: 'All Schedules' },
          { id: 'upcoming', label: 'Next 30 Days' },
          { id: 'annual', label: 'Annual (Birthdays & Anniversaries)' },
          { id: 'monthly', label: 'Monthly (Check-ins)' },
          { id: 'once', label: 'One-off Milestones' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterCadence(tab.id)}
            className={`min-h-[38px] px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              filterCadence === tab.id
                ? 'bg-neutral-900 text-white shadow-xs font-semibold'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reminders List */}
      {filteredReminders.length === 0 ? (
        <div className="p-10 text-center rounded-2xl border border-neutral-200 bg-white">
          <Calendar className="w-10 h-10 text-neutral-300 mx-auto mb-2.5" />
          <h3 className="text-sm font-semibold text-neutral-900">No schedules found</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Schedule a birthday, an anniversary, or a monthly relationship check-in.
          </p>
          <button
            onClick={handleCreateNew}
            className="mt-4 min-h-[44px] px-4 py-2 text-xs font-semibold text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors cursor-pointer"
          >
            Create First Reminder
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReminders.map((reminder) => {
            const contact = contacts.find((c) => c.id === reminder.contactId);
            const days = getDaysUntil(reminder.eventDate);
            const isPaused = reminder.status === 'paused';

            return (
              <div
                key={reminder.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all bg-white flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  isPaused ? 'border-neutral-200 opacity-60' : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={contact?.avatarUrl || SAMPLE_AVATARS.partner}
                    alt={contact?.name || 'Contact'}
                    className="w-12 h-12 rounded-full object-cover shrink-0 border border-neutral-200 mt-0.5"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-sm sm:text-base font-bold text-neutral-900 truncate">
                        {reminder.title}
                      </h3>
                      <span className="text-xs text-neutral-400">
                        · for {contact ? contact.name : 'Loved One'}
                      </span>
                      {isPaused && (
                        <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider bg-neutral-100 px-1.5 py-0.5 rounded">
                          Paused
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 mt-1">
                      <span className="font-mono tabular-nums font-semibold text-neutral-800">
                        {formatDatePretty(reminder.eventDate)}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{reminder.cadence}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        Advance: {reminder.advanceDays.map((d) => (d === 0 ? 'Day-of' : `${d}d`)).join(', ')}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize text-neutral-700">
                        {reminder.channel === 'queue' ? 'Approval Queue' : reminder.channel}
                      </span>
                    </div>

                    {reminder.notes && (
                      <p className="text-xs text-neutral-600 mt-1.5 italic line-clamp-1">
                        Note: {reminder.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Actions & Countdown */}
                <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-neutral-100">
                  <div className="text-left md:text-right">
                    <span
                      className={`text-xs font-mono font-bold tabular-nums ${
                        days === 0
                          ? 'text-rose-600'
                          : days > 0 && days <= 5
                          ? 'text-amber-600'
                          : 'text-neutral-700'
                      }`}
                    >
                      {days === 0
                        ? 'Today!'
                        : days === 1
                        ? 'Tomorrow'
                        : days > 0
                        ? `in ${days} days`
                        : `${Math.abs(days)}d ago`}
                    </span>
                    <div className="text-[10px] text-neutral-400">
                      {reminder.requireApproval ? 'Manual review' : 'Auto-send'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {contact && (
                      <button
                        onClick={() => onSelectForDraft(contact, reminder.occasionType)}
                        className="min-h-[44px] px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                        <span>Craft Note</span>
                      </button>
                    )}

                    <button
                      onClick={() => onToggleStatus(reminder.id)}
                      className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                      title={isPaused ? 'Resume' : 'Pause'}
                      aria-label="Toggle Reminder Status"
                    >
                      {isPaused ? <PlayCircle className="w-5 h-5 text-emerald-600" /> : <PauseCircle className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => handleEdit(reminder)}
                      className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit"
                      aria-label="Edit Reminder"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteReminder(reminder.id)}
                      className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete"
                      aria-label="Delete Reminder"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reminder Bottom Sheet */}
      {isOpenCreateModal && (
        <ReminderFormModal
          reminder={editingReminder}
          contacts={contacts}
          preselectedContactId={preselectedContactId}
          subscription={subscription}
          onClose={() => setIsOpenCreateModal(false)}
          onSave={(r) => {
            onSaveReminder(r);
            setIsOpenCreateModal(false);
          }}
          onOpenUpgradeModal={onOpenUpgradeModal}
        />
      )}
    </div>
  );
};

// ======================= Form Bottom Sheet =======================
interface ReminderFormModalProps {
  reminder: Reminder | null;
  contacts: Contact[];
  preselectedContactId?: string;
  subscription: UserSubscription;
  onClose: () => void;
  onSave: (reminder: Reminder) => void;
  onOpenUpgradeModal: () => void;
}

const ReminderFormModal: React.FC<ReminderFormModalProps> = ({
  reminder,
  contacts,
  preselectedContactId,
  subscription,
  onClose,
  onSave,
}) => {
  const [contactId, setContactId] = useState(
    reminder?.contactId || preselectedContactId || contacts[0]?.id || ''
  );
  const [occasionType, setOccasionType] = useState<OccasionType>(reminder?.occasionType || 'birthday');
  const [title, setTitle] = useState(reminder?.title || '');
  const [eventDate, setEventDate] = useState(reminder?.eventDate || '');
  const [cadence, setCadence] = useState<CadenceType>(reminder?.cadence || 'annual');
  const [channel, setChannel] = useState<DeliveryChannel>(reminder?.channel || 'queue');
  const [advanceDays, setAdvanceDays] = useState<number[]>(reminder?.advanceDays || [7, 0]);
  const [requireApproval, setRequireApproval] = useState<boolean>(
    reminder ? reminder.requireApproval : true
  );
  const [notes, setNotes] = useState(reminder?.notes || '');

  const handleOccasionChange = (occ: OccasionType) => {
    setOccasionType(occ);
    const selectedContact = contacts.find((c) => c.id === contactId);
    const name = selectedContact ? selectedContact.name : 'Loved One';
    if (occ === 'birthday') {
      setTitle(`${name}'s Birthday`);
      if (selectedContact?.birthDate) setEventDate(selectedContact.birthDate);
    } else if (occ === 'anniversary') {
      setTitle(`Anniversary with ${name}`);
      if (selectedContact?.anniversaryDate) setEventDate(selectedContact.anniversaryDate);
    } else if (occ === 'check_in') {
      setTitle(`Monthly Check-in with ${name}`);
    } else if (occ === 'valentines') {
      setTitle(`Valentine's Day with ${name}`);
    } else {
      setTitle(`Special Milestone with ${name}`);
    }
  };

  const handleToggleAdvanceDay = (day: number) => {
    if (advanceDays.includes(day)) {
      setAdvanceDays(advanceDays.filter((d) => d !== day));
    } else {
      setAdvanceDays([...advanceDays, day].sort((a, b) => b - a));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !eventDate || !contactId) return;

    const saved: Reminder = {
      id: reminder?.id || `rem_${Date.now()}`,
      contactId,
      occasionType,
      title: title.trim(),
      eventDate,
      advanceDays: advanceDays.length > 0 ? advanceDays : [0],
      cadence,
      channel,
      requireApproval,
      status: reminder?.status || 'active',
      notes: notes.trim() || undefined,
    };

    onSave(saved);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 border border-neutral-200 shadow-2xl animate-in slide-in-from-bottom duration-200">
        <div className="sm:hidden w-12 h-1.5 bg-neutral-300 rounded-full mx-auto -mt-1 mb-3" />

        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 font-display">
              {reminder ? 'Edit Reminder' : 'Schedule a Reminder'}
            </h2>
            <p className="text-xs text-neutral-500">
              Set date, cadence, and delivery channel.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs pb-4">
          {/* Contact Picker */}
          <div>
            <label className="block font-semibold text-neutral-800 mb-1">Loved One *</label>
            <select
              required
              value={contactId}
              onChange={(e) => setContactId(e.target.value)}
              className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-neutral-200 focus:outline-none focus:border-rose-500 bg-white"
            >
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({getRelationshipLabel(c.relationship)})
                </option>
              ))}
            </select>
          </div>

          {/* Occasion & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-800 mb-1">Occasion Type</label>
              <select
                value={occasionType}
                onChange={(e) => handleOccasionChange(e.target.value as OccasionType)}
                className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-neutral-200 focus:outline-none focus:border-rose-500 bg-white capitalize"
              >
                <option value="birthday">Birthday</option>
                <option value="anniversary">Anniversary</option>
                <option value="check_in">Thinking of You</option>
                <option value="milestone">Life Milestone</option>
                <option value="valentines">Valentine's Day</option>
                <option value="custom">Custom Occasion</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-neutral-800 mb-1">Reminder Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Amara's Birthday Celebration"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-neutral-200 focus:outline-none focus:border-rose-500 bg-white"
              />
            </div>
          </div>

          {/* Date & Cadence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-800 mb-1">Event Date *</label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-neutral-200 focus:outline-none focus:border-rose-500 bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-800 mb-1">Recurrence Cadence</label>
              <select
                value={cadence}
                onChange={(e) => setCadence(e.target.value as CadenceType)}
                className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-neutral-200 focus:outline-none focus:border-rose-500 bg-white"
              >
                <option value="annual">Annual (Every year)</option>
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="once">One-time only</option>
              </select>
            </div>
          </div>

          {/* Advance alert touch chips */}
          <div>
            <label className="block font-semibold text-neutral-800 mb-1.5">
              Advance Alerts (Select when to trigger)
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { day: 14, label: '14d prior' },
                { day: 7, label: '7d (Gift prep)' },
                { day: 3, label: '3d' },
                { day: 1, label: '1d prior' },
                { day: 0, label: 'Day-of' },
              ].map(({ day, label }) => {
                const isSelected = advanceDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleToggleAdvanceDay(day)}
                    className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-rose-50 text-rose-800 border-rose-300 font-semibold'
                        : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Delivery Channel */}
          <div>
            <label className="block font-semibold text-neutral-800 mb-1">Target Dispatch Channel</label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value as DeliveryChannel)}
              className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-neutral-200 focus:outline-none focus:border-rose-500 bg-white capitalize"
            >
              <option value="queue">In-App Approval Queue (Review first)</option>
              <option value="whatsapp">WhatsApp / SMS Handoff</option>
              <option value="email">Email Notification</option>
              <option value="webhook">Webhook Integration</option>
            </select>
          </div>

          {/* Approval toggle */}
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-start justify-between gap-3">
            <div>
              <div className="font-semibold text-neutral-900">Require Manual Approval</div>
              <p className="text-neutral-500 mt-0.5 text-[11px] leading-relaxed">
                Keep in queue for final review before sending.
              </p>
            </div>
            <input
              type="checkbox"
              checked={requireApproval}
              onChange={(e) => setRequireApproval(e.target.checked)}
              className="mt-1 h-5 w-5 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-neutral-800 mb-1">Notes / Gift Reminders</label>
            <input
              type="text"
              placeholder="e.g. Bring the white peonies"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-neutral-200 focus:outline-none focus:border-rose-500 bg-white"
            />
          </div>

          {/* Bottom Pinned CTA */}
          <div className="pt-3 border-t border-neutral-200 grid grid-cols-2 gap-3 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] px-4 py-2.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[48px] px-5 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              Save Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
