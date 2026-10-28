import React, { useState } from 'react';
import { MessageDraft, Contact } from '../types';
import { formatDatePretty, getRelationshipLabel } from '../services/scheduler';
import { SAMPLE_AVATARS } from '../services/storage';
import {
  History,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  Trash2,
  Search,
} from 'lucide-react';

interface HistoryLogsProps {
  drafts: MessageDraft[];
  contacts: Contact[];
  onClearHistory: () => void;
  onReuseMessage: (draft: MessageDraft) => void;
}

export const HistoryLogs: React.FC<HistoryLogsProps> = ({
  drafts,
  contacts,
  onClearHistory,
  onReuseMessage,
}) => {
  const sentDrafts = drafts
    .filter((d) => d.status === 'sent')
    .sort((a, b) => new Date(b.sentAt || 0).getTime() - new Date(a.sentAt || 0).getTime());

  const [filterChannel, setFilterChannel] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredLogs = sentDrafts.filter((d) => {
    const contact = contacts.find((c) => c.id === d.contactId);
    const matchesChannel = filterChannel === 'all' || d.channel === filterChannel;
    const matchesSearch =
      (contact?.name.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (d.customizedText || d.generatedText).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesChannel && matchesSearch;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-5 pb-24 md:pb-12">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 font-display">
            Dispatched History
          </h1>
          <p className="text-xs text-neutral-500">
            {sentDrafts.length} sent relationship messages
          </p>
        </div>

        {sentDrafts.length > 0 && (
          <button
            onClick={onClearHistory}
            className="min-h-[44px] text-xs text-neutral-500 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search sent messages or recipient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 min-h-[44px] text-xs text-neutral-900 bg-white border border-neutral-200 rounded-xl placeholder-neutral-400 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
          {['all', 'whatsapp', 'email', 'webhook'].map((ch) => (
            <button
              key={ch}
              onClick={() => setFilterChannel(ch)}
              className={`min-h-[38px] px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all cursor-pointer capitalize whitespace-nowrap shrink-0 ${
                filterChannel === ch
                  ? 'bg-neutral-900 text-white shadow-xs font-semibold'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300'
              }`}
            >
              {ch === 'all' ? 'All Channels' : ch}
            </button>
          ))}
        </div>
      </div>

      {/* Logs List */}
      {filteredLogs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-neutral-200 bg-white">
          <History className="w-10 h-10 text-neutral-300 mx-auto mb-2.5" />
          <h3 className="text-sm font-semibold text-neutral-900">No dispatched messages found</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Once you approve and dispatch messages from your queue or AI Studio, they will be archived here.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredLogs.map((log) => {
            const contact = contacts.find((c) => c.id === log.contactId);
            const text = log.customizedText || log.generatedText;

            return (
              <div
                key={log.id}
                className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 space-y-3 shadow-xs"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-neutral-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={contact?.avatarUrl || SAMPLE_AVATARS.partner}
                      alt={contact?.name || 'Contact'}
                      className="w-10 h-10 rounded-full object-cover border border-neutral-200 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-bold text-neutral-900 truncate">
                          {contact ? contact.name : 'Loved One'}
                        </span>
                        <span className="text-xs text-neutral-400">
                          · {contact ? getRelationshipLabel(contact.relationship) : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                        <span className="font-medium text-neutral-800">
                          {log.customOccasionTitle || log.occasion}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">{log.channel}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs self-start sm:self-auto">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-mono text-neutral-600 tabular-nums">
                      {log.sentAt
                        ? new Date(log.sentAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Sent'}
                    </span>
                  </div>
                </div>

                {/* Message preview */}
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-xs sm:text-sm text-neutral-800 leading-relaxed font-sans">
                  <p className="whitespace-pre-wrap">{text}</p>
                </div>

                {/* Receipt Details */}
                {log.deliveryLog && (
                  <div className="text-[11px] text-neutral-500 flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="font-medium text-neutral-700">Receipt:</span>
                    <span>{log.deliveryLog.method}</span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate">Recipient: {log.deliveryLog.recipient}</span>
                  </div>
                )}

                {/* Card actions */}
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-neutral-100">
                  <button
                    onClick={() => handleCopy(log.id, text)}
                    className="min-h-[40px] px-3.5 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedId === log.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onReuseMessage(log)}
                    className="min-h-[40px] px-3.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                    <span>Reuse in Studio</span>
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
