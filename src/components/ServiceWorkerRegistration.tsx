"use client";
import { useEffect } from 'react';
import logger from '@/lib/logger';

/**
 * Service Worker Registration Component
 * Handles PWA functionality, offline support, and push notifications
 */
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      registerServiceWorker();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      logger.info('Service Worker registered successfully');

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, inform user
              showUpdateAvailableNotification();
            }
          });
        }
      });

      // Request notification permission for push notifications
      if ('Notification' in window && Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          logger.info('Notification permission granted');
        }
      }

      // Register for background sync
      if ('sync' in window.ServiceWorkerRegistration.prototype) {
        logger.info('Background sync is supported');
      }

    } catch (error) {
      logger.error('Service Worker registration failed:', error);
    }
  };

  const showUpdateAvailableNotification = () => {
    // Create a custom notification or use a toast library
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('อัปเดตใหม่พร้อมใช้งาน', {
        body: 'รีเฟรชหน้าเพื่อใช้เวอร์ชันล่าสุด',
        icon: '/icon-192x192.png',
        tag: 'app-update',
        requireInteraction: true
      });
    } else {
      // Fallback to console or custom UI notification
      logger.info('App update available - please refresh');
    }
  };

  // This component doesn't render anything
  return null;
}