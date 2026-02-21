import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getAllCourses } from "@/lib/db/queries";
import { StudentCoursesClient } from "@/app/dashboard/student/courses/courses-client";

export default async function StudentCoursesPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const role = user?.unsafeMetadata?.role;

  if (role !== "student") {
    redirect("/dashboard");
  }

  // Use Clerk userId as the student identifier
  const studentId = userId;
  
  const courses = await getAllCourses(studentId);

  return <StudentCoursesClient courses={courses} />;
}
