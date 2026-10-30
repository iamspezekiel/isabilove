/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db } from './firebase';
import {
  doc,
  setDoc,
  getDoc,
  getDocFromServer,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { Contact, Reminder, MessageDraft, UserSubscription } from '../types';

export interface FirestoreUserData {
  contacts: Contact[];
  reminders: Reminder[];
  drafts: MessageDraft[];
  subscription: UserSubscription;
}

/**
 * Get the Firestore document reference for a specific user's data.
 * All user data is stored in a single document under users/{uid}/data
 */
function getUserDataDoc(uid: string) {
  return doc(db, 'users', uid, 'data', 'state');
}

/**
 * Save all user data to Firestore (contacts, reminders, drafts, subscription).
 * This overwrites the previous document.
 */
export async function saveUserData(
  uid: string,
  data: Partial<FirestoreUserData>
): Promise<void> {
  const docRef = getUserDataDoc(uid);
  const existing = await getDoc(docRef);
  const existingData = existing.exists() ? existing.data() as FirestoreUserData : {
    contacts: [],
    reminders: [],
    drafts: [],
    subscription: {} as UserSubscription,
  };

  const merged: FirestoreUserData = {
    contacts: data.contacts ?? existingData.contacts,
    reminders: data.reminders ?? existingData.reminders,
    drafts: data.drafts ?? existingData.drafts,
    subscription: data.subscription ?? existingData.subscription,
  };

  await setDoc(docRef, merged, { merge: false });
}

/**
 * Load all user data from Firestore.
 * Returns null if the user has no data yet (new user).
 */
export async function loadUserData(uid: string): Promise<FirestoreUserData | null> {
  try {
    const docSnap = await getDocFromServer(getUserDataDoc(uid));
    if (docSnap.exists()) {
      return docSnap.data() as FirestoreUserData;
    }
    // Try online cache fallback
    const docSnapOnline = await getDoc(getUserDataDoc(uid));
    if (docSnapOnline.exists()) {
      return docSnapOnline.data() as FirestoreUserData;
    }
    return null;
  } catch (error) {
    console.warn('Failed to load user data from Firestore:', error);
    try {
      const docSnap = await getDoc(getUserDataDoc(uid));
      if (docSnap.exists()) {
        return docSnap.data() as FirestoreUserData;
      }
    } catch (e2) {
      console.error('Firestore fallback load also failed:', e2);
    }
    return null;
  }
}

/**
 * Get a user's subscription document, creating a default if it doesn't exist.
 */
export async function getUserSubscription(uid: string): Promise<UserSubscription | null> {
  try {
    const data = await loadUserData(uid);
    return data?.subscription ?? null;
  } catch {
    return null;
  }
}

/**
 * Save just the subscription for a user.
 */
export async function saveUserSubscription(uid: string, subscription: UserSubscription): Promise<void> {
  await saveUserData(uid, { subscription });
}

/**
 * Delete all user data from Firestore (used when user account is deleted or
 * when a returning user starts completely fresh).
 */
export async function deleteAllUserData(uid: string): Promise<void> {
  try {
    await setDoc(getUserDataDoc(uid), {
      contacts: [],
      reminders: [],
      drafts: [],
      subscription: {} as UserSubscription,
    });
  } catch (error) {
    console.warn('Failed to clear user data:', error);
  }
}

/**
 * Save individual collections to Firestore.
 */
export async function saveContacts(uid: string, contacts: Contact[]): Promise<void> {
  await saveUserData(uid, { contacts });
}

export async function saveReminders(uid: string, reminders: Reminder[]): Promise<void> {
  await saveUserData(uid, { reminders });
}

export async function saveDrafts(uid: string, drafts: MessageDraft[]): Promise<void> {
  await saveUserData(uid, { drafts });
}

export async function clearUserData(uid: string): Promise<void> {
  await deleteAllUserData(uid);
}
