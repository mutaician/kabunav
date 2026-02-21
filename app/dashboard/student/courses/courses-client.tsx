"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, User, Check, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import { enrollInCourse, unenrollFromCourse } from "@/lib/actions/course-actions";

interface Course {
  id: string;
  code: string;
  name: string;
  lecturerName: string | null;
  enrolledCount: number;
  isEnrolled: boolean;
}

interface StudentCoursesClientProps {
  courses: Course[];
}

export function StudentCoursesClient({ courses }: StudentCoursesClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadingCourseId, setLoadingCourseId] = useState<string | null>(null);

  const handleEnroll = (courseId: string) => {
    setLoadingCourseId(courseId);
    startTransition(async () => {
      const result = await enrollInCourse(courseId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Successfully enrolled in course!");
        router.refresh();
      }
      setLoadingCourseId(null);
    });
  };

  const handleUnenroll = (courseId: string) => {
    setLoadingCourseId(courseId);
    startTransition(async () => {
      const result = await unenrollFromCourse(courseId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Successfully unenrolled from course");
        router.refresh();
      }
      setLoadingCourseId(null);
    });
  };

  const enrolledCourses = courses.filter(c => c.isEnrolled);
  const availableCourses = courses.filter(c => !c.isEnrolled);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
        <p className="text-gray-600">Browse and register for courses</p>
      </div>

      {/* My Courses Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Check className="h-5 w-5 text-emerald-600" />
          My Enrolled Courses ({enrolledCourses.length})
        </h2>
        
        {enrolledCourses.length > 0 ? (
          <div className="space-y-3">
            {enrolledCourses.map((course) => (
              <Card key={course.id} className="border-emerald-200 bg-emerald-50/50">
                <CardContent className="py-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-emerald-600 border-emerald-300">
                            {course.code}
                          </Badge>
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                            Enrolled
                          </Badge>
                        </div>
                        <p className="font-medium text-gray-900">{course.name}</p>
                        <p className="text-sm text-gray-600">{course.lecturerName || "TBA"}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                      onClick={() => handleUnenroll(course.id)}
                      disabled={isPending && loadingCourseId === course.id}
                    >
                      <Minus className="h-4 w-4 mr-1" />
                      {isPending && loadingCourseId === course.id ? "..." : "Drop"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">You haven&apos;t enrolled in any courses yet</p>
            <p className="text-sm text-gray-400 mt-1">Browse available courses below</p>
          </div>
        )}
      </div>

      {/* Available Courses Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          Available Courses ({availableCourses.length})
        </h2>
        
        {availableCourses.length > 0 ? (
          <div className="space-y-3">
            {availableCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <Badge variant="outline" className="text-blue-600 border-blue-300 mb-1">
                          {course.code}
                        </Badge>
                        <p className="font-medium text-gray-900">{course.name}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {course.lecturerName || "TBA"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {course.enrolledCount} enrolled
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleEnroll(course.id)}
                      disabled={isPending && loadingCourseId === course.id}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      {isPending && loadingCourseId === course.id ? "..." : "Enroll"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No more courses available</p>
            <p className="text-sm text-gray-400 mt-1">You&apos;re enrolled in all available courses!</p>
          </div>
        )}
      </div>
    </div>
  );
}
