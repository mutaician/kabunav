// Notification utilities for KabuNav PWA

export type NotificationPermission = "default" | "granted" | "denied";

export interface ClassNotificationData {
  title: string;
  body: string;
  courseCode: string;
  courseName: string;
  status: "confirmed" | "cancelled" | "pending";
  venue?: string;
  time?: string;
  url?: string;
}

/**
 * Check if the browser supports notifications
 */
export function isNotificationSupported(): boolean {
  return "Notification" in window && "serviceWorker" in navigator;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return "denied";
  return Notification.permission;
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    console.warn("Notifications not supported in this browser");
    return "denied";
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return "denied";
  }
}

/**
 * Register the service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) {
    console.warn("Service Worker not supported");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });
    console.log("Service Worker registered:", registration.scope);
    return registration;
  } catch (error) {
    console.error("Service Worker registration failed:", error);
    return null;
  }
}

/**
 * Show a local notification (doesn't require push subscription)
 */
export async function showLocalNotification(
  data: ClassNotificationData
): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  
  if (Notification.permission !== "granted") {
    console.warn("Notification permission not granted");
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    const statusEmoji = {
      confirmed: "✅",
      cancelled: "❌",
      pending: "⏳",
    }[data.status];

    const options: NotificationOptions & { vibrate?: number[] } = {
      body: data.body,
      icon: "/icons/icon.svg",
      badge: "/icons/icon.svg",
      tag: `class-${data.courseCode}-${Date.now()}`,
      requireInteraction: data.status === "cancelled",
      data: {
        url: data.url || "/dashboard",
        courseCode: data.courseCode,
        status: data.status,
      },
    };

    await registration.showNotification(
      `${statusEmoji} ${data.title}`,
      options
    );
    
    return true;
  } catch (error) {
    console.error("Error showing notification:", error);
    
    // Fallback to basic Notification API
    try {
      new Notification(data.title, {
        body: data.body,
        icon: "/icons/icon.svg",
      });
      return true;
    } catch (fallbackError) {
      console.error("Fallback notification failed:", fallbackError);
      return false;
    }
  }
}

/**
 * Show class confirmation notification
 */
export function notifyClassConfirmed(
  courseCode: string,
  courseName: string,
  venue?: string,
  time?: string
): Promise<boolean> {
  return showLocalNotification({
    title: `${courseCode} Confirmed`,
    body: `${courseName} is happening${venue ? ` at ${venue}` : ""}${time ? ` at ${time}` : ""}. Get ready!`,
    courseCode,
    courseName,
    status: "confirmed",
    venue,
    time,
    url: "/dashboard/student",
  });
}

/**
 * Show class cancellation notification
 */
export function notifyClassCancelled(
  courseCode: string,
  courseName: string,
  reason?: string
): Promise<boolean> {
  return showLocalNotification({
    title: `${courseCode} Cancelled`,
    body: reason 
      ? `${courseName} has been cancelled. Reason: ${reason}`
      : `${courseName} has been cancelled.`,
    courseCode,
    courseName,
    status: "cancelled",
    url: "/dashboard/student",
  });
}

/**
 * Show reminder notification for pending class
 */
export function notifyClassReminder(
  courseCode: string,
  courseName: string,
  minutesUntil: number,
  venue?: string
): Promise<boolean> {
  return showLocalNotification({
    title: `${courseCode} in ${minutesUntil} min`,
    body: `${courseName}${venue ? ` at ${venue}` : ""} - Status still pending! Check with your lecturer.`,
    courseCode,
    courseName,
    status: "pending",
    venue,
    url: "/dashboard/student",
  });
}

/**
 * Subscribe to push notifications (for future server-side push)
 */
export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!isNotificationSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // For demo purposes, we'll use local notifications
    // In production, you'd use VAPID keys for real push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      // In production, use your VAPID public key:
      // applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    console.log("Push subscription:", subscription);
    return subscription;
  } catch (error) {
    console.error("Error subscribing to push:", error);
    return null;
  }
}

/**
 * Check if push is subscribed
 */
export async function isPushSubscribed(): Promise<boolean> {
  if (!isNotificationSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch {
    return false;
  }
}
