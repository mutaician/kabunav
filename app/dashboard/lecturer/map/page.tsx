import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getAllVenues } from "@/lib/db/queries";
import { MapPageClient } from "./map-client";

export default async function LecturerMapPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const role = user?.unsafeMetadata?.role;

  if (role !== "lecturer") {
    redirect("/dashboard");
  }

  const venues = await getAllVenues();

  return <MapPageClient venues={venues} />;
}
