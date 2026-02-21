"use client";

import { useState, useEffect, useCallback } from "react";
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  registerServiceWorker,
  NotificationPermission,
} from "@/lib/notifications";

export interface UseNotificationsReturn {
  permission: NotificationPermission;
  isSupported: boolean;
  isLoading: boolean;
  requestPermission: () => Promise<NotificationPermission>;
  isEnabled: boolean;
}

export function useNotifications(): UseNotificationsReturn {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const supported = isNotificationSupported();
      setIsSupported(supported);

      if (supported) {
        setPermission(getNotificationPermission());
        // Register service worker
        await registerServiceWorker();
      }

      setIsLoading(false);
    };

    init();
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return "denied" as NotificationPermission;

    setIsLoading(true);
    const newPermission = await requestNotificationPermission();
    setPermission(newPermission);
    setIsLoading(false);
    return newPermission;
  }, [isSupported]);

  return {
    permission,
    isSupported,
    isLoading,
    requestPermission,
    isEnabled: permission === "granted",
  };
}
