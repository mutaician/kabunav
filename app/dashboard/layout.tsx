import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { Home, Map, BookOpen } from "lucide-react";
import { DashboardClientWrapper } from "./dashboard-wrapper";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const role = user?.unsafeMetadata?.role as string | undefined;

  if (!role) {
    redirect("/onboarding");
  }

  const basePath = `/dashboard/${role}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={basePath} className="flex items-center gap-2">
            <Image
              src="/icons/icon.svg"
              alt="KabuNav"
              width={28}
              height={28}
              className="h-7 w-7"
            />
            <span className="text-xl font-bold text-gray-900">KabuNav</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href={basePath}
              className="text-sm font-medium text-gray-600 hover:text-emerald-600"
            >
              Dashboard
            </Link>
            <Link
              href={`${basePath}/courses`}
              className="text-sm font-medium text-gray-600 hover:text-emerald-600"
            >
              Courses
            </Link>
            <Link
              href={`${basePath}/map`}
              className="text-sm font-medium text-gray-600 hover:text-emerald-600"
            >
              Campus Map
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:block">
              {user?.firstName || user?.emailAddresses[0]?.emailAddress}
            </span>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full capitalize">
              {role}
            </span>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
        <div className="flex justify-around py-2">
          <Link
            href={basePath}
            className="flex flex-col items-center gap-1 px-4 py-2 text-gray-600 hover:text-emerald-600"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </Link>
          <Link
            href={`${basePath}/courses`}
            className="flex flex-col items-center gap-1 px-4 py-2 text-gray-600 hover:text-emerald-600"
          >
            <BookOpen className="h-5 w-5" />
            <span className="text-xs">Courses</span>
          </Link>
          <Link
            href={`${basePath}/map`}
            className="flex flex-col items-center gap-1 px-4 py-2 text-gray-600 hover:text-emerald-600"
          >
            <Map className="h-5 w-5" />
            <span className="text-xs">Map</span>
          </Link>
        </div>
      </nav>

      {/* Spacer for mobile nav */}
      <div className="h-20 md:hidden" />
      
      {/* PWA Install Prompt */}
      <DashboardClientWrapper />
    </div>
  );
}
