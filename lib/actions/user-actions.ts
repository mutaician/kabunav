"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

/**
 * Update the current user's phone number
 */
export async function updatePhoneNumber(phone: string) {
  const { userId } = await auth();

  if (!userId) {
    return { error: "Unauthorized" };
  }

  // Validate phone number format
  const phoneRegex = /^\+\d{10,15}$/;
  if (phone && !phoneRegex.test(phone)) {
    return { error: "Invalid phone number. Use international format (e.g., +254712345678)" };
  }

  try {
    // Check if user exists in our DB
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      return { error: "User not found. Please complete onboarding first." };
    }

    // Update phone number
    await db
      .update(users)
      .set({ phone: phone || null })
      .where(eq(users.id, userId));

    revalidatePath("/dashboard/student/settings");
    revalidatePath("/dashboard/lecturer/settings");

    return { success: true };
  } catch (error) {
    console.error("Error updating phone number:", error);
    return { error: "Failed to update phone number" };
  }
}

/**
 * Get the current user's profile including phone
 */
export async function getUserProfile() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return user[0] || null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}
