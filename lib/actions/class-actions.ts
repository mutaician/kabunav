"use server";

import { db } from "@/lib/db";
import { classSessions, courses, venues } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getEnrolledStudentPhones } from "@/lib/db/queries";
import { notifyClassConfirmedSMS, notifyClassCancelledSMS } from "@/lib/sms";

// Helper to get class details for SMS
async function getClassDetails(sessionId: string) {
  const result = await db
    .select({
      courseId: classSessions.courseId,
      courseCode: courses.code,
      courseName: courses.name,
      startTime: classSessions.startTime,
      endTime: classSessions.endTime,
      venueName: venues.name,
      venueBuilding: venues.building,
    })
    .from(classSessions)
    .innerJoin(courses, eq(classSessions.courseId, courses.id))
    .leftJoin(venues, eq(classSessions.venueId, venues.id))
    .where(eq(classSessions.id, sessionId))
    .limit(1);

  return result[0] || null;
}

export async function confirmClass(sessionId: string) {
  const { userId } = await auth();
  
  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    // Get class details before updating
    const classDetails = await getClassDetails(sessionId);
    
    await db
      .update(classSessions)
      .set({
        status: "confirmed",
        statusUpdatedAt: new Date(),
      })
      .where(eq(classSessions.id, sessionId));

    // Send SMS notifications to enrolled students
    if (classDetails) {
      const phoneNumbers = await getEnrolledStudentPhones(classDetails.courseId);
      if (phoneNumbers.length > 0) {
        const venue = classDetails.venueName 
          ? `${classDetails.venueName}${classDetails.venueBuilding ? ` (${classDetails.venueBuilding})` : ""}`
          : undefined;
        
        await notifyClassConfirmedSMS(
          phoneNumbers,
          classDetails.courseCode,
          classDetails.courseName,
          `${classDetails.startTime} - ${classDetails.endTime}`,
          venue
        );
      }
    }

    revalidatePath("/dashboard/lecturer");
    revalidatePath("/dashboard/student");
    
    return { success: true };
  } catch (error) {
    console.error("Error confirming class:", error);
    return { error: "Failed to confirm class" };
  }
}

export async function cancelClass(sessionId: string, reason: string) {
  const { userId } = await auth();
  
  if (!userId) {
    return { error: "Unauthorized" };
  }

  if (!reason.trim()) {
    return { error: "Cancellation reason is required" };
  }

  try {
    // Get class details before updating
    const classDetails = await getClassDetails(sessionId);
    
    await db
      .update(classSessions)
      .set({
        status: "cancelled",
        cancellationReason: reason,
        statusUpdatedAt: new Date(),
      })
      .where(eq(classSessions.id, sessionId));

    // Send SMS notifications to enrolled students
    if (classDetails) {
      const phoneNumbers = await getEnrolledStudentPhones(classDetails.courseId);
      if (phoneNumbers.length > 0) {
        await notifyClassCancelledSMS(
          phoneNumbers,
          classDetails.courseCode,
          classDetails.courseName,
          reason
        );
      }
    }

    revalidatePath("/dashboard/lecturer");
    revalidatePath("/dashboard/student");
    
    return { success: true };
  } catch (error) {
    console.error("Error cancelling class:", error);
    return { error: "Failed to cancel class" };
  }
}

export async function resetClassStatus(sessionId: string) {
  const { userId } = await auth();
  
  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    await db
      .update(classSessions)
      .set({
        status: "pending",
        cancellationReason: null,
        statusUpdatedAt: null,
      })
      .where(eq(classSessions.id, sessionId));

    revalidatePath("/dashboard/lecturer");
    revalidatePath("/dashboard/student");
    
    return { success: true };
  } catch (error) {
    console.error("Error resetting class:", error);
    return { error: "Failed to reset class status" };
  }
}
