import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Users table - synced with Clerk
export const users = sqliteTable("users", {
  id: text("id").primaryKey(), // Clerk user ID
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone"), // Phone number for SMS notifications (e.g., +254712345678)
  role: text("role", { enum: ["student", "lecturer", "admin"] }).notNull().default("student"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Courses table
export const courses = sqliteTable("courses", {
  id: text("id").primaryKey(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  lecturerId: text("lecturer_id").references(() => users.id),
});

// Campus venues/buildings
export const venues = sqliteTable("venues", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  building: text("building").notNull(),
  floor: integer("floor"),
  latitude: integer("latitude", { mode: "number" }).notNull(), // Will store as float
  longitude: integer("longitude", { mode: "number" }).notNull(),
  description: text("description"),
});

// Class sessions (scheduled classes)
export const classSessions = sqliteTable("class_sessions", {
  id: text("id").primaryKey(),
  courseId: text("course_id").references(() => courses.id).notNull(),
  scheduledDate: text("scheduled_date").notNull(), // ISO date string
  startTime: text("start_time").notNull(), // HH:mm format
  endTime: text("end_time").notNull(), // HH:mm format
  venueId: text("venue_id").references(() => venues.id),
  status: text("status", { enum: ["pending", "confirmed", "cancelled"] }).notNull().default("pending"),
  statusUpdatedAt: integer("status_updated_at", { mode: "timestamp" }),
  cancellationReason: text("cancellation_reason"),
});

// Student enrollments
export const enrollments = sqliteTable("enrollments", {
  id: text("id").primaryKey(),
  studentId: text("student_id").references(() => users.id).notNull(),
  courseId: text("course_id").references(() => courses.id).notNull(),
});

// Notification log (for accountability)
export const notificationLog = sqliteTable("notification_log", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").references(() => classSessions.id),
  action: text("action").notNull(),
  actorId: text("actor_id").references(() => users.id),
  timestamp: integer("timestamp", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Types for the schema
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Course = typeof courses.$inferSelect;
export type Venue = typeof venues.$inferSelect;
export type ClassSession = typeof classSessions.$inferSelect;
export type Enrollment = typeof enrollments.$inferSelect;
