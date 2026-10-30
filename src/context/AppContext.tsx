"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Contact,
  Reminder,
  MessageDraft,
  UserSubscription,
  DeliveryChannel,
} from '../types';
import { useAuth } from '../context/AuthContext';
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
  getDefaultSubscriptionForNewUser,
} from '../services/storage';
import {
  loadUserData,
  saveUserData,
  clearUserData,
} from '../services/firestore';
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
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>(getStoredContacts);
  const [reminders, setReminders] = useState<Reminder[]>(getStoredReminders);
  const [drafts, setDrafts] = useState<MessageDraft[]>(getStoredDrafts);
  const [subscription, setSubscription] = useState<UserSubscription>(getStoredSubscription);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

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

  // ---- Firebase Sync ----
  // When the user changes (sign in, sign up, logout, demo), load/sync data
  useEffect(() => {
    const handleUserChange = async () => {
      if (!user) {
        // No user — reset to empty state
        setContacts([]);
        setReminders([]);
        setDrafts([]);
        setSubscription(getDefaultSubscriptionForNewUser());
        setIsDataLoaded(true);
        return;
      }

      if (user.isGuest) {
        // Guest / demo user — load from localStorage (may include demo data)
        setContacts(getStoredContacts());
        setReminders(getStoredReminders());
        setDrafts(getStoredDrafts());
        setSubscription(getStoredSubscription());
        setIsDataLoaded(true);
        return;
      }

      // Real authenticated user — load from Firebase
      try {
        const data = await loadUserData(user.uid);
        if (data) {
          // Returning user — restore their data
          setContacts(data.contacts || []);
          setReminders(data.reminders || []);
          setDrafts(data.drafts || []);
          setSubscription({
            ...getDefaultSubscriptionForNewUser(user.displayName || undefined, user.email || undefined),
            ...data.subscription,
          });
          // Also save to localStorage for offline fallback
          saveStoredContacts(data.contacts || []);
          saveStoredReminders(data.reminders || []);
          saveStoredDrafts(data.drafts || []);
          saveStoredSubscription({
            ...getDefaultSubscriptionForNewUser(user.displayName || undefined, user.email || undefined),
            ...data.subscription,
          });
        } else {
          // New user — start completely fresh (no demo data)
          setContacts([]);
          setReminders([]);
          setDrafts([]);
          setSubscription(getDefaultSubscriptionForNewUser(user.displayName || undefined, user.email || undefined));
          saveStoredContacts([]);
          saveStoredReminders([]);
          saveStoredDrafts([]);
          saveStoredSubscription(getDefaultSubscriptionForNewUser(user.displayName || undefined, user.email || undefined));
        }
      } catch (error) {
        console.warn('Failed to load user data from Firebase, falling back to localStorage:', error);
        // Fallback: load from localStorage
        setContacts(getStoredContacts());
        setReminders(getStoredReminders());
        setDrafts(getStoredDrafts());
        setSubscription(getStoredSubscription());
      }
      setIsDataLoaded(true);
    };

    handleUserChange();
  }, [user]);

  // Sync data to Firebase whenever it changes (for authenticated, non-guest users)
  useEffect(() => {
    if (!user || user.isGuest || !isDataLoaded) return;

    const syncData = async () => {
      try {
        await saveUserData(user.uid, {
          contacts,
          reminders,
          drafts,
          subscription,
        });
      } catch (error) {
        console.warn('Failed to sync user data to Firebase:', error);
      }
    };

    syncData();
  }, [contacts, reminders, drafts, subscription, user, isDataLoaded]);

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
    // For real (non-guest) users, also clear Firebase data
    if (user && !user.isGuest) {
      clearUserData(user.uid);
    }
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


