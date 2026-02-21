"use client";

import { useState, useEffect } from "react";
import { useNotifications } from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, BellOff, X } from "lucide-react";

export function NotificationPrompt() {
  const { permission, isSupported, isLoading, requestPermission, isEnabled } = useNotifications();
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if user has dismissed the prompt before
    const wasDismissed = localStorage.getItem("kabunav-notification-prompt-dismissed");
    if (wasDismissed) {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("kabunav-notification-prompt-dismissed", "true");
  };

  const handleEnable = async () => {
    const newPermission = await requestPermission();
    if (newPermission === "granted") {
      handleDismiss();
    }
  };

  // Don't render during SSR or if not supported
  if (!mounted || !isSupported || isEnabled || dismissed || permission === "denied") {
    return null;
  }

  return (
    <Card className="mb-4 border-emerald-200 bg-emerald-50">
      <CardContent className="py-3 px-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-full">
              <Bell className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Enable Notifications</p>
              <p className="text-xs text-gray-600">Get notified when your classes are confirmed or cancelled</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleEnable}
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Enable
            </Button>
            <button
              onClick={handleDismiss}
              className="p-1 text-gray-400 hover:text-gray-600"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function NotificationStatus() {
  const { permission, isSupported, requestPermission, isEnabled } = useNotifications();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isSupported) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {isEnabled ? (
        <div className="flex items-center gap-1 text-emerald-600 text-sm">
          <Bell className="h-4 w-4" />
          <span>Notifications on</span>
        </div>
      ) : permission === "denied" ? (
        <div className="flex items-center gap-1 text-red-500 text-sm">
          <BellOff className="h-4 w-4" />
          <span>Blocked</span>
        </div>
      ) : (
        <button
          onClick={requestPermission}
          className="flex items-center gap-1 text-gray-500 hover:text-emerald-600 text-sm transition-colors"
        >
          <BellOff className="h-4 w-4" />
          <span>Enable notifications</span>
        </button>
      )}
    </div>
  );
}
