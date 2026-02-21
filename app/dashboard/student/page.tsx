import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, User, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

// Demo data - in production, this would come from the database
const todayClasses = [
  {
    id: "1",
    courseCode: "CS 101",
    courseName: "Introduction to Computer Science",
    startTime: "08:00",
    endTime: "10:00",
    venue: "Science Lab - S201",
    building: "School of Science Building",
    lecturer: "Dr. John Mutua",
    status: "confirmed" as const,
  },
  {
    id: "2",
    courseCode: "CS 201",
    courseName: "Data Structures and Algorithms",
    startTime: "10:30",
    endTime: "12:30",
    venue: "Science Lab - S201",
    building: "School of Science Building",
    lecturer: "Dr. John Mutua",
    status: "pending" as const,
  },
  {
    id: "3",
    courseCode: "BUS 101",
    courseName: "Introduction to Business",
    startTime: "14:00",
    endTime: "16:00",
    venue: "Business Hall - B102",
    building: "School of Business",
    lecturer: "Prof. Mary Wanjiku",
    status: "cancelled" as const,
    cancellationReason: "Lecturer attending a conference",
  },
  {
    id: "4",
    courseCode: "MTH 201",
    courseName: "Calculus II",
    startTime: "16:30",
    endTime: "18:00",
    venue: "Library Hall - L1",
    building: "Margaret Thatcher Library",
    lecturer: "Prof. Mary Wanjiku",
    status: "pending" as const,
  },
];

function StatusBadge({ status }: { status: "pending" | "confirmed" | "cancelled" }) {
  const config = {
    pending: {
      label: "Pending",
      variant: "outline" as const,
      className: "border-amber-500 text-amber-600 bg-amber-50",
      icon: AlertCircle,
    },
    confirmed: {
      label: "Confirmed",
      variant: "outline" as const,
      className: "border-emerald-500 text-emerald-600 bg-emerald-50",
      icon: CheckCircle,
    },
    cancelled: {
      label: "Cancelled",
      variant: "outline" as const,
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

function ClassCard({ classSession }: { classSession: typeof todayClasses[0] }) {
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
            <span>{classSession.venue}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{classSession.lecturer}</span>
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
          <Link href={`/dashboard/student/map?venue=${classSession.id}`} className="flex-1">
            <Button 
              variant="outline" 
              className="w-full" 
              size="sm"
              disabled={isCancelled}
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

export default function StudentDashboard() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const confirmedCount = todayClasses.filter(c => c.status === "confirmed").length;
  const pendingCount = todayClasses.filter(c => c.status === "pending").length;
  const cancelledCount = todayClasses.filter(c => c.status === "cancelled").length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Today&apos;s Classes</h1>
        <p className="text-gray-600">{today}</p>
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
        {todayClasses.map((classSession) => (
          <ClassCard key={classSession.id} classSession={classSession} />
        ))}
      </div>

      {todayClasses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No classes scheduled for today</p>
        </div>
      )}
    </div>
  );
}
