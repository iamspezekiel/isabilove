import React, { useState } from 'react';
import { Contact, RelationshipType, LoveLanguage, ToneType, UserSubscription } from '../types';
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
  Phone,
  Mail,
} from 'lucide-react';

interface ContactListProps {
  contacts: Contact[];
  subscription: UserSubscription;
  onSaveContact: (contact: Contact) => void;
  onDeleteContact: (id: string) => void;
  onSelectForDraft: (contact: Contact) => void;
  onSelectForReminder: (contact: Contact) => void;
  onOpenUpgradeModal: () => void;
  isOpenCreateModal: boolean;
  setIsOpenCreateModal: (open: boolean) => void;
}

export const ContactList: React.FC<ContactListProps> = ({
  contacts,
  subscription,
  onSaveContact,
  onDeleteContact,
  onSelectForDraft,
  onSelectForReminder,
  onOpenUpgradeModal,
  isOpenCreateModal,
  setIsOpenCreateModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRelationship, setFilterRelationship] = useState<string>('all');
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [viewingContact, setViewingContact] = useState<Contact | null>(null);

  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.preferences.hobbies?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.importantNotes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRel =
      filterRelationship === 'all' || c.relationship === filterRelationship;
    return matchesSearch && matchesRel;
  });

  const handleAddNewClick = () => {
    if (subscription.tier === 'free' && contacts.length >= subscription.contactsLimit) {
      onOpenUpgradeModal();
    } else {
      setEditingContact(null);
      setIsOpenCreateModal(true);
    }
  };

  const handleEditClick = (contact: Contact) => {
    setEditingContact(contact);
    setIsOpenCreateModal(true);
  };

  return (
    <div className="space-y-5 pb-24 md:pb-12">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 font-display">
            Loved Ones
          </h1>
          <p className="text-xs text-neutral-500">
            {contacts.length} of {subscription.contactsLimit} saved
          </p>
        </div>

        <button
          onClick={handleAddNewClick}
          className="min-h-[44px] px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 rounded-xl hover:bg-rose-700 active:scale-[0.98] transition-all shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Add Loved One</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by name, hobby, or note..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 min-h-[44px] text-xs text-neutral-900 bg-white border border-neutral-200 rounded-xl placeholder-neutral-400 focus:outline-none focus:border-rose-500"
          />
        </div>

        {/* Horizontal scrollable relationship pills with generous touch sizing */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
          {['all', 'partner', 'family', 'friend', 'colleague'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterRelationship(type)}
              className={`min-h-[38px] px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all cursor-pointer capitalize whitespace-nowrap shrink-0 ${
                filterRelationship === type
                  ? 'bg-neutral-900 text-white shadow-xs font-semibold'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300'
              }`}
            >
              {type === 'all' ? 'All Roles' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Contacts Grid/Cards */}
      {filteredContacts.length === 0 ? (
        <div className="p-10 text-center rounded-2xl border border-neutral-200 bg-white">
          <User className="w-10 h-10 text-neutral-300 mx-auto mb-2.5" />
          <h3 className="text-sm font-semibold text-neutral-900">No loved ones found</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? 'Try adjusting your search criteria.'
              : 'Add your partner, family members, or close friends to start crafting personalized messages.'}
          </p>
          <button
            onClick={handleAddNewClick}
            className="mt-4 min-h-[44px] px-4 py-2 text-xs font-semibold text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors cursor-pointer"
          >
            Add First Contact
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 hover:border-neutral-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Contact Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div
                    onClick={() => setViewingContact(contact)}
                    className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0"
                  >
                    <img
                      src={contact.avatarUrl || SAMPLE_AVATARS.partner}
                      alt={contact.name}
                      className="w-13 h-13 rounded-full object-cover border border-neutral-200 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-neutral-900 group-hover:text-rose-600 transition-colors truncate">
                        {contact.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-0.5">
                        <span className="font-medium text-neutral-700 capitalize">
                          {getRelationshipLabel(contact.relationship)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize text-neutral-500">{contact.preferredTone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Top quick actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleEditClick(contact)}
                      className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit Contact"
                      aria-label="Edit Contact"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteContact(contact.id)}
                      className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Contact"
                      aria-label="Delete Contact"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Love Language and Key Dates */}
                <div className="mt-3.5 pt-3 border-t border-neutral-100 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="text-neutral-500">Love Language:</span>
                    <span className="font-medium text-neutral-900">
                      {getLoveLanguageLabel(contact.loveLanguage)}
                    </span>
                  </div>

                  {contact.birthDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="text-neutral-500">Birthday:</span>
                      <span className="font-mono text-neutral-800 tabular-nums">
                        {formatDatePretty(contact.birthDate)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Preferences Highlights */}
                {(contact.preferences.favoriteFlowers || contact.preferences.favoriteTreats) && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-neutral-50 border border-neutral-100 text-xs space-y-1">
                    {contact.preferences.favoriteFlowers && (
                      <div className="text-neutral-600 truncate">
                        <span className="font-medium text-neutral-800">Flowers:</span>{' '}
                        {contact.preferences.favoriteFlowers}
                      </div>
                    )}
                    {contact.preferences.favoriteTreats && (
                      <div className="text-neutral-600 truncate">
                        <span className="font-medium text-neutral-800">Treats:</span>{' '}
                        {contact.preferences.favoriteTreats}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card Bottom Touch Actions */}
              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setViewingContact(contact)}
                  className="min-h-[44px] text-xs font-medium text-neutral-600 hover:text-neutral-900 cursor-pointer flex items-center px-1"
                >
                  View Profile
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectForReminder(contact)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center text-xs text-neutral-600 hover:text-neutral-900 bg-neutral-100 rounded-xl transition-colors cursor-pointer"
                    title="Add Reminder"
                    aria-label="Add Reminder"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onSelectForDraft(contact)}
                    className="min-h-[44px] px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                    <span>Craft Note</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Contact Detail Bottom Sheet (Mobile First Drawer) */}
      {viewingContact && (
        <ContactDetailModal
          contact={viewingContact}
          onClose={() => setViewingContact(null)}
          onEdit={() => {
            setEditingContact(viewingContact);
            setViewingContact(null);
            setIsOpenCreateModal(true);
          }}
          onSelectForDraft={() => {
            onSelectForDraft(viewingContact);
            setViewingContact(null);
          }}
        />
      )}

      {/* Create / Edit Bottom Sheet */}
      {isOpenCreateModal && (
        <ContactFormModal
          contact={editingContact}
          onClose={() => setIsOpenCreateModal(false)}
          onSave={(c) => {
            onSaveContact(c);
            setIsOpenCreateModal(false);
          }}
        />
      )}
    </div>
  );
};

// ======================= Detail Modal / Bottom Sheet =======================
interface ContactDetailModalProps {
  contact: Contact;
  onClose: () => void;
  onEdit: () => void;
  onSelectForDraft: () => void;
}

const ContactDetailModal: React.FC<ContactDetailModalProps> = ({
  contact,
  onClose,
  onEdit,
  onSelectForDraft,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 border border-neutral-200 shadow-2xl space-y-5 animate-in slide-in-from-bottom duration-200">
        {/* Mobile Grab Handle Affordance */}
        <div className="sm:hidden w-12 h-1.5 bg-neutral-300 rounded-full mx-auto -mt-1 mb-2" />

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <img
              src={contact.avatarUrl || SAMPLE_AVATARS.partner}
              alt={contact.name}
              className="w-14 h-14 rounded-full object-cover border border-neutral-200"
              referrerPolicy="no-referrer"
            />
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-neutral-900 font-display">{contact.name}</h2>
              <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                <span className="font-medium text-neutral-800 capitalize">
                  {getRelationshipLabel(contact.relationship)}
                </span>
                <span aria-hidden="true">·</span>
                <span>Tone: {contact.preferredTone}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contact info strip */}
        {(contact.email || contact.phone) && (
          <div className="flex flex-wrap gap-3 text-xs text-neutral-600 p-3 bg-neutral-50 rounded-xl border border-neutral-100">
            {contact.email && (
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-neutral-400" />
                <span>{contact.email}</span>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-neutral-400" />
                <span className="font-mono tabular-nums">{contact.phone}</span>
              </div>
            )}
          </div>
        )}

        {/* Love Language and Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-rose-50/60 border border-rose-100 rounded-xl">
            <div className="text-rose-600 font-semibold flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5" />
              <span>Primary Love Language</span>
            </div>
            <div className="mt-1 font-bold text-neutral-900 text-sm">
              {getLoveLanguageLabel(contact.loveLanguage)}
            </div>
          </div>

          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
            <div className="text-neutral-500 font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Key Dates</span>
            </div>
            <div className="mt-1 text-neutral-800 font-mono tabular-nums">
              {contact.birthDate ? `Birthday: ${formatDatePretty(contact.birthDate)}` : 'No birthday set'}
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="space-y-2 text-xs">
          <h4 className="font-semibold text-neutral-900">Personal Preferences</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3.5 bg-neutral-50 rounded-xl border border-neutral-100">
            <div>
              <span className="text-neutral-500 font-medium">Favorite Flowers:</span>
              <p className="text-neutral-800 mt-0.5">{contact.preferences.favoriteFlowers || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-neutral-500 font-medium">Favorite Treats / Foods:</span>
              <p className="text-neutral-800 mt-0.5">{contact.preferences.favoriteTreats || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-neutral-500 font-medium">Hobbies & Passions:</span>
              <p className="text-neutral-800 mt-0.5">{contact.preferences.hobbies || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-neutral-500 font-medium">Dislikes / Avoid:</span>
              <p className="text-neutral-800 mt-0.5">{contact.preferences.dislikes || 'None'}</p>
            </div>
          </div>
        </div>

        {/* Memories */}
        {contact.memories && contact.memories.length > 0 && (
          <div className="space-y-2 text-xs">
            <h4 className="font-semibold text-neutral-900">Shared Memories & Inside Stories</h4>
            <ul className="space-y-1.5 list-disc list-inside text-neutral-700 p-3.5 bg-neutral-50 rounded-xl border border-neutral-100 leading-relaxed">
              {contact.memories.map((m, idx) => (
                <li key={idx}>{m}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Bottom Pinned Touch Actions */}
        <div className="pt-4 border-t border-neutral-200 grid grid-cols-2 gap-3 sticky bottom-0 bg-white">
          <button
            onClick={onEdit}
            className="min-h-[48px] px-3.5 py-2.5 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
          >
            Edit Profile
          </button>
          <button
            onClick={onSelectForDraft}
            className="min-h-[48px] px-4 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Craft AI Note</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ======================= Create / Edit Form Bottom Sheet =======================
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 border border-neutral-200 shadow-2xl animate-in slide-in-from-bottom duration-200">
        <div className="sm:hidden w-12 h-1.5 bg-neutral-300 rounded-full mx-auto -mt-1 mb-3" />

        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 font-display">
              {contact ? 'Edit Loved One' : 'Add a Loved One'}
            </h2>
            <p className="text-xs text-neutral-500">
              Personalized details help Gemini craft authentic messages.
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-neutral-800 mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Amara Vance"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-neutral-200 focus:outline-none focus:border-rose-500 bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-800 mb-1">Relationship Role</label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value as RelationshipType)}
                className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-neutral-200 focus:outline-none focus:border-rose-500 bg-white capitalize"
              >
                <option value="partner">Partner / Spouse</option>
                <option value="family">Family (Parent, Sibling, Child)</option>
                <option value="friend">Close Friend</option>
                <option value="colleague">Colleague / Work</option>
                <option value="mentor">Mentor</option>
              </select>
            </div>
          </div>

          {/* Preset Avatar Selection */}
          <div>
            <label className="block font-semibold text-neutral-800 mb-1.5">Choose Avatar</label>
            <div className="flex items-center gap-3">
              {[SAMPLE_AVATARS.partner, SAMPLE_AVATARS.friend, SAMPLE_AVATARS.family].map(
                (imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(imgUrl)}
                    className={`relative p-0.5 rounded-full border-2 cursor-pointer transition-all min-h-[44px] min-w-[44px] flex items-center justify-center ${
                      avatarUrl === imgUrl
                        ? 'border-rose-600 scale-105'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Avatar option ${idx + 1}`}
                      className="w-12 h-12 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                )
              )}
            </div>
          </div>

          {/* Dates & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-neutral-800 mb-1">Birthday</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-neutral-200 focus:outline-none focus:border-rose-500 bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-800 mb-1">Anniversary</label>
              <input
                type="date"
                value={anniversaryDate}
                onChange={(e) => setAnniversaryDate(e.target.value)}
                className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-neutral-200 focus:outline-none focus:border-rose-500 bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-800 mb-1">WhatsApp / Phone</label>
              <input
                type="text"
                placeholder="+1 555-123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-neutral-200 focus:outline-none focus:border-rose-500 bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-800 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="amara@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-neutral-200 focus:outline-none focus:border-rose-500 bg-white"
              />
            </div>
          </div>

          {/* Love Language & Tone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-neutral-100">
            <div>
              <label className="block font-semibold text-neutral-800 mb-1">Primary Love Language</label>
              <select
                value={loveLanguage}
                onChange={(e) => setLoveLanguage(e.target.value as LoveLanguage)}
                className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-neutral-200 focus:outline-none focus:border-rose-500 bg-white"
              >
                <option value="words_of_affirmation">Words of Affirmation</option>
                <option value="quality_time">Quality Time</option>
                <option value="receiving_gifts">Receiving Gifts</option>
                <option value="acts_of_service">Acts of Service</option>
                <option value="physical_touch">Physical Touch</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-neutral-800 mb-1">Default Tone</label>
              <select
                value={preferredTone}
                onChange={(e) => setPreferredTone(e.target.value as ToneType)}
                className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-neutral-200 focus:outline-none focus:border-rose-500 bg-white capitalize"
              >
                <option value="romantic">Warm & Romantic</option>
                <option value="playful">Playful & Cheeky</option>
                <option value="grateful">Deeply Grateful</option>
                <option value="poetic">Poetic & Reflective</option>
                <option value="cheerful">Cheerful & Uplifting</option>
                <option value="pidgin">Culturally Warm / Pidgin</option>
              </select>
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-2.5 pt-2 border-t border-neutral-100">
            <h4 className="font-semibold text-neutral-900">Favorites & Preferences</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="text"
                placeholder="Favorite Flowers (e.g. White Peonies)"
                value={favoriteFlowers}
                onChange={(e) => setFavoriteFlowers(e.target.value)}
                className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-neutral-200 focus:outline-none focus:border-rose-500 bg-white"
              />
              <input
                type="text"
                placeholder="Favorite Treats (e.g. Dark Chocolate)"
                value={favoriteTreats}
                onChange={(e) => setFavoriteTreats(e.target.value)}
                className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-neutral-200 focus:outline-none focus:border-rose-500 bg-white"
              />
            </div>
          </div>

          {/* Shared memories */}
          <div>
            <label className="block font-semibold text-neutral-800 mb-1">
              Shared Memories (One per line)
            </label>
            <textarea
              rows={2}
              placeholder="Midnight walk in Lisbon&#10;The time our tent broke in the rain"
              value={memoriesText}
              onChange={(e) => setMemoriesText(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-rose-500 bg-white leading-relaxed"
            />
          </div>

          {/* Pinned Bottom CTA Bar */}
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
              Save Loved One
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
