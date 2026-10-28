/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';

import { ProtectedRoute } from './components/ProtectedRoute';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';

// Standalone Pages
import { DashboardPage } from './pages/DashboardPage';
import { ContactsPage } from './pages/ContactsPage';
import { ContactProfilePage } from './pages/ContactProfilePage';
import { RemindersPage } from './pages/RemindersPage';
import { QueuePage } from './pages/QueuePage';
import { StudioPage } from './pages/StudioPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { AccountPage } from './pages/AccountPage';
import { AuthPage } from './pages/AuthPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <PWAInstallPrompt />
          <Routes>
            <Route element={<Layout />}>
              {/* Public Auth Routes */}
              <Route path="/login" element={<AuthPage initialMode="login" />} />
              <Route path="/signup" element={<AuthPage initialMode="signup" />} />
              <Route path="/forgot-password" element={<AuthPage initialMode="forgot" />} />
              <Route path="/reset-password" element={<Navigate to="/forgot-password" replace />} />
              <Route path="/demo" element={<AuthPage initialMode="login" />} />

              {/* Protected App Routes - Mandatory Authentication */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/contacts" element={<ContactsPage />} />
                <Route path="/contacts/:id" element={<ContactProfilePage />} />
                <Route path="/reminders" element={<RemindersPage />} />
                <Route path="/queue" element={<QueuePage />} />
                <Route path="/studio" element={<StudioPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/profile" element={<Navigate to="/account" replace />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/subscription" element={<Navigate to="/" replace />} />
                <Route path="/pricing" element={<Navigate to="/" replace />} />
                <Route path="/upgrade" element={<Navigate to="/" replace />} />
              </Route>

              {/* Catch-all 404 page */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
