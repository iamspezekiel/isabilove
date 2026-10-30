"use client";

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { RelationshipType } from '../types';
import { formatDatePretty, getDaysUntil, getRelationshipLabel } from '../services/scheduler';
import {
  Bell,
  Clock,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Filter,
  Check,
  Trash2,
  Heart,
  Send,
  MessageCircle,
  Mail,
  ShieldCheck,
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { drafts, reminders, contacts, subscription, showToast } = useApp();
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState<'all' | 'action' | 'upcoming' | 'sent'>('all');
  const [clearedEventIds, setClearedEventIds] = useState<string[]>([]);

  // 1. Pending draft approvals
  const pendingDrafts = drafts.filter((d) => d.status === 'pending_approval');

  // 2. Upcoming reminders in next 14 days
  const upcomingReminders = reminders
    .filter((r) => r.status === 'active')
    .map((r) => {
      const contact = contacts.find((c) => c.id === r.contactId);
      const days = getDaysUntil(r.eventDate);
      return { reminder: r, contact, days };
    })
    .filter((item) => item.days >= 0 && item.days <= 14)
    .sort((a, b) => a.days - b.days);

  // 3. Recently dispatched messages
  const recentDispatches = drafts
    .filter((d) => d.status === 'sent')
    .sort((a, b) => new Date(b.sentAt || 0).getTime() - new Date(a.sentAt || 0).getTime())
    .slice(0, 5);

  // Build combined notification items
  interface NotificationItem {
    id: string;
    type: 'action' | 'upcoming' | 'sent' | 'system';
    title: string;
    subtitle: string;
    timestamp: string;
    daysUntil?: number;
    linkUrl?: string;
    linkText?: string;
    contactName?: string;
    contactRelationship?: RelationshipType;
    snippet?: string;
    icon: 'clock' | 'calendar' | 'sent' | 'bell';
  }

  const items: NotificationItem[] = [];

  // Add pending approval drafts
  pendingDrafts.forEach((d) => {
    const contact = contacts.find((c) => c.id === d.contactId);
    items.push({
      id: `draft_${d.id}`,
      type: 'action',
      title: `Words Awaiting Review: ${contact?.name || 'Loved One'}`,
      subtitle: `${d.customOccasionTitle || d.occasion.replace('_', ' ')} note ready for approval`,
      timestamp: formatDatePretty(d.scheduledDate),
      linkUrl: '/queue',
      linkText: 'Review in Queue',
      contactName: contact?.name,
      contactRelationship: contact?.relationship,
      snippet: d.customizedText || d.generatedText,
      icon: 'clock',
    });
  });

  // Add upcoming dates
  upcomingReminders.forEach(({ reminder, contact, days }) => {
    items.push({
      id: `rem_${reminder.id}`,
      type: 'upcoming',
      title: `${reminder.title}`,
      subtitle: days === 0 ? 'Today is the appointed day!' : days === 1 ? 'Appointed for tomorrow' : `Approaching in ${days} days`,
      timestamp: formatDatePretty(reminder.eventDate),
      daysUntil: days,
      linkUrl: contact ? `/studio?contactId=${contact.id}&occasion=${reminder.occasionType}` : '/studio',
      linkText: 'Compose Words',
      contactName: contact?.name,
      contactRelationship: contact?.relationship,
      snippet: reminder.notes || `Remember to honor ${contact?.name || 'loved one'} with words of grace.`,
      icon: 'calendar',
    });
  });

  // Add recent sent notifications
  recentDispatches.forEach((d) => {
    const contact = contacts.find((c) => c.id === d.contactId);
    items.push({
      id: `sent_${d.id}`,
      type: 'sent',
      title: `Dispatched: ${d.customOccasionTitle || d.occasion.replace('_', ' ')} Note`,
      subtitle: `Delivered to ${contact?.name || 'Loved One'} via ${d.channel}`,
      timestamp: d.sentAt ? formatDatePretty(d.sentAt) : d.scheduledDate,
      linkUrl: '/history',
      linkText: 'View Chronicles',
      contactName: contact?.name,
      contactRelationship: contact?.relationship,
      snippet: d.customizedText || d.generatedText,
      icon: 'sent',
    });
  });



  // Filter out cleared items
  const activeItems = items.filter((item) => !clearedEventIds.includes(item.id));

  // Filter by category
  const filteredItems = activeItems.filter((item) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'action') return item.type === 'action' || (item.type === 'upcoming' && (item.daysUntil ?? 99) <= 2);
    if (activeFilter === 'upcoming') return item.type === 'upcoming';
    if (activeFilter === 'sent') return item.type === 'sent';
    return true;
  });

  const handleClearNotice = (id: string) => {
    setClearedEventIds((prev) => [...prev, id]);
    showToast('Notice dismissed from view', 'info');
  };

  const handleClearAll = () => {
    const allIds = items.map((i) => i.id);
    setClearedEventIds(allIds);
    showToast('All notices marked as read', 'success');
  };

  return (
    <div className="space-y-6 pb-6 md:pb-4 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-[#2a241c] font-display">
            Remembrances & Updates
          </h1>
          <p className="text-xs text-[#6f665c] mt-1">
            {pendingDrafts.length > 0
              ? `${pendingDrafts.length} notes awaiting review · ${upcomingReminders.length} dates approaching`
              : 'No urgent notices awaiting review.'}
          </p>
        </div>

        {activeItems.length > 0 && (
          <button
            onClick={handleClearAll}
            className="min-h-[44px] px-3.5 py-2 text-xs font-semibold text-[#8c6239] hover:bg-[#faf6ef] rounded-xl transition-colors cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Biblical Epigraph */}
      <div className="p-4 sm:p-5 rounded-2xl border border-[#8c6239]/20 bg-[#faf6ef] flex items-start gap-3 shadow-xs">
        <BookOpen className="w-4 h-4 text-[#8c6239] shrink-0 mt-0.5" />
        <div className="text-xs text-[#6f665c] space-y-0.5">
          <p className="font-display italic text-[#2a241c] text-xs sm:text-sm leading-relaxed">
            “So let us not give up in doing what is fine, for in due time we will reap if we do not tire out.”
          </p>
          <p className="text-[11px] text-[#8c6239] font-mono">
            — Galatians 6:9 (New World Translation)
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
        {[
          { id: 'all', label: `All (${activeItems.length})` },
          { id: 'action', label: `Review (${pendingDrafts.length})` },
          { id: 'upcoming', label: `Upcoming (${upcomingReminders.length})` },
          { id: 'sent', label: `Dispatched (${recentDispatches.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={`min-h-[40px] px-3.5 py-1.5 text-xs font-medium rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeFilter === tab.id
                ? 'bg-[#2a241c] text-[#faf6ef] shadow-xs font-semibold'
                : 'bg-[#faf6ef] text-[#6f665c] border border-[#8c6239]/20 hover:text-[#2a241c]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications Feed */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-[#8c6239]/20 bg-[#faf6ef] space-y-3">
          <CheckCircle2 className="w-12 h-12 text-[#8c6239] mx-auto" />
          <h3 className="text-base font-bold text-[#2a241c] font-display">All caught up</h3>
          <p className="text-xs text-[#6f665c] max-w-sm mx-auto leading-relaxed">
            There are no active notices in this filter. As appointed dates draw near, reminders and draft words will prepare here for your blessing.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            <Link
              to="/reminders?action=new"
              className="inline-flex min-h-[44px] px-4 py-2.5 text-xs font-semibold text-[#faf6ef] bg-[#2a241c] rounded-xl hover:bg-[#2a241c]/90 transition-colors items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-[#8c6239]" />
              <span>Appoint a Date</span>
            </Link>
            <Link
              to="/studio"
              className="inline-flex min-h-[44px] px-4 py-2.5 text-xs font-semibold text-[#2a241c] bg-[#f3ece1] border border-[#8c6239]/25 rounded-xl hover:bg-[#f3ece1]/80 transition-colors items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#8c6239]" />
              <span>Compose Message</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-colors bg-[#faf6ef] shadow-xs space-y-3 ${
                item.type === 'action'
                  ? 'border-[#8c6239]/40 bg-[#faf6ef]'
                  : 'border-[#8c6239]/20'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  {/* Icon Indicator */}
                  <div className="w-10 h-10 rounded-xl bg-[#f3ece1] border border-[#8c6239]/25 flex items-center justify-center shrink-0 text-[#8c6239]">
                    {item.icon === 'clock' && <Clock className="w-5 h-5 text-[#8c6239]" />}
                    {item.icon === 'calendar' && <Calendar className="w-5 h-5 text-[#8c6239]" />}
                    {item.icon === 'sent' && <Send className="w-5 h-5 text-[#8c6239]" />}
                    {item.icon === 'bell' && <Bell className="w-5 h-5 text-[#8c6239]" />}
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-bold text-[#2a241c] font-display">
                        {item.title}
                      </h3>
                      {item.contactRelationship && (
                        <span className="text-xs text-[#6f665c]">
                          · {getRelationshipLabel(item.contactRelationship)}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#6f665c]">{item.subtitle}</p>

                    {item.snippet && (
                      <p className="text-xs text-[#2a241c] italic bg-[#f3ece1]/60 p-3 rounded-xl border border-[#8c6239]/15 mt-2 line-clamp-2 leading-relaxed">
                        “{item.snippet}”
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-[11px] font-mono text-[#6f665c] tabular-nums">
                    {item.timestamp}
                  </span>
                  <button
                    onClick={() => handleClearNotice(item.id)}
                    className="w-8 h-8 flex items-center justify-center text-[#6f665c] hover:text-[#8c6239] hover:bg-[#f3ece1] rounded-lg cursor-pointer transition-colors"
                    title="Dismiss notice"
                    aria-label="Dismiss notice"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Action Button */}
              {item.linkUrl && item.linkText && (
                <div className="pt-2 border-t border-[#8c6239]/15 flex items-center justify-end">
                  <Link
                    to={item.linkUrl}
                    className="min-h-[40px] px-4 py-2 text-xs font-semibold text-[#faf6ef] bg-[#2a241c] hover:bg-[#2a241c]/90 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    <span>{item.linkText}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#8c6239]" />
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
