"use client";

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatDatePretty, getRelationshipLabel } from '../services/scheduler';
import {
  History,
  CheckCircle2,
  Copy,
  Check,
  Search,
  Sparkles,
  BookOpen,
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const { drafts, contacts } = useApp();

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
    <div className="space-y-6 pb-6 md:pb-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-[#2a241c] font-display">
            Dispatched Chronicles
          </h1>
          <p className="text-xs text-[#6f665c] mt-1">
            {sentDrafts.length} words of blessing dispatched and preserved in your chronicles
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6f665c]" />
          <input
            type="text"
            placeholder="Search chronicles by recipient or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 min-h-[44px] text-xs text-[#2a241c] bg-[#faf6ef] border border-[#8c6239]/25 rounded-xl placeholder-[#6f665c]/70 focus:outline-none focus:border-[#8c6239]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
          {['all', 'whatsapp', 'email', 'webhook'].map((ch) => (
            <button
              key={ch}
              onClick={() => setFilterChannel(ch)}
              className={`min-h-[40px] px-3.5 py-1.5 text-xs font-medium rounded-xl transition-colors cursor-pointer capitalize whitespace-nowrap shrink-0 ${
                filterChannel === ch
                  ? 'bg-[#2a241c] text-[#faf6ef] shadow-xs font-semibold'
                  : 'bg-[#faf6ef] text-[#6f665c] border border-[#8c6239]/20 hover:text-[#2a241c]'
              }`}
            >
              {ch === 'all' ? 'All Channels' : ch}
            </button>
          ))}
        </div>
      </div>

      {/* Logs List */}
      {filteredLogs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-[#8c6239]/20 bg-[#faf6ef] space-y-3">
          <History className="w-10 h-10 text-[#8c6239]/40 mx-auto" />
          <h3 className="text-sm font-bold text-[#2a241c] font-display">No dispatched words found</h3>
          <p className="text-xs text-[#6f665c] max-w-sm mx-auto leading-relaxed">
            Once you approve and dispatch words of blessing from your queue or studio, they will be archived here.
          </p>
          <Link
            to="/studio"
            className="mt-2 inline-flex min-h-[44px] px-4 py-2 text-xs font-semibold text-[#faf6ef] bg-[#2a241c] rounded-xl hover:bg-[#2a241c]/90 transition-colors items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#8c6239]" />
            <span>Compose Words in Studio</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredLogs.map((draft) => {
            const contact = contacts.find((c) => c.id === draft.contactId);
            const text = draft.customizedText || draft.generatedText;

            return (
              <div
                key={draft.id}
                className="p-5 rounded-2xl border border-[#8c6239]/20 bg-[#faf6ef] shadow-xs space-y-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#8c6239]/15">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#2a241c] text-sm font-display">
                      {contact ? contact.name : 'Loved One'}
                    </span>
                    <span className="text-[#6f665c]">
                      · {draft.customOccasionTitle || draft.occasion.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-[#6f665c]">
                    <span className="font-mono tabular-nums">
                      {draft.sentAt ? formatDatePretty(draft.sentAt) : draft.scheduledDate}
                    </span>
                    <span className="capitalize px-2 py-0.5 rounded-md bg-[#f3ece1] border border-[#8c6239]/20 text-[#8c6239] font-medium">
                      {draft.channel}
                    </span>
                  </div>
                </div>

                <p className="text-[#2a241c] font-sans leading-relaxed italic bg-[#f3ece1]/60 p-3.5 rounded-xl border border-[#8c6239]/15">
                  “{text}”
                </p>

                <div className="flex items-center justify-between pt-1 text-[11px] text-[#6f665c]">
                  <span className="capitalize">Tone: {draft.tone}</span>
                  <button
                    onClick={() => handleCopy(draft.id, text)}
                    className="font-medium text-[#6f665c] hover:text-[#2a241c] flex items-center gap-1 cursor-pointer min-h-[36px]"
                  >
                    {copiedId === draft.id ? (
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
            );
          })}
        </div>
      )}
    </div>
  );
};
