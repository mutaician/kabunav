"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, BookOpen, Users, Calendar } from "lucide-react";
import { toast } from "sonner";
import { createCourse, scheduleClass } from "@/lib/actions/course-actions";

interface Course {
  id: string;
  code: string;
  name: string;
  enrolledCount: number;
}

interface Venue {
  id: string;
  name: string;
  building: string;
}

interface LecturerCoursesClientProps {
  courses: Course[];
  venues: Venue[];
}

export function LecturerCoursesClient({ courses, venues }: LecturerCoursesClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  // Create course state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCourseCode, setNewCourseCode] = useState("");
  const [newCourseName, setNewCourseName] = useState("");

  // Schedule class state
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedVenueId, setSelectedVenueId] = useState("");

  const handleCreateCourse = () => {
    if (!newCourseCode.trim() || !newCourseName.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    startTransition(async () => {
      const result = await createCourse({
        code: newCourseCode,
        name: newCourseName,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Course created successfully!");
        setCreateDialogOpen(false);
        setNewCourseCode("");
        setNewCourseName("");
        router.refresh();
      }
    });
  };

  const handleScheduleClass = () => {
    if (!selectedCourseId || !scheduleDate || !startTime || !endTime || !selectedVenueId) {
      toast.error("Please fill in all fields");
      return;
    }

    startTransition(async () => {
      const result = await scheduleClass({
        courseId: selectedCourseId,
        scheduledDate: scheduleDate,
        startTime,
        endTime,
        venueId: selectedVenueId,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Class scheduled successfully!");
        setScheduleDialogOpen(false);
        setSelectedCourseId("");
        setScheduleDate("");
        setStartTime("");
        setEndTime("");
        setSelectedVenueId("");
        router.refresh();
      }
    });
  };

  // Get today's date for the date input min value
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-600">Manage your courses and schedule classes</p>
        </div>
        <div className="flex gap-2">
          {/* Create Course Dialog */}
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-1" />
                New Course
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Course</DialogTitle>
                <DialogDescription>
                  Add a new course to your teaching schedule.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Course Code</label>
                  <Input
                    placeholder="e.g., CS 301"
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Course Name</label>
                  <Input
                    placeholder="e.g., Database Systems"
                    value={newCourseName}
                    onChange={(e) => setNewCourseName(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateCourse}
                  disabled={isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isPending ? "Creating..." : "Create Course"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Schedule Class Dialog */}
          <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-1" />
                Schedule Class
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule a Class</DialogTitle>
                <DialogDescription>
                  Schedule a class session for one of your courses.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Course</label>
                  <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.code} - {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Date</label>
                  <Input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={today}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Start Time</label>
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">End Time</label>
                    <Input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Venue</label>
                  <Select value={selectedVenueId} onValueChange={setSelectedVenueId}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a venue" />
                    </SelectTrigger>
                    <SelectContent>
                      {venues.map((venue) => (
                        <SelectItem key={venue.id} value={venue.id}>
                          {venue.name} ({venue.building})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleScheduleClass}
                  disabled={isPending}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {isPending ? "Scheduling..." : "Schedule Class"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Courses List */}
      <div className="space-y-4">
        {courses.map((course) => (
          <Card key={course.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <Badge variant="outline" className="text-blue-600 border-blue-300 mb-1">
                      {course.code}
                    </Badge>
                    <CardTitle className="text-lg">{course.name}</CardTitle>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>{course.enrolledCount} student{course.enrolledCount !== 1 ? "s" : ""} enrolled</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No courses yet</p>
          <p className="text-sm text-gray-400 mt-1">Create your first course to get started</p>
        </div>
      )}
    </div>
  );
}
