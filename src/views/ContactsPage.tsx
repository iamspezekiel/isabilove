"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Contact, RelationshipType, LoveLanguage, ToneType } from '../types';
import { getLoveLanguageLabel, getRelationshipLabel, formatDatePretty } from '../services/scheduler';
import { SAMPLE_AVATARS } from '../services/storage';
import {
  Plus,
  Search,
  Heart,
  Calendar,
  Sparkles,
  Edit2,
  Trash2,
  User,
  X,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

export const ContactsPage: React.FC = () => {
  const { contacts, subscription, saveContact, deleteContact } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRelationship, setFilterRelationship] = useState<string>('all');
  const [isOpenFormModal, setIsOpenFormModal] = useState<boolean>(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setEditingContact(null);
      setIsOpenFormModal(true);
    }
  }, [searchParams]);

  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.preferences.hobbies?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.importantNotes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRel =
      filterRelationship === 'all' || c.relationship === filterRelationship;
    return matchesSearch && matchesRel;
  });

  const handleAddNew = () => {
    setEditingContact(null);
    setIsOpenFormModal(true);
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setIsOpenFormModal(true);
  };

  return (
    <div className="space-y-6 pb-6 md:pb-4 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-[#2a241c] font-display">
            Loved Ones
          </h1>
          <p className="text-xs text-[#6f665c] mt-1">
            {contacts.length} {contacts.length === 1 ? 'loved one' : 'loved ones'} in your care
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="min-h-[44px] px-4 py-2.5 text-xs font-semibold text-[#faf6ef] bg-[#2a241c] hover:bg-[#2a241c]/90 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#8c6239]" />
          <span>Add Loved One</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6f665c]" />
          <input
            type="text"
            placeholder="Search loved ones by name or memory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 min-h-[44px] text-xs text-[#2a241c] bg-[#faf6ef] border border-[#8c6239]/25 rounded-xl placeholder-[#6f665c]/70 focus:outline-none focus:border-[#8c6239]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
          {['all', 'partner', 'family', 'friend', 'colleague'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterRelationship(type)}
              className={`min-h-[40px] px-3.5 py-1.5 text-xs font-medium rounded-xl transition-colors cursor-pointer capitalize whitespace-nowrap shrink-0 ${
                filterRelationship === type
                  ? 'bg-[#2a241c] text-[#faf6ef] shadow-xs font-semibold'
                  : 'bg-[#faf6ef] text-[#6f665c] border border-[#8c6239]/20 hover:text-[#2a241c] hover:border-[#8c6239]/40'
              }`}
            >
              {type === 'all' ? 'All' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Contacts Grid */}
      {filteredContacts.length === 0 ? (
        <div className="p-10 text-center rounded-2xl border border-[#8c6239]/20 bg-[#faf6ef]">
          <User className="w-10 h-10 text-[#8c6239]/40 mx-auto mb-2.5" />
          <h3 className="text-sm font-bold text-[#2a241c] font-display">No loved ones found</h3>
          <p className="text-xs text-[#6f665c] mt-1 max-w-sm mx-auto">
            {searchTerm
              ? 'No records match your search criteria.'
              : 'Add your spouse, family members, or close companions to begin keeping memories and appointed times.'}
          </p>
          <button
            onClick={handleAddNew}
            className="mt-4 min-h-[44px] px-4 py-2.5 text-xs font-semibold text-[#faf6ef] bg-[#2a241c] rounded-xl hover:bg-[#2a241c]/90 transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-[#8c6239]" />
            <span>Record First Loved One</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="rounded-2xl border border-[#8c6239]/20 bg-[#faf6ef] p-5 hover:border-[#8c6239]/40 transition-colors flex flex-col justify-between space-y-4 shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <Link
                    to={`/contacts/${contact.id}`}
                    className="flex items-center gap-3.5 group flex-1 min-w-0"
                  >
                    {/* Avatar */}
                    <div className="w-13 h-13 rounded-xl bg-[#8c6239] text-[#faf6ef] flex items-center justify-center font-bold text-sm shrink-0 border border-[#8c6239]/30 overflow-hidden shadow-xs">
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

                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-[#2a241c] group-hover:text-[#8c6239] transition-colors truncate font-display">
                        {contact.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-[#6f665c] mt-0.5">
                        <span className="font-medium capitalize text-[#2a241c]">
                          {getRelationshipLabel(contact.relationship)}
                        </span>
                        <span aria-hidden="true" className="text-[#8c6239]/30">·</span>
                        <span className="capitalize">{contact.preferredTone}</span>
                      </div>
                    </div>
                  </Link>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleEdit(contact)}
                      className="w-11 h-11 flex items-center justify-center text-[#6f665c] hover:text-[#2a241c] hover:bg-[#f3ece1] rounded-xl transition-colors cursor-pointer"
                      title="Edit Loved One"
                      aria-label="Edit Loved One"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteContact(contact.id)}
                      className="w-11 h-11 flex items-center justify-center text-[#6f665c] hover:text-[#8c6239] hover:bg-[#f3ece1] rounded-xl transition-colors cursor-pointer"
                      title="Delete Loved One"
                      aria-label="Delete Loved One"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-[#8c6239]/15 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <Heart className="w-3.5 h-3.5 text-[#8c6239] shrink-0" />
                    <span className="text-[#6f665c]">Love Language:</span>
                    <span className="font-medium text-[#2a241c]">
                      {getLoveLanguageLabel(contact.loveLanguage)}
                    </span>
                  </div>

                  {contact.birthDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#8c6239] shrink-0" />
                      <span className="text-[#6f665c]">Birthday:</span>
                      <span className="font-mono text-[#2a241c] tabular-nums font-medium">
                        {formatDatePretty(contact.birthDate)}
                      </span>
                    </div>
                  )}
                </div>

                {(contact.preferences.favoriteFlowers || contact.preferences.favoriteTreats) && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-[#f3ece1]/70 border border-[#8c6239]/15 text-xs space-y-1">
                    {contact.preferences.favoriteFlowers && (
                      <div className="text-[#6f665c] truncate">
                        <span className="font-semibold text-[#2a241c]">Flowers:</span>{' '}
                        {contact.preferences.favoriteFlowers}
                      </div>
                    )}
                    {contact.preferences.favoriteTreats && (
                      <div className="text-[#6f665c] truncate">
                        <span className="font-semibold text-[#2a241c]">Treats:</span>{' '}
                        {contact.preferences.favoriteTreats}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Touch Actions */}
              <div className="pt-3 border-t border-[#8c6239]/15 flex items-center justify-between gap-2">
                <Link
                  to={`/contacts/${contact.id}`}
                  className="min-h-[44px] text-xs font-semibold text-[#2a241c] hover:text-[#8c6239] flex items-center gap-1 px-1"
                >
                  <span>Full Profile</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#8c6239]" />
                </Link>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/reminders?contactId=${contact.id}&action=new`}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center text-xs text-[#2a241c] bg-[#f3ece1] hover:bg-[#f3ece1]/80 border border-[#8c6239]/20 rounded-xl transition-colors"
                    title="Schedule Reminder"
                    aria-label="Schedule Reminder"
                  >
                    <Calendar className="w-4 h-4 text-[#8c6239]" />
                  </Link>

                  <Link
                    to={`/studio?contactId=${contact.id}`}
                    className="min-h-[44px] px-3.5 py-2 text-xs font-semibold text-[#faf6ef] bg-[#8c6239] hover:bg-[#8c6239]/90 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Compose</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contact Form Bottom Sheet */}
      {isOpenFormModal && (
        <ContactFormModal
          contact={editingContact}
          onClose={() => {
            setIsOpenFormModal(false);
            if (searchParams.get('action') === 'new') {
              setSearchParams({});
            }
          }}
          onSave={(c) => {
            saveContact(c);
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

// Form Bottom Sheet Component with Thumb-Zone Ergonomics
interface ContactFormModalProps {
  contact: Contact | null;
  onClose: () => void;
  onSave: (contact: Contact) => void;
}

const ContactFormModal: React.FC<ContactFormModalProps> = ({ contact, onClose, onSave }) => {
  const [name, setName] = useState(contact?.name || '');
  const [relationship, setRelationship] = useState<RelationshipType>(contact?.relationship || 'partner');
  const [avatarUrl, setAvatarUrl] = useState(contact?.avatarUrl || SAMPLE_AVATARS.partner);
  const [birthDate, setBirthDate] = useState(contact?.birthDate || '');
  const [anniversaryDate, setAnniversaryDate] = useState(contact?.anniversaryDate || '');
  const [phone, setPhone] = useState(contact?.phone || '');
  const [email, setEmail] = useState(contact?.email || '');
  const [loveLanguage, setLoveLanguage] = useState<LoveLanguage>(contact?.loveLanguage || 'words_of_affirmation');
  const [preferredTone, setPreferredTone] = useState<ToneType>(contact?.preferredTone || 'romantic');
  const [favoriteFlowers, setFavoriteFlowers] = useState(contact?.preferences.favoriteFlowers || '');
  const [favoriteTreats, setFavoriteTreats] = useState(contact?.preferences.favoriteTreats || '');
  const [favoriteColors, setFavoriteColors] = useState(contact?.preferences.favoriteColors || '');
  const [hobbies, setHobbies] = useState(contact?.preferences.hobbies || '');
  const [dislikes, setDislikes] = useState(contact?.preferences.dislikes || '');
  const [memoriesText, setMemoriesText] = useState((contact?.memories || []).join('\n'));
  const [importantNotes, setImportantNotes] = useState(contact?.importantNotes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const memories = memoriesText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const saved: Contact = {
      id: contact?.id || `contact_${Date.now()}`,
      name: name.trim(),
      relationship,
      avatarUrl,
      birthDate: birthDate || undefined,
      anniversaryDate: anniversaryDate || undefined,
      phone: phone || undefined,
      email: email || undefined,
      loveLanguage,
      preferredTone,
      preferences: {
        favoriteFlowers: favoriteFlowers.trim() || undefined,
        favoriteTreats: favoriteTreats.trim() || undefined,
        favoriteColors: favoriteColors.trim() || undefined,
        hobbies: hobbies.trim() || undefined,
        dislikes: dislikes.trim() || undefined,
      },
      memories,
      importantNotes: importantNotes.trim() || undefined,
      createdAt: contact?.createdAt || new Date().toISOString(),
    };

    onSave(saved);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#2a241c]/50 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-[#faf6ef] rounded-t-3xl sm:rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 border border-[#8c6239]/25 shadow-2xl">
        <div className="sm:hidden w-12 h-1 bg-[#8c6239]/30 rounded-full mx-auto -mt-1 mb-3" />

        <div className="flex items-center justify-between pb-3 border-b border-[#8c6239]/15">
          <div>
            <h2 className="text-lg font-bold text-[#2a241c] font-display">
              {contact ? 'Edit Loved One' : 'Record a Loved One'}
            </h2>
            <p className="text-xs text-[#6f665c]">
              Personal details help craft messages with care.
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-[#2a241c] mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Amara Vance"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-[#8c6239]/30 focus:outline-none focus:border-[#8c6239] bg-[#faf6ef] text-[#2a241c]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#2a241c] mb-1">Relationship Role</label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value as RelationshipType)}
                className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-[#8c6239]/30 focus:outline-none focus:border-[#8c6239] bg-[#faf6ef] text-[#2a241c] capitalize"
              >
                <option value="partner">Partner / Spouse</option>
                <option value="family">Family (Parent, Sibling, Child)</option>
                <option value="friend">Close Friend</option>
                <option value="colleague">Colleague</option>
                <option value="mentor">Mentor</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#2a241c] mb-1.5">Profile Avatar</label>
            <div className="flex items-center gap-3">
              {[SAMPLE_AVATARS.partner, SAMPLE_AVATARS.friend, SAMPLE_AVATARS.family].map(
                (imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(imgUrl)}
                    className={`relative p-0.5 rounded-xl border-2 cursor-pointer transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${
                      avatarUrl === imgUrl
                        ? 'border-[#8c6239]'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Avatar option ${idx + 1}`}
                      className="w-12 h-12 rounded-lg object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                )
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-[#2a241c] mb-1">Birthday</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-[#8c6239]/30 focus:outline-none focus:border-[#8c6239] bg-[#faf6ef] text-[#2a241c]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#2a241c] mb-1">Anniversary</label>
              <input
                type="date"
                value={anniversaryDate}
                onChange={(e) => setAnniversaryDate(e.target.value)}
                className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-[#8c6239]/30 focus:outline-none focus:border-[#8c6239] bg-[#faf6ef] text-[#2a241c]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#2a241c] mb-1">Phone / WhatsApp</label>
              <input
                type="text"
                placeholder="+1 555-123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-[#8c6239]/30 focus:outline-none focus:border-[#8c6239] bg-[#faf6ef] text-[#2a241c]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#2a241c] mb-1">Email Address</label>
              <input
                type="email"
                placeholder="amara@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-[#8c6239]/30 focus:outline-none focus:border-[#8c6239] bg-[#faf6ef] text-[#2a241c]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-[#8c6239]/15">
            <div>
              <label className="block font-semibold text-[#2a241c] mb-1">Primary Love Language</label>
              <select
                value={loveLanguage}
                onChange={(e) => setLoveLanguage(e.target.value as LoveLanguage)}
                className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-[#8c6239]/30 focus:outline-none focus:border-[#8c6239] bg-[#faf6ef] text-[#2a241c]"
              >
                <option value="words_of_affirmation">Words of Affirmation</option>
                <option value="quality_time">Quality Time</option>
                <option value="receiving_gifts">Receiving Gifts</option>
                <option value="acts_of_service">Acts of Service</option>
                <option value="physical_touch">Physical Touch</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#2a241c] mb-1">Default Tone</label>
              <select
                value={preferredTone}
                onChange={(e) => setPreferredTone(e.target.value as ToneType)}
                className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-[#8c6239]/30 focus:outline-none focus:border-[#8c6239] bg-[#faf6ef] text-[#2a241c] capitalize"
              >
                <option value="romantic">Steadfast & Romantic</option>
                <option value="playful">Joyful & Playful</option>
                <option value="grateful">Deeply Grateful</option>
                <option value="poetic">Poetic & Reflective</option>
                <option value="cheerful">Cheerful & Uplifting</option>
                <option value="pidgin">Cultural Warmth / Pidgin</option>
              </select>
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-[#8c6239]/15">
            <h4 className="font-semibold text-[#2a241c]">Delight & Preferences</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="text"
                placeholder="Favorite Flowers (e.g. White Peonies)"
                value={favoriteFlowers}
                onChange={(e) => setFavoriteFlowers(e.target.value)}
                className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-[#8c6239]/30 focus:outline-none focus:border-[#8c6239] bg-[#faf6ef] text-[#2a241c]"
              />
              <input
                type="text"
                placeholder="Favorite Treats (e.g. Dark Chocolate Caramels)"
                value={favoriteTreats}
                onChange={(e) => setFavoriteTreats(e.target.value)}
                className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-[#8c6239]/30 focus:outline-none focus:border-[#8c6239] bg-[#faf6ef] text-[#2a241c]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#2a241c] mb-1">
              Shared Memories & Sacred Milestones (One per line)
            </label>
            <textarea
              rows={2}
              placeholder="The quiet walk at dusk by the river&#10;Building the bookshelf on a stormy Sunday"
              value={memoriesText}
              onChange={(e) => setMemoriesText(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#8c6239]/30 focus:outline-none focus:border-[#8c6239] bg-[#faf6ef] text-[#2a241c] leading-relaxed"
            />
          </div>

          {/* Thumb-Zone Pinned Action Bar */}
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
              Save Contact
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

