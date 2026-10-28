import { Contact, Reminder, MessageDraft, UserSubscription } from '../types';

const STORAGE_KEYS = {
  CONTACTS: 'isabi_contacts_v1',
  REMINDERS: 'isabi_reminders_v1',
  DRAFTS: 'isabi_drafts_v1',
  SUBSCRIPTION: 'isabi_subscription_v1',
};

// Seed avatars generated specifically for IsabiLove
export const SAMPLE_AVATARS = {
  partner: '/src/assets/images/avatar_partner_1792816163693.jpg',
  friend: '/src/assets/images/avatar_friend_1792816163998.jpg',
  family: '/src/assets/images/avatar_family_1792816164677.jpg',
  hero: '/src/assets/images/hero_relationship_1792816164710.jpg',
};

// Calculate relative dates so sample data is dynamically relevant
function getFutureDate(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
}

function getPastDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

const DEFAULT_CONTACTS: Contact[] = [
  {
    id: 'contact_1',
    name: 'Amara Vance',
    relationship: 'partner',
    avatarUrl: SAMPLE_AVATARS.partner,
    birthDate: getFutureDate(5), // 5 days from today
    anniversaryDate: getFutureDate(42),
    phone: '+1 (555) 234-5678',
    email: 'amara.vance@example.com',
    loveLanguage: 'words_of_affirmation',
    preferences: {
      favoriteFlowers: 'White Peonies and Eucalyptus',
      favoriteTreats: 'Dark chocolate sea-salt caramels, Earl Grey latte',
      favoriteColors: 'Terracotta and Forest Green',
      hobbies: 'Architectural photography, ceramics, weekend farmers markets',
      dislikes: 'Artificial fragrances, rushed mornings, crowded malls',
    },
    memories: [
      'Midnight stroll across the river in Lisbon eating pastel de nata',
      'The rainy Sunday we spent building the bookshelf with zero instructions',
      'Dancing barefoot in the kitchen while making homemade pasta',
    ],
    importantNotes: 'Appreciates handwritten notes tucked into her coat pocket. Loves morning check-ins before 9 AM.',
    preferredTone: 'romantic',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'contact_2',
    name: 'Marcus Cole',
    relationship: 'friend',
    avatarUrl: SAMPLE_AVATARS.friend,
    birthDate: getFutureDate(18),
    phone: '+1 (555) 876-5432',
    email: 'marcus.cole@example.com',
    loveLanguage: 'quality_time',
    preferences: {
      favoriteFlowers: 'Monstera or Bonsai plants',
      favoriteTreats: 'Single-origin Ethiopian pour-over coffee, spicy ramen',
      favoriteColors: 'Indigo and Slate',
      hobbies: 'Trail running, vinyl records, specialty coffee brewing',
      dislikes: 'Generic corporate gifts, slow Wi-Fi',
    },
    memories: [
      'College hackathon 48-hour sprint powered by cold brew',
      'Camping in Big Sur when our tent collapsed during the storm',
    ],
    importantNotes: 'Always down for a spontaneous coffee catch-up. Keep humor cheeky and real.',
    preferredTone: 'playful',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'contact_3',
    name: 'Mama Helen',
    relationship: 'family',
    avatarUrl: SAMPLE_AVATARS.family,
    birthDate: getFutureDate(32),
    phone: '+1 (555) 432-1098',
    email: 'helen.taylor@example.com',
    loveLanguage: 'acts_of_service',
    preferences: {
      favoriteFlowers: 'Yellow Garden Roses',
      favoriteTreats: 'Freshly baked shortbread cookies, ginger herbal tea',
      favoriteColors: 'Warm Honey and Ivory',
      hobbies: 'Gardening, book club, gospel choir',
      dislikes: 'Late night phone calls, loud restaurants',
    },
    memories: [
      'Her Sunday family dinners with legendary jollof rice and laughter',
      'Quiet advice on the front porch whenever life felt overwhelming',
    ],
    importantNotes: 'Loves phone calls on Sunday afternoons. Highly appreciative of heartfelt thank-you notes.',
    preferredTone: 'grateful',
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_REMINDERS: Reminder[] = [
  {
    id: 'rem_1',
    contactId: 'contact_1',
    occasionType: 'birthday',
    title: "Amara's Birthday Celebration",
    eventDate: getFutureDate(5),
    advanceDays: [7, 2, 0],
    cadence: 'annual',
    channel: 'queue',
    requireApproval: true,
    status: 'active',
    notes: 'Gift ideas: Peonies and the ceramic vase she saw at the pottery studio.',
  },
  {
    id: 'rem_2',
    contactId: 'contact_1',
    occasionType: 'anniversary',
    title: 'Relationship Anniversary',
    eventDate: getFutureDate(42),
    advanceDays: [14, 3, 0],
    cadence: 'annual',
    channel: 'whatsapp',
    requireApproval: true,
    status: 'active',
    notes: 'Book table at the rooftop Italian restaurant.',
  },
  {
    id: 'rem_3',
    contactId: 'contact_2',
    occasionType: 'birthday',
    title: "Marcus's 30th Birthday",
    eventDate: getFutureDate(18),
    advanceDays: [7, 0],
    cadence: 'annual',
    channel: 'queue',
    requireApproval: true,
    status: 'active',
    notes: 'Grab that limited edition vinyl he mentioned.',
  },
  {
    id: 'rem_4',
    contactId: 'contact_3',
    occasionType: 'check_in',
    title: 'Monthly Mama Helen Check-In',
    eventDate: getFutureDate(2),
    advanceDays: [1, 0],
    cadence: 'monthly',
    channel: 'email',
    requireApproval: false,
    status: 'active',
    notes: 'Ask about her garden and send a warm update.',
  },
];

const DEFAULT_DRAFTS: MessageDraft[] = [
  {
    id: 'draft_1',
    reminderId: 'rem_1',
    contactId: 'contact_1',
    occasion: 'birthday',
    customOccasionTitle: "Amara's Birthday",
    tone: 'romantic',
    generatedText:
      "Happy Birthday, my beautiful Amara. From the quiet morning coffees to our spontaneous adventures, every day by your side feels like poetry. Thank you for filling our world with warmth, kindness, and that radiant smile of yours. Today is all about celebrating the incredible woman you are. I love you endlessly.",
    customizedText:
      "Happy Birthday, my beautiful Amara. From the quiet morning coffees to our spontaneous adventures, every day by your side feels like poetry. Thank you for filling our world with warmth, kindness, and that radiant smile of yours. Today is all about celebrating the incredible woman you are. I love you endlessly.",
    suggestedGifts: [
      'Fresh bouquet of white peonies with a handwritten envelope note',
      'The minimalist terracotta ceramic vase from the artisan studio in Lisbon',
      'Surprise sunset reservations at her favorite bistro',
    ],
    deliveryTip: 'Deliver in the morning with a fresh Earl Grey latte.',
    status: 'pending_approval',
    scheduledDate: getFutureDate(5),
    channel: 'queue',
  },
  {
    id: 'draft_2',
    reminderId: 'rem_4',
    contactId: 'contact_3',
    occasion: 'check_in',
    customOccasionTitle: 'Monthly Love Check-in',
    tone: 'grateful',
    generatedText:
      'Good morning Mama Helen! Just took a quiet moment this morning to think of you and how blessed I am to have your love and wisdom in my corner. Hope your garden is blooming and you are getting good rest today. Sending you the warmest hug and so much love!',
    customizedText:
      'Good morning Mama Helen! Just took a quiet moment this morning to think of you and how blessed I am to have your love and wisdom in my corner. Hope your garden is blooming and you are getting good rest today. Sending you the warmest hug and so much love!',
    suggestedGifts: [
      'Yellow garden rose tea tin',
      'Sunday evening home-cooked dinner visit',
      'Framed photo from last holiday',
    ],
    deliveryTip: 'Best sent around 11 AM when she is in the garden.',
    status: 'sent',
    scheduledDate: getPastDate(1),
    channel: 'email',
    sentAt: new Date(Date.now() - 86400000).toISOString(),
    deliveryLog: {
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      method: 'Email Dispatch',
      status: 'delivered',
      recipient: 'helen.taylor@example.com',
      details: 'Delivered via IsabiLove notification gateway (SMTP verified).',
    },
  },
];

const DEFAULT_SUBSCRIPTION: UserSubscription = {
  tier: 'free',
  contactsLimit: 999999,
  aiDraftsLimit: 999999,
  aiDraftsUsed: 2,
  billingCycle: 'monthly',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York',
  userName: 'Alex Taylor',
  userEmail: 'alex.taylor@example.com',
  userPhone: '+1 (555) 901-2345',
  webhookUrl: '',
  autoSendAuthorized: false,
  morningWindow: '08:30',
  eveningWindow: '20:00',
  defaultTone: 'grateful',
  defaultScriptureTranslation: 'NWT',
  defaultDeliveryChannel: 'queue',
  religion: 'christianity',
  gender: 'prefer_not_to_say',
  sabbathMode: true,
  sabbathDay: 'sunday',
  quietHoursEnabled: true,
  weeklyDigestEnabled: true,
  advanceNoticeDays: [7, 3, 0],
  nextBillingDate: '',
  paymentMethodLast4: '',
};

export function getStoredContacts(): Contact[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONTACTS);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredContacts(contacts: Contact[]): void {
  localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
}

export function getStoredReminders(): Reminder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredReminders(reminders: Reminder[]): void {
  localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
}

export function getStoredDrafts(): MessageDraft[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DRAFTS);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredDrafts(drafts: MessageDraft[]): void {
  localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(drafts));
}

export function getStoredSubscription(): UserSubscription {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
    if (!raw) {
      const fresh: UserSubscription = {
        ...DEFAULT_SUBSCRIPTION,
        contactsLimit: 3,
        aiDraftsLimit: 10,
        aiDraftsUsed: 0,
      };
      saveStoredSubscription(fresh);
      return fresh;
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SUBSCRIPTION,
      ...parsed,
      contactsLimit: 999999,
      aiDraftsLimit: 999999,
    };
  } catch {
    return {
      ...DEFAULT_SUBSCRIPTION,
      contactsLimit: 3,
      aiDraftsLimit: 10,
      aiDraftsUsed: 0,
    };
  }
}

export function saveStoredSubscription(sub: UserSubscription): void {
  localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(sub));
}

export function exportBackupData(): string {
  const payload = {
    app: 'IsabiLove',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    contacts: getStoredContacts(),
    reminders: getStoredReminders(),
    drafts: getStoredDrafts(),
    subscription: getStoredSubscription(),
  };
  return JSON.stringify(payload, null, 2);
}

export function importBackupData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.contacts && Array.isArray(data.contacts)) {
      saveStoredContacts(data.contacts);
    }
    if (data.reminders && Array.isArray(data.reminders)) {
      saveStoredReminders(data.reminders);
    }
    if (data.drafts && Array.isArray(data.drafts)) {
      saveStoredDrafts(data.drafts);
    }
    if (data.subscription) {
      saveStoredSubscription(data.subscription);
    }
    return true;
  } catch (e) {
    console.error('Failed to import backup data:', e);
    return false;
  }
}

export function resetToDemoData(): void {
  saveStoredContacts(DEFAULT_CONTACTS);
  saveStoredReminders(DEFAULT_REMINDERS);
  saveStoredDrafts(DEFAULT_DRAFTS);
  saveStoredSubscription(DEFAULT_SUBSCRIPTION);
}
