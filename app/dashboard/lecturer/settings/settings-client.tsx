"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail } from "lucide-react";

interface SettingsClientProps {
  currentPhone: string;
  userName: string;
  userEmail: string;
}

export function SettingsClient({ userName, userEmail }: SettingsClientProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account settings</p>
      </div>

      {/* Profile Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-emerald-600" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-gray-400" />
            <span className="text-gray-700">{userEmail}</span>
          </div>
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-gray-400" />
            <span className="text-gray-700">{userName}</span>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card>
        <CardHeader>
          <CardTitle>SMS Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            When you confirm or cancel a class, students enrolled in that course 
            will automatically receive an SMS notification (if they have registered 
            their phone number).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
