import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/actions/user-actions";
import { SettingsClient } from "./settings-client";

export default async function LecturerSettingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const role = user?.unsafeMetadata?.role;

  if (role !== "lecturer") {
    redirect("/dashboard");
  }

  const profile = await getUserProfile();

  return (
    <SettingsClient
      currentPhone={profile?.phone || ""}
      userName={profile?.name || user?.firstName || "Lecturer"}
      userEmail={profile?.email || user?.emailAddresses[0]?.emailAddress || ""}
    />
  );
}
