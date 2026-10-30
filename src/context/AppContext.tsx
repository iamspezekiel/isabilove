"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Contact,
  Reminder,
  MessageDraft,
  UserSubscription,
  DeliveryChannel,
} from '../types';
import {
  getStoredContacts,
  saveStoredContacts,
  getStoredReminders,
  saveStoredReminders,
  getStoredDrafts,
  saveStoredDrafts,
  getStoredSubscription,
  saveStoredSubscription,
  resetToDemoData,
} from '../services/storage';
import { evaluateScheduler } from '../services/scheduler';

interface AppContextType {
  contacts: Contact[];
  reminders: Reminder[];
  drafts: MessageDraft[];
  subscription: UserSubscription;
  toast: { message: string; type: 'success' | 'info' | 'warning' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
  hideToast: () => void;
  saveContact: (contact: Contact) => void;
  deleteContact: (id: string) => void;
  saveReminder: (reminder: Reminder) => void;
  deleteReminder: (id: string) => void;
  toggleReminderStatus: (id: string) => void;
  approveAndSendDraft: (draft: MessageDraft, channel: DeliveryChannel, logDetails: string) => void;
  updateDraftText: (draftId: string, text: string) => void;
  dismissDraft: (draftId: string) => void;
  saveDraftToQueue: (draft: MessageDraft) => void;
  incrementAiUsage: () => void;
  updateSubscription: (sub: UserSubscription) => void;
  toggleTier: (tier: 'free' | 'pro') => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [contacts, setContacts] = useState<Contact[]>(getStoredContacts);
  const [reminders, setReminders] = useState<Reminder[]>(getStoredReminders);
  const [drafts, setDrafts] = useState<MessageDraft[]>(getStoredDrafts);
  const [subscription, setSubscription] = useState<UserSubscription>(getStoredSubscription);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const hideToast = () => setToast(null);

  // Background scheduler tick
  useEffect(() => {
    const { newDraftsCreated, autoSentDrafts, notifiedEvents } = evaluateScheduler(
      contacts,
      reminders,
      drafts,
      subscription
    );

    if (newDraftsCreated.length > 0 || autoSentDrafts.length > 0) {
      const updatedDrafts = [...drafts, ...newDraftsCreated, ...autoSentDrafts];
      setDrafts(updatedDrafts);
      saveStoredDrafts(updatedDrafts);

      if (notifiedEvents.length > 0) {
        showToast(notifiedEvents[0]!, 'info');
      }
    }
  }, [contacts, reminders]);

  const saveContact = (contact: Contact) => {
    const index = contacts.findIndex((c) => c.id === contact.id);
    let updated: Contact[];
    if (index >= 0) {
      updated = [...contacts];
      updated[index] = contact;
      showToast(`Updated profile for ${contact.name}`);
    } else {
      updated = [...contacts, contact];
      showToast(`Added ${contact.name} to loved ones!`);
    }
    setContacts(updated);
    saveStoredContacts(updated);
  };

  const deleteContact = (id: string) => {
    const contact = contacts.find((c) => c.id === id);
    const updatedContacts = contacts.filter((c) => c.id !== id);
    const updatedReminders = reminders.filter((r) => r.contactId !== id);
    setContacts(updatedContacts);
    setReminders(updatedReminders);
    saveStoredContacts(updatedContacts);
    saveStoredReminders(updatedReminders);
    showToast(`Removed ${contact ? contact.name : 'contact'} and reminders`, 'info');
  };

  const saveReminder = (reminder: Reminder) => {
    const index = reminders.findIndex((r) => r.id === reminder.id);
    let updated: Reminder[];
    if (index >= 0) {
      updated = [...reminders];
      updated[index] = reminder;
      showToast('Reminder schedule updated');
    } else {
      updated = [...reminders, reminder];
      showToast('New reminder scheduled!');
    }
    setReminders(updated);
    saveStoredReminders(updated);
  };

  const deleteReminder = (id: string) => {
    const updated = reminders.filter((r) => r.id !== id);
    setReminders(updated);
    saveStoredReminders(updated);
    showToast('Reminder deleted', 'info');
  };

  const toggleReminderStatus = (id: string) => {
    const updated = reminders.map((r) => {
      if (r.id === id) {
        const nextStatus = r.status === 'active' ? 'paused' : 'active';
        showToast(`Schedule ${nextStatus === 'active' ? 'resumed' : 'paused'}`, 'info');
        return { ...r, status: nextStatus as 'active' | 'paused' };
      }
      return r;
    });
    setReminders(updated);
    saveStoredReminders(updated);
  };

  const approveAndSendDraft = (draft: MessageDraft, channel: DeliveryChannel, logDetails: string) => {
    const updated = drafts.map((d) => {
      if (d.id === draft.id) {
        return {
          ...d,
          status: 'sent' as const,
          channel,
          sentAt: new Date().toISOString(),
          deliveryLog: {
            timestamp: new Date().toISOString(),
            method: channel === 'whatsapp' ? 'WhatsApp Web' : channel === 'email' ? 'Email Gateway' : 'Webhook Trigger',
            status: 'delivered' as const,
            recipient: logDetails,
            details: logDetails,
          },
        };
      }
      return d;
    });

    setDrafts(updated);
    saveStoredDrafts(updated);
    showToast(`Message approved & dispatched via ${channel.toUpperCase()}!`, 'success');
  };

  const updateDraftText = (draftId: string, text: string) => {
    const updated = drafts.map((d) => {
      if (d.id === draftId) {
        return { ...d, customizedText: text };
      }
      return d;
    });
    setDrafts(updated);
    saveStoredDrafts(updated);
    showToast('Draft edits saved', 'info');
  };

  const dismissDraft = (draftId: string) => {
    const updated = drafts.filter((d) => d.id !== draftId);
    setDrafts(updated);
    saveStoredDrafts(updated);
    showToast('Draft dismissed', 'info');
  };

  const saveDraftToQueue = (draft: MessageDraft) => {
    const index = drafts.findIndex((d) => d.id === draft.id);
    let updated: MessageDraft[];
    if (index >= 0) {
      updated = [...drafts];
      updated[index] = draft;
    } else {
      updated = [draft, ...drafts];
    }
    setDrafts(updated);
    saveStoredDrafts(updated);
    showToast('Saved to your In-App Approval Queue!');
  };

  const incrementAiUsage = () => {
    const updated: UserSubscription = {
      ...subscription,
      aiDraftsUsed: subscription.aiDraftsUsed + 1,
    };
    setSubscription(updated);
    saveStoredSubscription(updated);
  };

  const updateSubscription = (sub: UserSubscription) => {
    setSubscription(sub);
    saveStoredSubscription(sub);
    showToast('Settings saved successfully');
  };

  const toggleTier = (tier: 'free' | 'pro') => {
    const updated: UserSubscription = {
      ...subscription,
      tier,
      contactsLimit: tier === 'pro' ? 9999 : 3,
      aiDraftsLimit: tier === 'pro' ? 500 : 10,
    };
    setSubscription(updated);
    saveStoredSubscription(updated);
    showToast(
      tier === 'pro' ? '🎉 Pro Plan activated with unlimited contacts!' : 'Switched to Free Tier',
      'success'
    );
  };

  const resetAllData = () => {
    resetToDemoData();
    setContacts(getStoredContacts());
    setReminders(getStoredReminders());
    setDrafts(getStoredDrafts());
    setSubscription(getStoredSubscription());
    showToast('Reset to original sample data', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        contacts,
        reminders,
        drafts,
        subscription,
        toast,
        showToast,
        hideToast,
        saveContact,
        deleteContact,
        saveReminder,
        deleteReminder,
        toggleReminderStatus,
        approveAndSendDraft,
        updateDraftText,
        dismissDraft,
        saveDraftToQueue,
        incrementAiUsage,
        updateSubscription,
        toggleTier,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}


