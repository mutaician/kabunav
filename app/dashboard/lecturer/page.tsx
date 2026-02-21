import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getLecturerClasses } from "@/lib/db/queries";
import { LecturerDashboardClient } from "./lecturer-dashboard-client";

export default async function LecturerDashboard() {
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
  
  const classes = await getLecturerClasses(lecturerId);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <LecturerDashboardClient 
      initialClasses={classes.map(c => ({
        id: c.id,
        courseCode: c.courseCode,
        courseName: c.courseName,
        startTime: c.startTime,
        endTime: c.endTime,
        venueName: c.venueName,
        venueBuilding: c.venueBuilding,
        enrolledStudents: c.enrolledStudents,
        status: c.status as "pending" | "confirmed" | "cancelled",
        cancellationReason: c.cancellationReason,
      }))}
      today={today}
    />
  );
}
