"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, BookOpen, MapPin } from "lucide-react";

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const selectRole = async (role: "student" | "lecturer") => {
    if (!user) return;
    
    setLoading(true);
    try {
      await user.update({
        unsafeMetadata: {
          role: role,
        },
      });
      router.push("/dashboard");
    } catch (error) {
      console.error("Error setting role:", error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin className="h-10 w-10 text-emerald-600" />
            <span className="text-3xl font-bold text-gray-900">KabuNav</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome! Let&apos;s get you set up</h1>
          <p className="text-gray-600">Choose your role to personalize your experience</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card 
            className="cursor-pointer hover:border-emerald-500 hover:shadow-lg transition-all"
            onClick={() => !loading && selectRole("student")}
          >
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="h-8 w-8 text-emerald-600" />
              </div>
              <CardTitle>I&apos;m a Student</CardTitle>
              <CardDescription>
                View your class schedule, get notifications, and navigate campus
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={loading}
              >
                Continue as Student
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all"
            onClick={() => !loading && selectRole("lecturer")}
          >
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle>I&apos;m a Lecturer</CardTitle>
              <CardDescription>
                Manage your classes, confirm or cancel sessions, notify students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                Continue as Lecturer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
