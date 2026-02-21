import { db } from "./index";
import { users, courses, venues, classSessions, enrollments } from "./schema";

// Helper to generate IDs
const genId = () => crypto.randomUUID();

// Get today's date in ISO format
const today = new Date().toISOString().split("T")[0];

async function seed() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await db.delete(enrollments);
  await db.delete(classSessions);
  await db.delete(courses);
  await db.delete(venues);
  await db.delete(users);

  // Create demo users (lecturers)
  const lecturer1Id = "lecturer_001";
  const lecturer2Id = "lecturer_002";
  
  // Create demo users (students)
  const student1Id = "student_001";
  const student2Id = "student_002";
  const student3Id = "student_003";

  await db.insert(users).values([
    { id: lecturer1Id, email: "dr.mutua@kabarak.ac.ke", name: "Dr. John Mutua", role: "lecturer" },
    { id: lecturer2Id, email: "prof.wanjiku@kabarak.ac.ke", name: "Prof. Mary Wanjiku", role: "lecturer" },
    { id: student1Id, email: "brian.kimani@students.kabarak.ac.ke", name: "Brian Kimani", role: "student" },
    { id: student2Id, email: "faith.achieng@students.kabarak.ac.ke", name: "Faith Achieng", role: "student" },
    { id: student3Id, email: "james.odhiambo@students.kabarak.ac.ke", name: "James Odhiambo", role: "student" },
  ]);

  console.log("✅ Users created");

  // Create venues (Kabarak University buildings)
  const venueAdmin = genId();
  const venueLibrary = genId();
  const venueScience = genId();
  const venueBusiness = genId();
  const venueChapel = genId();

  await db.insert(venues).values([
    {
      id: venueAdmin,
      name: "Admin Block - Room A101",
      building: "Main Administration Block",
      floor: 1,
      latitude: -0.16648,
      longitude: 35.96491,
      description: "Main administration building, first floor lecture room",
    },
    {
      id: venueLibrary,
      name: "Library Hall - L1",
      building: "Margaret Thatcher Library",
      floor: 0,
      latitude: -0.16710,
      longitude: 35.96590,
      description: "Ground floor lecture hall in the library building",
    },
    {
      id: venueScience,
      name: "Science Lab - S201",
      building: "School of Science & Technology",
      floor: 2,
      latitude: -0.16580,
      longitude: 35.96520,
      description: "Computer science laboratory, second floor",
    },
    {
      id: venueBusiness,
      name: "Business Hall - B102",
      building: "School of Business & Economics",
      floor: 1,
      latitude: -0.16680,
      longitude: 35.96420,
      description: "Main lecture hall for business courses",
    },
    {
      id: venueChapel,
      name: "Chapel Annex - C1",
      building: "University Chapel",
      floor: 0,
      latitude: -0.16550,
      longitude: 35.96600,
      description: "Chapel annex used for large gatherings and lectures",
    },
  ]);

  console.log("✅ Venues created");

  // Create courses
  const courseCS101 = genId();
  const courseCS201 = genId();
  const courseBUS101 = genId();
  const courseMTH201 = genId();

  await db.insert(courses).values([
    { id: courseCS101, code: "CS 101", name: "Introduction to Computer Science", lecturerId: lecturer1Id },
    { id: courseCS201, code: "CS 201", name: "Data Structures and Algorithms", lecturerId: lecturer1Id },
    { id: courseBUS101, code: "BUS 101", name: "Introduction to Business", lecturerId: lecturer2Id },
    { id: courseMTH201, code: "MTH 201", name: "Calculus II", lecturerId: lecturer2Id },
  ]);

  console.log("✅ Courses created");

  // Create class sessions for today
  await db.insert(classSessions).values([
    {
      id: genId(),
      courseId: courseCS101,
      scheduledDate: today,
      startTime: "08:00",
      endTime: "10:00",
      venueId: venueScience,
      status: "confirmed",
      statusUpdatedAt: new Date(),
    },
    {
      id: genId(),
      courseId: courseCS201,
      scheduledDate: today,
      startTime: "10:30",
      endTime: "12:30",
      venueId: venueScience,
      status: "pending",
    },
    {
      id: genId(),
      courseId: courseBUS101,
      scheduledDate: today,
      startTime: "14:00",
      endTime: "16:00",
      venueId: venueBusiness,
      status: "cancelled",
      statusUpdatedAt: new Date(),
      cancellationReason: "Lecturer attending a conference",
    },
    {
      id: genId(),
      courseId: courseMTH201,
      scheduledDate: today,
      startTime: "16:30",
      endTime: "18:00",
      venueId: venueLibrary,
      status: "pending",
    },
  ]);

  console.log("✅ Class sessions created");

  // Enroll students in courses
  await db.insert(enrollments).values([
    // Student 1 enrolled in CS101, CS201, MTH201
    { id: genId(), studentId: student1Id, courseId: courseCS101 },
    { id: genId(), studentId: student1Id, courseId: courseCS201 },
    { id: genId(), studentId: student1Id, courseId: courseMTH201 },
    // Student 2 enrolled in all courses
    { id: genId(), studentId: student2Id, courseId: courseCS101 },
    { id: genId(), studentId: student2Id, courseId: courseCS201 },
    { id: genId(), studentId: student2Id, courseId: courseBUS101 },
    { id: genId(), studentId: student2Id, courseId: courseMTH201 },
    // Student 3 enrolled in BUS101, MTH201
    { id: genId(), studentId: student3Id, courseId: courseBUS101 },
    { id: genId(), studentId: student3Id, courseId: courseMTH201 },
  ]);

  console.log("✅ Enrollments created");

  console.log("\n🎉 Database seeded successfully!");
  console.log("\n📊 Summary:");
  console.log("   - 2 Lecturers");
  console.log("   - 3 Students");
  console.log("   - 5 Venues");
  console.log("   - 4 Courses");
  console.log("   - 4 Class sessions for today");
}

seed().catch(console.error);
