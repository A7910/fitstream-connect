import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

const VAPID_PUBLIC_KEY = 'YOUR_VAPID_PUBLIC_KEY'; // Replace with your actual VAPID public key

export const usePushNotifications = () => {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('serviceWorker' in navigator && 'Notification' in window) {
      // Register service worker
      navigator.serviceWorker.register('/service-worker.js')
        .then(reg => {
          setRegistration(reg);
          setPermission(Notification.permission);
        })
        .catch(console.error);
    }
  }, []);

  const subscribeToNotifications = async () => {
    try {
      if (!registration) return;

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: VAPID_PUBLIC_KEY
      });

      setSubscription(sub);

      // Store subscription in user's profile
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Convert PushSubscriptionJSON to a plain object that matches our Json type
        const subscriptionData = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.toJSON().keys?.p256dh,
            auth: sub.toJSON().keys?.auth
          }
        } as Json;

        await supabase
          .from('profiles')
          .update({ push_subscription: subscriptionData })
          .eq('id', session.user.id);
      }

      return sub;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      throw error;
    }
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      console.error('This browser does not support notifications');
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === 'granted') {
      await subscribeToNotifications();
    }
  };

  return {
    subscription,
    permission,
    requestPermission,
    isSupported: 'Notification' in window && 'serviceWorker' in navigator
  };
};