import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { MapPin, Bell, CheckCircle, Clock } from "lucide-react";

export default async function HomePage() {
  const { userId } = await auth();
  
  // If logged in, redirect to dashboard
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Image
            src="/icons/icon.svg"
            alt="KabuNav"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="text-2xl font-bold text-gray-900">KabuNav</span>
        </div>
        <div className="flex gap-3">
          <Link href="/sign-in">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button className="bg-emerald-600 hover:bg-emerald-700">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Never Waste Another Trip to Class
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Know if your class is happening before you leave. Get notified instantly 
            when lecturers confirm or cancel. Find your way around Kabarak University 
            with our interactive campus map.
          </p>
          <div className="flex gap-4 justify-center mb-16">
            <Link href="/sign-up">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8">
                Start Free
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Learn More
              </Button>
            </Link>
          </div>

          {/* Problem Statement */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 md:p-8 text-left mb-16">
            <h3 className="text-lg font-semibold text-amber-800 mb-3">Sound familiar?</h3>
            <p className="text-amber-900">
              &ldquo;I prepared well to attend class, traveled all the way to campus, 
              spent money on fare, only to find out the class was cancelled. 
              The lecturer doesn&apos;t see it as an issue, but I wasted hours of my day.&rdquo;
            </p>
            <p className="text-amber-700 mt-2 text-sm">— Every Kabarak Student Ever</p>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
              <Bell className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Instant Notifications</h3>
            <p className="text-gray-600 text-sm">
              Get push notifications 30 minutes before class when status changes.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Live Class Status</h3>
            <p className="text-gray-600 text-sm">
              See real-time confirmation status: Pending, Confirmed, or Cancelled.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <MapPin className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Campus Navigation</h3>
            <p className="text-gray-600 text-sm">
              Interactive map to find any building, hall, or venue on campus.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Accountability</h3>
            <p className="text-gray-600 text-sm">
              Track when lecturers confirm or don&apos;t update their class status.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-500 text-sm">
        <p>Built for Kabarak University Students 🎓</p>
        <p className="mt-1">KabuNav © 2026</p>
      </footer>
    </div>
  );
}
