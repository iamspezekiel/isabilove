import { Contact, Reminder, MessageDraft, UserSubscription, LoveLanguage, RelationshipType } from '../types';

export function getDaysUntil(dateString: string): number {
  if (!dateString) return 999;
  const target = new Date(dateString);
  const now = new Date();
  
  // Set both to midnight for pure day comparison
  const tMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const nMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  
  const diffTime = tMidnight - nMidnight;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function formatDatePretty(dateString?: string): string {
  if (!dateString) return 'Not set';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getLoveLanguageLabel(lang: LoveLanguage): string {
  switch (lang) {
    case 'words_of_affirmation':
      return 'Words of Affirmation';
    case 'quality_time':
      return 'Quality Time';
    case 'receiving_gifts':
      return 'Receiving Gifts';
    case 'acts_of_service':
      return 'Acts of Service';
    case 'physical_touch':
      return 'Physical Touch';
    default:
      return 'Thoughtfulness';
  }
}

export function getRelationshipLabel(rel: RelationshipType): string {
  switch (rel) {
    case 'partner':
      return 'Partner';
    case 'family':
      return 'Family';
    case 'friend':
      return 'Friend';
    case 'colleague':
      return 'Colleague';
    case 'mentor':
      return 'Mentor';
    default:
      return 'Loved One';
  }
}

export interface SchedulerCheckResult {
  newDraftsCreated: MessageDraft[];
  autoSentDrafts: MessageDraft[];
  notifiedEvents: string[];
}

export function evaluateScheduler(
  contacts: Contact[],
  reminders: Reminder[],
  existingDrafts: MessageDraft[],
  subscription: UserSubscription
): SchedulerCheckResult {
  const newDraftsCreated: MessageDraft[] = [];
  const autoSentDrafts: MessageDraft[] = [];
  const notifiedEvents: string[] = [];

  for (const reminder of reminders) {
    if (reminder.status !== 'active') continue;

    const contact = contacts.find((c) => c.id === reminder.contactId);
    if (!contact) continue;

    const daysUntil = getDaysUntil(reminder.eventDate);

    // If within any advance notification window (e.g. 7 days or less, down to 0)
    const matchesAdvance = reminder.advanceDays.some((adv) => daysUntil === adv || (daysUntil >= 0 && daysUntil <= adv));

    if (matchesAdvance && daysUntil >= 0) {
      // Check if a draft already exists for this reminder
      const alreadyDrafted = existingDrafts.some(
        (d) => d.reminderId === reminder.id && (d.status === 'pending_approval' || d.status === 'draft' || d.status === 'sent')
      );

      if (!alreadyDrafted) {
        // Create draft
        const draftId = `draft_auto_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const occTitle = reminder.title || reminder.occasionType;
        
        let initialText = `Happy ${occTitle}, ${contact.name}! Celebrating your presence in my life today. Thank you for your warmth and love!`;
        if (contact.preferredTone === 'romantic') {
          initialText = `My dearest ${contact.name}, happy ${occTitle}. You bring so much joy, love, and light into every single day. I celebrate you with all my heart.`;
        }

        const draft: MessageDraft = {
          id: draftId,
          reminderId: reminder.id,
          contactId: contact.id,
          occasion: reminder.occasionType,
          customOccasionTitle: reminder.title,
          tone: contact.preferredTone,
          generatedText: initialText,
          customizedText: initialText,
          suggestedGifts: [
            contact.preferences.favoriteFlowers ? `Bouquet of ${contact.preferences.favoriteFlowers}` : 'Custom flower arrangement',
            contact.preferences.favoriteTreats ? `Box of ${contact.preferences.favoriteTreats}` : 'Curated sweet treats',
            'Handwritten card with personal memories',
          ],
          deliveryTip: 'Deliver in the morning for best emotional impact.',
          status: 'pending_approval',
          scheduledDate: reminder.eventDate,
          channel: reminder.channel,
        };

        if (!reminder.requireApproval && subscription.autoSendAuthorized) {
          draft.status = 'sent';
          draft.sentAt = new Date().toISOString();
          draft.deliveryLog = {
            timestamp: new Date().toISOString(),
            method: `Auto-Dispatch (${reminder.channel})`,
            status: 'delivered',
            recipient: contact.email || contact.phone || contact.name,
            details: 'Automatically authorized and dispatched without manual queue delay.',
          };
          autoSentDrafts.push(draft);
          notifiedEvents.push(`Auto-sent message for ${contact.name} (${reminder.title})`);
        } else {
          newDraftsCreated.push(draft);
          notifiedEvents.push(`Draft prepared for ${contact.name} (${reminder.title}) - Needs your approval`);
        }
      }
    }
  }

  return { newDraftsCreated, autoSentDrafts, notifiedEvents };
}
