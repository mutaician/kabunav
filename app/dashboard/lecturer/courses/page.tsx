import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getLecturerCourses, getAllVenues } from "@/lib/db/queries";
import { LecturerCoursesClient } from "./courses-client";

export default async function LecturerCoursesPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const role = user?.unsafeMetadata?.role;

  if (role !== "lecturer") {
    redirect("/dashboard");
  }

  // Use Clerk userId as the lecturer identifier
  const lecturerId = userId;
  
  const [courses, venues] = await Promise.all([
    getLecturerCourses(lecturerId),
    getAllVenues(),
  ]);

  return <LecturerCoursesClient courses={courses} venues={venues} />;
}
