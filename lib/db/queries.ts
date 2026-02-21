import { db } from "./index";
import { classSessions, courses, venues, enrollments, users } from "./schema";
import { eq, and } from "drizzle-orm";

// Get today's date in ISO format
function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

// Get all classes for a student (based on enrollments)
export async function getStudentClasses(studentId: string) {
  const today = getTodayDate();
  
  const results = await db
    .select({
      id: classSessions.id,
      courseId: classSessions.courseId,
      courseCode: courses.code,
      courseName: courses.name,
      scheduledDate: classSessions.scheduledDate,
      startTime: classSessions.startTime,
      endTime: classSessions.endTime,
      status: classSessions.status,
      cancellationReason: classSessions.cancellationReason,
      statusUpdatedAt: classSessions.statusUpdatedAt,
      venueId: classSessions.venueId,
      venueName: venues.name,
      venueBuilding: venues.building,
      lecturerId: courses.lecturerId,
      lecturerName: users.name,
    })
    .from(classSessions)
    .innerJoin(courses, eq(classSessions.courseId, courses.id))
    .innerJoin(enrollments, eq(courses.id, enrollments.courseId))
    .leftJoin(venues, eq(classSessions.venueId, venues.id))
    .leftJoin(users, eq(courses.lecturerId, users.id))
    .where(
      and(
        eq(enrollments.studentId, studentId),
        eq(classSessions.scheduledDate, today)
      )
    )
    .orderBy(classSessions.startTime);

  return results;
}

// Get all classes for a lecturer
export async function getLecturerClasses(lecturerId: string) {
  const today = getTodayDate();

  const results = await db
    .select({
      id: classSessions.id,
      courseId: classSessions.courseId,
      courseCode: courses.code,
      courseName: courses.name,
      scheduledDate: classSessions.scheduledDate,
      startTime: classSessions.startTime,
      endTime: classSessions.endTime,
      status: classSessions.status,
      cancellationReason: classSessions.cancellationReason,
      statusUpdatedAt: classSessions.statusUpdatedAt,
      venueId: classSessions.venueId,
      venueName: venues.name,
      venueBuilding: venues.building,
    })
    .from(classSessions)
    .innerJoin(courses, eq(classSessions.courseId, courses.id))
    .leftJoin(venues, eq(classSessions.venueId, venues.id))
    .where(
      and(
        eq(courses.lecturerId, lecturerId),
        eq(classSessions.scheduledDate, today)
      )
    )
    .orderBy(classSessions.startTime);

  // Get enrolled student count for each class
  const resultsWithCount = await Promise.all(
    results.map(async (session) => {
      const enrolledCount = await db
        .select()
        .from(enrollments)
        .where(eq(enrollments.courseId, session.courseId));
      
      return {
        ...session,
        enrolledStudents: enrolledCount.length,
      };
    })
  );

  return resultsWithCount;
}

// Get a single class session by ID
export async function getClassSession(sessionId: string) {
  const result = await db
    .select({
      id: classSessions.id,
      courseId: classSessions.courseId,
      courseCode: courses.code,
      courseName: courses.name,
      scheduledDate: classSessions.scheduledDate,
      startTime: classSessions.startTime,
      endTime: classSessions.endTime,
      status: classSessions.status,
      cancellationReason: classSessions.cancellationReason,
      venueId: classSessions.venueId,
      venueName: venues.name,
      venueBuilding: venues.building,
      venueLatitude: venues.latitude,
      venueLongitude: venues.longitude,
      venueDescription: venues.description,
      lecturerId: courses.lecturerId,
      lecturerName: users.name,
    })
    .from(classSessions)
    .innerJoin(courses, eq(classSessions.courseId, courses.id))
    .leftJoin(venues, eq(classSessions.venueId, venues.id))
    .leftJoin(users, eq(courses.lecturerId, users.id))
    .where(eq(classSessions.id, sessionId))
    .limit(1);

  return result[0] || null;
}

// Get all venues
export async function getAllVenues() {
  return db.select().from(venues);
}

// Get user by Clerk ID or create if not exists
export async function getOrCreateUser(clerkId: string, email: string, name: string, role: "student" | "lecturer") {
  const existing = await db.select().from(users).where(eq(users.id, clerkId)).limit(1);
  
  if (existing.length > 0) {
    return existing[0];
  }

  // Create new user
  await db.insert(users).values({
    id: clerkId,
    email,
    name,
    role,
  });

  const newUser = await db.select().from(users).where(eq(users.id, clerkId)).limit(1);
  return newUser[0];
}

// Get user by ID
export async function getUserById(userId: string) {
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result[0] || null;
}

// Get all courses by a lecturer
export async function getLecturerCourses(lecturerId: string) {
  const results = await db
    .select({
      id: courses.id,
      code: courses.code,
      name: courses.name,
      lecturerId: courses.lecturerId,
    })
    .from(courses)
    .where(eq(courses.lecturerId, lecturerId));

  // Get enrolled count for each course
  const resultsWithCount = await Promise.all(
    results.map(async (course) => {
      const enrolled = await db
        .select()
        .from(enrollments)
        .where(eq(enrollments.courseId, course.id));
      return {
        ...course,
        enrolledCount: enrolled.length,
      };
    })
  );

  return resultsWithCount;
}

// Get all available courses (for students to browse)
export async function getAllCourses(studentId?: string) {
  const results = await db
    .select({
      id: courses.id,
      code: courses.code,
      name: courses.name,
      lecturerId: courses.lecturerId,
      lecturerName: users.name,
    })
    .from(courses)
    .leftJoin(users, eq(courses.lecturerId, users.id));

  // Get enrollment status for each course
  const resultsWithEnrollment = await Promise.all(
    results.map(async (course) => {
      const enrolled = await db
        .select()
        .from(enrollments)
        .where(eq(enrollments.courseId, course.id));
      
      const isEnrolled = studentId 
        ? enrolled.some(e => e.studentId === studentId)
        : false;

      return {
        ...course,
        enrolledCount: enrolled.length,
        isEnrolled,
      };
    })
  );

  return resultsWithEnrollment;
}

// Get student's enrolled courses
export async function getStudentEnrolledCourses(studentId: string) {
  return db
    .select({
      id: courses.id,
      code: courses.code,
      name: courses.name,
      lecturerName: users.name,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .leftJoin(users, eq(courses.lecturerId, users.id))
    .where(eq(enrollments.studentId, studentId));
}
