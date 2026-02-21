"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Users, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";

type ClassStatus = "pending" | "confirmed" | "cancelled";

interface ClassSession {
  id: string;
  courseCode: string;
  courseName: string;
  startTime: string;
  endTime: string;
  venue: string;
  building: string;
  enrolledStudents: number;
  status: ClassStatus;
  cancellationReason?: string;
}

// Demo data
const initialClasses: ClassSession[] = [
  {
    id: "1",
    courseCode: "CS 101",
    courseName: "Introduction to Computer Science",
    startTime: "08:00",
    endTime: "10:00",
    venue: "Science Lab - S201",
    building: "School of Science Building",
    enrolledStudents: 45,
    status: "confirmed",
  },
  {
    id: "2",
    courseCode: "CS 201",
    courseName: "Data Structures and Algorithms",
    startTime: "10:30",
    endTime: "12:30",
    venue: "Science Lab - S201",
    building: "School of Science Building",
    enrolledStudents: 38,
    status: "pending",
  },
];

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

export default function LecturerDashboard() {
  const [classes, setClasses] = useState<ClassSession[]>(initialClasses);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const confirmClass = (classId: string) => {
    setClasses((prev) =>
      prev.map((c) =>
        c.id === classId ? { ...c, status: "confirmed" as ClassStatus } : c
      )
    );
    toast.success("Class confirmed! Students will be notified.");
  };

  const openCancelDialog = (classId: string) => {
    setSelectedClassId(classId);
    setCancelReason("");
    setCancelDialogOpen(true);
  };

  const cancelClass = () => {
    if (!selectedClassId) return;

    setClasses((prev) =>
      prev.map((c) =>
        c.id === selectedClassId
          ? { ...c, status: "cancelled" as ClassStatus, cancellationReason: cancelReason }
          : c
      )
    );
    toast.success("Class cancelled. Students will be notified.");
    setCancelDialogOpen(false);
    setSelectedClassId(null);
    setCancelReason("");
  };

  const pendingCount = classes.filter((c) => c.status === "pending").length;
  const confirmedCount = classes.filter((c) => c.status === "confirmed").length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Classes Today</h1>
        <p className="text-gray-600">{today}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
          <p className="text-sm text-amber-700">Awaiting Confirmation</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{confirmedCount}</p>
          <p className="text-sm text-emerald-700">Confirmed</p>
        </div>
      </div>

      {/* Pending Alert */}
      {pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">
                You have {pendingCount} class{pendingCount > 1 ? "es" : ""} awaiting confirmation
              </p>
              <p className="text-sm text-amber-700 mt-1">
                Please confirm or cancel your classes so students can plan their day.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Class List */}
      <div className="space-y-4">
        {classes.map((classSession) => (
          <Card
            key={classSession.id}
            className={`${classSession.status === "cancelled" ? "opacity-60" : ""} hover:shadow-md transition-shadow`}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-blue-600">
                    {classSession.courseCode}
                  </p>
                  <CardTitle
                    className={`text-lg ${classSession.status === "cancelled" ? "line-through" : ""}`}
                  >
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
                  <span>
                    {classSession.startTime} - {classSession.endTime}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{classSession.venue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{classSession.enrolledStudents} students enrolled</span>
                </div>
              </div>

              {classSession.status === "cancelled" && classSession.cancellationReason && (
                <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded-md">
                  <p className="text-sm text-red-700">
                    <strong>Reason:</strong> {classSession.cancellationReason}
                  </p>
                </div>
              )}

              {classSession.status === "pending" && (
                <div className="mt-4 flex gap-2">
                  <Button
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => confirmClass(classSession.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Confirm Class
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                    onClick={() => openCancelDialog(classSession.id)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Cancel Class
                  </Button>
                </div>
              )}

              {classSession.status === "confirmed" && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    className="w-full border-red-300 text-red-600 hover:bg-red-50"
                    onClick={() => openCancelDialog(classSession.id)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Cancel Class
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {classes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No classes scheduled for today</p>
        </div>
      )}

      {/* Cancel Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Class</AlertDialogTitle>
            <AlertDialogDescription>
              Students will be notified immediately. Please provide a reason for
              cancellation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="e.g., Emergency meeting, feeling unwell, conference attendance..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Class</AlertDialogCancel>
            <AlertDialogAction
              onClick={cancelClass}
              className="bg-red-600 hover:bg-red-700"
              disabled={!cancelReason.trim()}
            >
              Cancel Class
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
