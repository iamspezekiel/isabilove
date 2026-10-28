export type RelationshipType = 'partner' | 'family' | 'friend' | 'colleague' | 'mentor';

export type LoveLanguage = 
  | 'words_of_affirmation' 
  | 'quality_time' 
  | 'receiving_gifts' 
  | 'acts_of_service' 
  | 'physical_touch';

export type OccasionType = 
  | 'birthday' 
  | 'anniversary' 
  | 'check_in' 
  | 'milestone' 
  | 'valentines' 
  | 'custom';

export type CadenceType = 'once' | 'annual' | 'monthly' | 'weekly' | 'custom';

export type DeliveryChannel = 'queue' | 'email' | 'webhook' | 'whatsapp';

export type ReligionType = 'christianity' | 'muslim' | 'none';
export type GenderType = 'female' | 'male' | 'prefer_not_to_say';

export type ToneType = 
  | 'romantic' 
  | 'playful' 
  | 'grateful' 
  | 'poetic' 
  | 'cheerful' 
  | 'pidgin';

export interface ContactPreferences {
  favoriteFlowers?: string;
  favoriteTreats?: string;
  favoriteColors?: string;
  hobbies?: string;
  dislikes?: string;
}

export interface Contact {
  id: string;
  name: string;
  relationship: RelationshipType;
  avatarUrl: string;
  birthDate?: string; // YYYY-MM-DD
  anniversaryDate?: string; // YYYY-MM-DD
  phone?: string;
  email?: string;
  loveLanguage: LoveLanguage;
  preferences: ContactPreferences;
  memories: string[];
  importantNotes?: string;
  preferredTone: ToneType;
  createdAt: string;
}

export interface Reminder {
  id: string;
  contactId: string;
  occasionType: OccasionType;
  title: string;
  eventDate: string; // YYYY-MM-DD
  advanceDays: number[]; // e.g. [7, 0] for 7 days before and day of
  cadence: CadenceType;
  channel: DeliveryChannel;
  requireApproval: boolean;
  status: 'active' | 'paused';
  notes?: string;
}

export interface DeliveryLog {
  timestamp: string;
  method: string;
  status: 'delivered' | 'opened_in_client' | 'webhook_dispatched' | 'simulated';
  recipient: string;
  details?: string;
}

export interface MessageDraft {
  id: string;
  reminderId?: string;
  contactId: string;
  occasion: string;
  customOccasionTitle?: string;
  tone: ToneType;
  generatedText: string;
  customizedText: string;
  suggestedGifts: string[];
  deliveryTip?: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'sent' | 'dismissed';
  scheduledDate: string;
  channel: DeliveryChannel;
  sentAt?: string;
  deliveryLog?: DeliveryLog;
}

export interface UserSubscription {
  tier: 'free' | 'pro';
  contactsLimit: number;
  aiDraftsLimit: number;
  aiDraftsUsed: number;
  billingCycle: 'monthly' | 'yearly';
  timezone: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  webhookUrl?: string;
  autoSendAuthorized: boolean;
  morningWindow?: string;
  eveningWindow?: string;
  defaultTone?: ToneType;
  defaultScriptureTranslation?: string;
  defaultDeliveryChannel?: DeliveryChannel;
  religion?: ReligionType;
  gender?: GenderType;
  sabbathMode?: boolean;
  sabbathDay?: 'sunday' | 'saturday';
  quietHoursEnabled?: boolean;
  weeklyDigestEnabled?: boolean;
  advanceNoticeDays?: number[];
  covenantCodeApplied?: string;
  nextBillingDate?: string;
  paymentMethodLast4?: string;
}

export type ActiveTab = 'dashboard' | 'contacts' | 'reminders' | 'queue' | 'studio' | 'history' | 'settings';
