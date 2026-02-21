"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Check if dismissed
    const wasDismissed = localStorage.getItem("kabunav-install-prompt-dismissed");
    if (wasDismissed) {
      setDismissed(true);
    }

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for successful install
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;

    if (choice.outcome === "accepted") {
      setIsInstalled(true);
    }
    setInstallPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("kabunav-install-prompt-dismissed", "true");
  };

  // Don't show if not mounted, installed, dismissed, or no prompt available
  if (!mounted || isInstalled || dismissed || !installPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-40">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-emerald-100 rounded-lg">
          <Download className="h-5 w-5 text-emerald-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">Install KabuNav</h3>
          <p className="text-sm text-gray-600 mt-1">
            Add to home screen for the best experience with offline support & push notifications.
          </p>
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={handleInstall} className="bg-emerald-600 hover:bg-emerald-700">
              Install
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDismiss}>
              Not now
            </Button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
