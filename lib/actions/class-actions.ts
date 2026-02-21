"use server";

import { db } from "@/lib/db";
import { classSessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function confirmClass(sessionId: string) {
  const { userId } = await auth();
  
  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    await db
      .update(classSessions)
      .set({
        status: "confirmed",
        statusUpdatedAt: new Date(),
      })
      .where(eq(classSessions.id, sessionId));

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
    await db
      .update(classSessions)
      .set({
        status: "cancelled",
        cancellationReason: reason,
        statusUpdatedAt: new Date(),
      })
      .where(eq(classSessions.id, sessionId));

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
