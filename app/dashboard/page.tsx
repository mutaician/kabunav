import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const role = user?.unsafeMetadata?.role as string | undefined;

  // If no role set, redirect to onboarding
  if (!role) {
    redirect("/onboarding");
  }

  // Redirect based on role
  if (role === "lecturer") {
    redirect("/dashboard/lecturer");
  } else {
    redirect("/dashboard/student");
  }
}
