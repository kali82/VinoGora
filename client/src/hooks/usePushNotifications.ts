import { useState, useCallback, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";

interface PushState {
  supported: boolean;
  permission: NotificationPermission;
  subscribed: boolean;
}

export function usePushNotifications(userId?: string) {
  const [state, setState] = useState<PushState>({
    supported: false,
    permission: "default",
    subscribed: false,
  });

  useEffect(() => {
    const supported = "Notification" in window && "serviceWorker" in navigator;
    setState((s) => ({
      ...s,
      supported,
      permission: supported ? Notification.permission : "denied",
    }));
  }, []);

  const requestPermission = useCallback(async () => {
    if (!state.supported) return false;

    const permission = await Notification.requestPermission();
    setState((s) => ({ ...s, permission }));

    if (permission !== "granted") return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
        if (!vapidKey) {
          console.warn("VITE_VAPID_PUBLIC_KEY not set");
          return false;
        }
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidKey,
        });
      }

      if (userId) {
        await apiRequest("POST", "/api/push/subscribe", {
          userId,
          subscription: subscription.toJSON(),
        });
      }

      setState((s) => ({ ...s, subscribed: true }));
      return true;
    } catch (err) {
      console.error("Push subscription failed:", err);
      return false;
    }
  }, [state.supported, userId]);

  return { ...state, requestPermission };
}
