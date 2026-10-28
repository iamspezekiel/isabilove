/**
 * Push notification service for IsabiLove PWA
 * Handles subscription, permission requests, and sending push notifications
 */

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';

interface PushSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  url?: string;
  data?: Record<string, unknown>;
}

/**
 * Check if push notifications are supported
 */
export function isPushSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Check if notifications are already granted
 */
export function isNotificationsGranted(): boolean {
  if (typeof window === 'undefined') return false;
  return Notification.permission === 'granted';
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined') return 'denied';
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return 'denied';
  }
  return await Notification.requestPermission();
}

/**
 * Get the current push subscription from the service worker
 */
export async function getPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return null;

    return {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: arrayToBase64(subscription.getKey('p256dh')!),
        auth: arrayToBase64(subscription.getKey('auth')!),
      },
    };
  } catch (err) {
    console.warn('Failed to get push subscription:', err);
    return null;
  }
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!isPushSupported()) {
    console.warn('Push notifications not supported');
    return null;
  }

  const permission = await requestNotificationPermission();
  if (permission !== 'granted') {
    console.warn('Notification permission not granted');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      ...(VAPID_PUBLIC_KEY
        ? { applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as unknown as BufferSource }
        : {}),
    });

    const pushSub: PushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: arrayToBase64(subscription.getKey('p256dh')!),
        auth: arrayToBase64(subscription.getKey('auth')!),
      },
    };

    // Send subscription to server
    await fetch('/api/notifications/subscribe-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pushSub),
    });

    return pushSub;
  } catch (err: any) {
    console.error('Failed to subscribe to push:', err);
    return null;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isPushSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await fetch('/api/notifications/unsubscribe-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
      await subscription.unsubscribe();
    }
    return true;
  } catch (err: any) {
    console.error('Failed to unsubscribe from push:', err);
    return false;
  }
}

/**
 * Send a push notification via the server
 */
export async function sendPushNotification(payload: PushNotificationPayload): Promise<Response> {
  return fetch('/api/notifications/send-push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

/**
 * Convert ArrayBuffer to Base64 URL-safe string
 */
function arrayToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Convert Base64 URL-safe string to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}