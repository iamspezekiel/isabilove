"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  auth,
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  logoutUser,
  resetPasswordEmail,
  onAuthStateChanged,
  FirebaseUser,
} from '../services/firebase';
import { ReligionType, GenderType } from '../types';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  religion?: ReligionType;
  gender?: GenderType;
  isGuest?: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  loginGoogle: () => Promise<void>;
  loginEmail: (email: string, pass: string) => Promise<void>;
  signupEmail: (
    email: string,
    pass: string,
    name?: string,
    religion?: ReligionType,
    gender?: GenderType
  ) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_STORAGE_KEY = 'isabilove_guest_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(() => {
    try {
      if (typeof window === 'undefined') return null;
      const savedGuest = localStorage.getItem(GUEST_STORAGE_KEY);
      if (savedGuest) return JSON.parse(savedGuest) as AppUser;
    } catch {
      // ignore
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        let savedProfile: { religion?: ReligionType; gender?: GenderType } = {};
        try {
          const raw = localStorage.getItem(`isabilove_profile_${fbUser.uid}`);
          if (raw) savedProfile = JSON.parse(raw);
        } catch {
          // ignore
        }

        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Loved One Scribe',
          photoURL: fbUser.photoURL,
          religion: savedProfile.religion,
          gender: savedProfile.gender,
        });
        try {
          localStorage.removeItem(GUEST_STORAGE_KEY);
        } catch {
          // ignore
        }
      } else {
        // If there was a guest user saved in localStorage, keep it
        try {
          const savedGuest = localStorage.getItem(GUEST_STORAGE_KEY);
          if (savedGuest) {
            setUser(JSON.parse(savedGuest));
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearError = () => setError(null);

  // Clear all app data from localStorage so new users start completely fresh
  const clearAppLocalStorage = () => {
    localStorage.removeItem('isabi_contacts_v1');
    localStorage.removeItem('isabi_reminders_v1');
    localStorage.removeItem('isabi_drafts_v1');
    localStorage.removeItem('isabi_subscription_v1');
    localStorage.removeItem(GUEST_STORAGE_KEY);
  };

  const loginGoogle = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fbUser = await loginWithGoogle();
      // Clear localStorage so AppContext loads fresh from Firebase
      clearAppLocalStorage();
      setUser({
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName || 'Loved One Scribe',
        photoURL: fbUser.photoURL,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed';
      console.error('Google Sign-in error:', err);
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const fbUser = await loginWithEmail(email, pass);
      // Clear localStorage so AppContext loads fresh from Firebase
      clearAppLocalStorage();
      setUser({
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName || email.split('@')[0]!,
        photoURL: fbUser.photoURL,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign-in failed';
      console.error('Email Sign-in error:', err);
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signupEmail = async (
    email: string,
    pass: string,
    name?: string,
    religion?: ReligionType,
    gender?: GenderType
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const fbUser = await registerWithEmail(email, pass, name);

      // Clear all localStorage data so new users start completely fresh
      // without any demo or mock data
      clearAppLocalStorage();

      const appUser: AppUser = {
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: name || email.split('@')[0]!,
        photoURL: fbUser.photoURL,
        religion: religion || 'christianity',
        gender: gender || 'prefer_not_to_say',
      };
      setUser(appUser);
      try {
        localStorage.setItem(`isabilove_profile_${fbUser.uid}`, JSON.stringify({ religion, gender }));
      } catch {
        // ignore
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      console.error('Email Signup error:', err);
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const sendPasswordReset = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await resetPasswordEmail(email);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Password reset failed';
      console.error('Password reset error:', err);
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsGuest = () => {
    const guestUser: AppUser = {
      uid: 'guest_dev_user',
      email: 'guest@isabilove.demo',
      displayName: 'Demo Companion',
      photoURL: null,
      isGuest: true,
    };
    setUser(guestUser);
    try {
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestUser));
    } catch {
      // ignore
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await logoutUser();
    } catch (err) {
      console.warn('Firebase logout error:', err);
    } finally {
      setUser(null);
      try {
        localStorage.removeItem(GUEST_STORAGE_KEY);
      } catch {
        // ignore
      }
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        clearError,
        loginGoogle,
        loginEmail,
        signupEmail,
        sendPasswordReset,
        loginAsGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}



