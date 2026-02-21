import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, User, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getStudentClasses, getStudentEnrolledCourses } from "@/lib/db/queries";
import { RefreshButton } from "./refresh-button";

type ClassStatus = "pending" | "confirmed" | "cancelled";

interface ClassSession {
  id: string;
  courseCode: string;
  courseName: string;
  startTime: string;
  endTime: string;
  venueName: string | null;
  venueBuilding: string | null;
  venueId: string | null;
  lecturerName: string | null;
  status: ClassStatus;
  cancellationReason: string | null;
}

function StatusBadge({ status }: { status: ClassStatus }) {
  const config = {
    pending: {
      label: "Pending",
      className: "border-amber-500 text-amber-600 bg-amber-50",
      icon: AlertCircle,
    },
    confirmed: {
      label: "Confirmed",
      className: "border-emerald-500 text-emerald-600 bg-emerald-50",
      icon: CheckCircle,
    },
    cancelled: {
      label: "Cancelled",
      className: "border-red-500 text-red-600 bg-red-50",
      icon: XCircle,
    },
  };

  const { label, className, icon: Icon } = config[status];

  return (
    <Badge variant="outline" className={className}>
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </Badge>
  );
}

function ClassCard({ classSession }: { classSession: ClassSession }) {
  const isCancelled = classSession.status === "cancelled";

  return (
    <Card className={`${isCancelled ? "opacity-60" : ""} hover:shadow-md transition-shadow`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-emerald-600">{classSession.courseCode}</p>
            <CardTitle className={`text-lg ${isCancelled ? "line-through" : ""}`}>
              {classSession.courseName}
            </CardTitle>
          </div>
          <StatusBadge status={classSession.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{classSession.startTime} - {classSession.endTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{classSession.venueName || "TBA"}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{classSession.lecturerName || "TBA"}</span>
          </div>
        </div>

        {classSession.status === "cancelled" && classSession.cancellationReason && (
          <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded-md">
            <p className="text-sm text-red-700">
              <strong>Reason:</strong> {classSession.cancellationReason}
            </p>
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <Link href={`/dashboard/student/map?venue=${classSession.venueId}`} className="flex-1">
            <Button 
              variant="outline" 
              className="w-full" 
              size="sm"
              disabled={isCancelled || !classSession.venueId}
            >
              <MapPin className="h-4 w-4 mr-1" />
              Navigate
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function StudentDashboard() {
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
  
  const [classes, enrolledCourses] = await Promise.all([
    getStudentClasses(studentId),
    getStudentEnrolledCourses(studentId),
  ]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const confirmedCount = classes.filter(c => c.status === "confirmed").length;
  const pendingCount = classes.filter(c => c.status === "pending").length;
  const cancelledCount = classes.filter(c => c.status === "cancelled").length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Today&apos;s Classes</h1>
          <p className="text-gray-600">{today}</p>
        </div>
        <RefreshButton />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{confirmedCount}</p>
          <p className="text-sm text-emerald-700">Confirmed</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
          <p className="text-sm text-amber-700">Pending</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{cancelledCount}</p>
          <p className="text-sm text-red-700">Cancelled</p>
        </div>
      </div>

      {/* Class List */}
      <div className="space-y-4">
        {classes.map((classSession) => (
          <ClassCard 
            key={classSession.id} 
            classSession={{
              id: classSession.id,
              courseCode: classSession.courseCode,
              courseName: classSession.courseName,
              startTime: classSession.startTime,
              endTime: classSession.endTime,
              venueName: classSession.venueName,
              venueBuilding: classSession.venueBuilding,
              venueId: classSession.venueId,
              lecturerName: classSession.lecturerName,
              status: classSession.status as ClassStatus,
              cancellationReason: classSession.cancellationReason,
            }} 
          />
        ))}
      </div>

      {classes.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          {enrolledCourses.length > 0 ? (
            <>
              <p className="text-gray-500">No classes scheduled for today</p>
              <p className="text-sm text-gray-400 mt-1">
                You&apos;re enrolled in {enrolledCourses.length} course(s). Check back when your lecturers schedule classes.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {enrolledCourses.map((course) => (
                  <span 
                    key={course.id}
                    className="inline-block bg-emerald-100 text-emerald-700 text-sm px-3 py-1 rounded-full"
                  >
                    {course.code}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-500">No classes scheduled for today</p>
              <p className="text-sm text-gray-400 mt-1">
                You haven&apos;t enrolled in any courses yet.
              </p>
              <Link href="/dashboard/student/courses">
                <Button className="mt-4" size="sm">
                  Browse Courses
                </Button>
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
