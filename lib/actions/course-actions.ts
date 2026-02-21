"use server";

import { db } from "@/lib/db";
import { courses, classSessions, enrollments, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

async function ensureDbUser(userId: string, role?: "student" | "lecturer") {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error("Unable to load authenticated user");
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) {
    throw new Error("Authenticated user has no email");
  }

  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || clerkUser.username || email;
  const metadataRole = clerkUser.unsafeMetadata?.role;
  const userRole = role ?? (metadataRole === "lecturer" ? "lecturer" : "student");

  await db
    .insert(users)
    .values({
      id: userId,
      email,
      name,
      role: userRole,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email,
        name,
        role: userRole,
      },
    });
}

// Create a new course
export async function createCourse(data: {
  code: string;
  name: string;
}) {
  const { userId } = await auth();
  
  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    await ensureDbUser(userId, "lecturer");

    const courseId = crypto.randomUUID();
    
    await db.insert(courses).values({
      id: courseId,
      code: data.code.toUpperCase(),
      name: data.name,
      lecturerId: userId,
    });

    revalidatePath("/dashboard/lecturer/courses");
    
    return { success: true, courseId };
  } catch (error) {
    console.error("Error creating course:", error);
    return { error: "Failed to create course" };
  }
}

// Schedule a class session
export async function scheduleClass(data: {
  courseId: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  venueId: string;
}) {
  const { userId } = await auth();
  
  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    const sessionId = crypto.randomUUID();
    
    await db.insert(classSessions).values({
      id: sessionId,
      courseId: data.courseId,
      scheduledDate: data.scheduledDate,
      startTime: data.startTime,
      endTime: data.endTime,
      venueId: data.venueId,
      status: "pending",
    });

    revalidatePath("/dashboard/lecturer");
    revalidatePath("/dashboard/lecturer/courses");
    
    return { success: true, sessionId };
  } catch (error) {
    console.error("Error scheduling class:", error);
    return { error: "Failed to schedule class" };
  }
}

// Enroll student in a course
export async function enrollInCourse(courseId: string) {
  const { userId } = await auth();
  
  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    await ensureDbUser(userId, "student");

    // Check if already enrolled
    const existing = await db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.studentId, userId),
          eq(enrollments.courseId, courseId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return { error: "Already enrolled in this course" };
    }

    const enrollmentId = crypto.randomUUID();
    
    await db.insert(enrollments).values({
      id: enrollmentId,
      studentId: userId,
      courseId,
    });

    revalidatePath("/dashboard/student");
    revalidatePath("/dashboard/student/courses");
    
    return { success: true };
  } catch (error) {
    console.error("Error enrolling in course:", error);
    return { error: "Failed to enroll in course" };
  }
}

// Unenroll student from a course
export async function unenrollFromCourse(courseId: string) {
  const { userId } = await auth();
  
  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    await db
      .delete(enrollments)
      .where(
        and(
          eq(enrollments.studentId, userId),
          eq(enrollments.courseId, courseId)
        )
      );

    revalidatePath("/dashboard/student");
    revalidatePath("/dashboard/student/courses");
    
    return { success: true };
  } catch (error) {
    console.error("Error unenrolling from course:", error);
    return { error: "Failed to unenroll from course" };
  }
}
