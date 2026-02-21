"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { NotificationPrompt } from "@/components/notification-prompt";

interface ClassSession {
  id: string;
  courseCode: string;
  courseName: string;
  status: string;
  venueName: string | null;
  startTime: string;
}

interface StudentDashboardWrapperProps {
  children: React.ReactNode;
  classes: ClassSession[];
}

export function StudentDashboardWrapper({ children, classes }: StudentDashboardWrapperProps) {
  const router = useRouter();
  const previousClassesRef = useRef<Map<string, string>>(new Map());
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip notification check on first render
    if (isFirstRender.current) {
      // Store initial statuses
      classes.forEach((cls) => {
        previousClassesRef.current.set(cls.id, cls.status);
      });
      isFirstRender.current = false;
      return;
    }

    // Check for status changes and show notifications
    const checkForChanges = async () => {
      const { notifyClassConfirmed, notifyClassCancelled } = await import("@/lib/notifications");
      
      for (const cls of classes) {
        const previousStatus = previousClassesRef.current.get(cls.id);
        
        if (previousStatus && previousStatus !== cls.status) {
          if (cls.status === "confirmed") {
            await notifyClassConfirmed(
              cls.courseCode,
              cls.courseName,
              cls.venueName || undefined,
              cls.startTime
            );
          } else if (cls.status === "cancelled") {
            await notifyClassCancelled(cls.courseCode, cls.courseName);
          }
        }
        
        // Update stored status
        previousClassesRef.current.set(cls.id, cls.status);
      }
    };

    checkForChanges();
  }, [classes]);

  useEffect(() => {
    const refreshNow = () => router.refresh();
    const intervalId = window.setInterval(refreshNow, 15000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshNow();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [router]);

  return (
    <>
      <NotificationPrompt />
      {children}
    </>
  );
}
