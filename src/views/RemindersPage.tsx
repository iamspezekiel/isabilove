"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Reminder, OccasionType, CadenceType, DeliveryChannel } from '../types';
import { getDaysUntil, formatDatePretty, getRelationshipLabel } from '../services/scheduler';
import {
  Plus,
  Calendar,
  Sparkles,
  Edit2,
  Trash2,
  PauseCircle,
  PlayCircle,
  X,
  Clock,
  BookOpen,
} from 'lucide-react';

export const RemindersPage: React.FC = () => {
  const { reminders, contacts, subscription, saveReminder, deleteReminder, toggleReminderStatus } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [filterCadence, setFilterCadence] = useState<string>('all');
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [isOpenFormModal, setIsOpenFormModal] = useState<boolean>(false);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setEditingReminder(null);
      setIsOpenFormModal(true);
    }
  }, [searchParams]);

  const filteredReminders = reminders.filter((r) => {
    if (filterCadence === 'all') return true;
    if (filterCadence === 'upcoming') {
      const days = getDaysUntil(r.eventDate);
      return days >= 0 && days <= 30;
    }
    return r.cadence === filterCadence;
  });

  const handleCreateNew = () => {
    setEditingReminder(null);
    setIsOpenFormModal(true);
  };

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setIsOpenFormModal(true);
  };

  return (
    <div className="space-y-6 pb-6 md:pb-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-[#2a241c] font-display">
            Scheduled Reminders
          </h1>
          <p className="text-xs text-[#6f665c] mt-1">
            {reminders.filter((r) => r.status === 'active').length} active reminders scheduled
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="min-h-[44px] px-4 py-2.5 text-xs font-semibold text-[#faf6ef] bg-[#2a241c] hover:bg-[#2a241c]/90 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#8c6239]" />
          <span>Add Reminder</span>
        </button>
      </div>

      {/* Cadence Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
        {[
          { id: 'all', label: 'All' },
          { id: 'upcoming', label: 'Next 30 Days' },
          { id: 'annual', label: 'Annual' },
          { id: 'monthly', label: 'Monthly' },
          { id: 'once', label: 'One-off' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterCadence(tab.id)}
            className={`min-h-[40px] px-3.5 py-1.5 text-xs font-medium rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              filterCadence === tab.id
                ? 'bg-[#2a241c] text-[#faf6ef] shadow-xs font-semibold'
                : 'bg-[#faf6ef] text-[#6f665c] border border-[#8c6239]/20 hover:text-[#2a241c] hover:border-[#8c6239]/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reminders List */}
      {filteredReminders.length === 0 ? (
        <div className="p-10 text-center rounded-2xl border border-[#8c6239]/20 bg-[#faf6ef] space-y-3">
          <Calendar className="w-10 h-10 text-[#8c6239]/40 mx-auto" />
          <h3 className="text-sm font-bold text-[#2a241c] font-display">No scheduled dates found</h3>
          <p className="text-xs text-[#6f665c] max-w-sm mx-auto leading-relaxed">
            Record an anniversary, birthday, or relationship milestone to receive timely notice and thoughtful words.
          </p>
          <button
            onClick={handleCreateNew}
            className="mt-2 min-h-[44px] px-4 py-2.5 text-xs font-semibold text-[#faf6ef] bg-[#2a241c] rounded-xl hover:bg-[#2a241c]/90 transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-[#8c6239]" />
            <span>Schedule First Date</span>
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
                className={`p-4 sm:p-5 rounded-2xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs ${
                  isPaused
                    ? 'border-[#8c6239]/15 bg-[#f3ece1]/50 opacity-70'
                    : 'border-[#8c6239]/20 bg-[#faf6ef] hover:border-[#8c6239]/40'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-[#f3ece1] border border-[#8c6239]/25 flex flex-col items-center justify-center shrink-0 text-[#2a241c]">
                    <span className="text-[10px] uppercase font-bold text-[#8c6239]">
                      {new Date(reminder.eventDate).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-base font-bold font-mono tabular-nums leading-none">
                      {new Date(reminder.eventDate).getDate()}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-bold text-[#2a241c] truncate font-display">
                        {reminder.title}
                      </h3>
                      {contact && (
                        <Link
                          to={`/contacts/${contact.id}`}
                          className="text-xs text-[#6f665c] hover:text-[#8c6239] transition-colors"
                        >
                          · {contact.name} ({getRelationshipLabel(contact.relationship)})
                        </Link>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#6f665c] mt-1 flex-wrap">
                      <span className="capitalize">{reminder.cadence} cadence</span>
                      <span aria-hidden="true" className="text-[#8c6239]/30">·</span>
                      <span>
                        Notice {reminder.advanceDays.map((d) => (d === 0 ? 'Day of' : `${d}d prior`)).join(', ')}
                      </span>
                    </div>

                    {reminder.notes && (
                      <p className="text-xs text-[#6f665c] mt-1.5 italic line-clamp-1">
                        Note: {reminder.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status Countdown & Touch Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#8c6239]/15">
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

                  <div className="flex items-center gap-1.5">
                    {contact && (
                      <Link
                        to={`/studio?contactId=${contact.id}&occasion=${reminder.occasionType}`}
                        className="min-h-[44px] px-3.5 py-2 text-xs font-semibold text-[#faf6ef] bg-[#8c6239] hover:bg-[#8c6239]/90 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Compose</span>
                      </Link>
                    )}

                    <button
                      onClick={() => toggleReminderStatus(reminder.id)}
                      className="w-11 h-11 flex items-center justify-center text-[#6f665c] hover:text-[#2a241c] hover:bg-[#f3ece1] rounded-xl transition-colors cursor-pointer"
                      title={isPaused ? 'Resume Schedule' : 'Pause Schedule'}
                      aria-label={isPaused ? 'Resume Schedule' : 'Pause Schedule'}
                    >
                      {isPaused ? <PlayCircle className="w-4 h-4 text-[#8c6239]" /> : <PauseCircle className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleEdit(reminder)}
                      className="w-11 h-11 flex items-center justify-center text-[#6f665c] hover:text-[#2a241c] hover:bg-[#f3ece1] rounded-xl transition-colors cursor-pointer"
                      title="Edit Schedule"
                      aria-label="Edit Schedule"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => deleteReminder(reminder.id)}
                      className="w-11 h-11 flex items-center justify-center text-[#6f665c] hover:text-[#8c6239] hover:bg-[#f3ece1] rounded-xl transition-colors cursor-pointer"
                      title="Delete Schedule"
                      aria-label="Delete Schedule"
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

      {/* Schedule Form Bottom Sheet */}
      {isOpenFormModal && (
        <ReminderFormModal
          reminder={editingReminder}
          contacts={contacts}
          defaultContactId={searchParams.get('contactId') || undefined}
          onClose={() => {
            setIsOpenFormModal(false);
            if (searchParams.get('action') === 'new') {
              setSearchParams({});
            }
          }}
          onSave={(rem) => {
            saveReminder(rem);
            setIsOpenFormModal(false);
            if (searchParams.get('action') === 'new') {
              setSearchParams({});
            }
          }}
        />
      )}
    </div>
  );
};

// Reminder Form Modal Component
interface ReminderFormModalProps {
  reminder: Reminder | null;
  contacts: any[];
  defaultContactId?: string;
  onClose: () => void;
  onSave: (reminder: Reminder) => void;
}

const ReminderFormModal: React.FC<ReminderFormModalProps> = ({
  reminder,
  contacts,
  defaultContactId,
  onClose,
  onSave,
}) => {
  const [contactId, setContactId] = useState(
    reminder?.contactId || defaultContactId || contacts[0]?.id || ''
  );
  const [occasionType, setOccasionType] = useState<OccasionType>(
    reminder?.occasionType || 'birthday'
  );
  const [title, setTitle] = useState(reminder?.title || '');
  const [eventDate, setEventDate] = useState(
    reminder?.eventDate || new Date().toISOString().split('T')[0]!
  );
  const [cadence, setCadence] = useState<CadenceType>(reminder?.cadence || 'annual');
  const [advanceDays, setAdvanceDays] = useState<number[]>(reminder?.advanceDays || [7, 0]);
  const [channel, setChannel] = useState<DeliveryChannel>(reminder?.channel || 'queue');
  const [notes, setNotes] = useState(reminder?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !contactId) return;

    const saved: Reminder = {
      id: reminder?.id || `rem_${Date.now()}`,
      contactId,
      occasionType,
      title: title.trim(),
      eventDate,
      cadence,
      advanceDays,
      channel,
      requireApproval: true,
      status: reminder?.status || 'active',
      notes: notes.trim() || undefined,
    };

    onSave(saved);
  };

  const toggleAdvanceDay = (day: number) => {
    if (advanceDays.includes(day)) {
      if (advanceDays.length > 1) {
        setAdvanceDays(advanceDays.filter((d) => d !== day));
      }
    } else {
      setAdvanceDays([...advanceDays, day].sort((a, b) => b - a));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#2a241c]/50 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-[#faf6ef] rounded-t-3xl sm:rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 border border-[#8c6239]/25 shadow-2xl">
        <div className="sm:hidden w-12 h-1 bg-[#8c6239]/30 rounded-full mx-auto -mt-1 mb-3" />

        <div className="flex items-center justify-between pb-3 border-b border-[#8c6239]/15">
          <div>
            <h2 className="text-lg font-bold text-[#2a241c] font-display">
              {reminder ? 'Edit Scheduled Date' : 'Appoint a Sacred Date'}
            </h2>
            <p className="text-xs text-[#6f665c]">
              Schedule memories, anniversaries, and regular intentional check-ins.
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs pb-4">
          <div>
            <label className="block font-semibold text-[#2a241c] mb-1">Loved One *</label>
            <select
              value={contactId}
              onChange={(e) => {
                setContactId(e.target.value);
                const c = contacts.find((item) => item.id === e.target.value);
                if (c && !title) {
                  setTitle(`${c.name}'s Celebration`);
                }
              }}
              className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-[#8c6239]/30 focus:outline-none focus:border-[#8c6239] bg-[#faf6ef] text-[#2a241c]"
            >
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.relationship})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-[#2a241c] mb-1">Occasion Type</label>
              <select
                value={occasionType}
                onChange={(e) => setOccasionType(e.target.value as OccasionType)}
                className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-[#8c6239]/30 focus:outline-none focus:border-[#8c6239] bg-[#faf6ef] text-[#2a241c] capitalize"
              >
                <option value="birthday">Birthday Celebration</option>
                <option value="anniversary">Relationship Anniversary</option>
                <option value="check_in">Intentional Check-in</option>
                <option value="milestone">Life Milestone</option>
                <option value="valentines">Valentine's Day</option>
                <option value="custom">Custom Remembrance</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#2a241c] mb-1">Cadence</label>
              <select
                value={cadence}
                onChange={(e) => setCadence(e.target.value as CadenceType)}
                className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-[#8c6239]/30 focus:outline-none focus:border-[#8c6239] bg-[#faf6ef] text-[#2a241c]"
              >
                <option value="annual">Annual (Repeats every year)</option>
                <option value="monthly">Monthly Check-in</option>
                <option value="once">One-time Milestone</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#2a241c] mb-1">Schedule Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Amara's Birthday Celebration"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-[#8c6239]/30 focus:outline-none focus:border-[#8c6239] bg-[#faf6ef] text-[#2a241c]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-[#2a241c] mb-1">Target Event Date *</label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-[#8c6239]/30 focus:outline-none focus:border-[#8c6239] bg-[#faf6ef] text-[#2a241c]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#2a241c] mb-1">Delivery Channel</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as DeliveryChannel)}
                className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-[#8c6239]/30 focus:outline-none focus:border-[#8c6239] bg-[#faf6ef] text-[#2a241c]"
              >
                <option value="queue">In-App Review Queue</option>
                <option value="whatsapp">WhatsApp Web Ready</option>
                <option value="email">Direct Email Notification</option>
                <option value="webhook">Automated Webhook</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#2a241c] mb-1.5">
              Advance Notice Remembrances
            </label>
            <div className="flex flex-wrap gap-2">
              {[14, 7, 3, 1, 0].map((day) => {
                const selected = advanceDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleAdvanceDay(day)}
                    className={`min-h-[40px] px-3.5 py-1.5 rounded-xl border font-medium text-xs transition-colors cursor-pointer ${
                      selected
                        ? 'bg-[#2a241c] text-[#faf6ef] border-[#2a241c]'
                        : 'bg-[#faf6ef] text-[#6f665c] border-[#8c6239]/20 hover:border-[#8c6239]/40'
                    }`}
                  >
                    {day === 0 ? 'Day of Event' : `${day} days prior`}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#2a241c] mb-1">
              Personal Notes & Gift Intentions
            </label>
            <textarea
              rows={2}
              placeholder="Gift ideas, plans for dinner, or thoughtful touches..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#8c6239]/30 focus:outline-none focus:border-[#8c6239] bg-[#faf6ef] text-[#2a241c] leading-relaxed"
            />
          </div>

          {/* Thumb-Zone Bottom CTA */}
          <div className="pt-3 border-t border-[#8c6239]/20 grid grid-cols-2 gap-3 sticky bottom-0 bg-[#faf6ef]">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] px-4 py-2.5 text-xs font-semibold text-[#6f665c] bg-[#f3ece1] hover:bg-[#f3ece1]/80 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[48px] px-5 py-2.5 text-xs font-semibold text-[#faf6ef] bg-[#2a241c] hover:bg-[#2a241c]/90 rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              Appoint Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
