"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Phone, Bell, CheckCircle, AlertCircle, User, Mail } from "lucide-react";
import { toast } from "sonner";
import { updatePhoneNumber } from "@/lib/actions/user-actions";

interface SettingsClientProps {
  currentPhone: string;
  userName: string;
  userEmail: string;
}

export function SettingsClient({ currentPhone, userName, userEmail }: SettingsClientProps) {
  const [phone, setPhone] = useState(currentPhone);
  const [isPending, startTransition] = useTransition();

  const handleSavePhone = () => {
    // Basic validation
    if (phone && !phone.startsWith("+")) {
      toast.error("Phone number must start with + (e.g., +254712345678)");
      return;
    }

    startTransition(async () => {
      const result = await updatePhoneNumber(phone);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Phone number updated! You'll receive SMS notifications for your classes.");
      }
    });
  };

  const hasPhone = !!currentPhone;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your notification preferences</p>
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

      {/* SMS Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-emerald-600" />
                SMS Notifications
              </CardTitle>
              <CardDescription className="mt-1">
                Receive text messages when your classes are confirmed or cancelled
              </CardDescription>
            </div>
            {hasPhone ? (
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            ) : (
              <Badge variant="outline" className="border-amber-300 text-amber-600">
                <AlertCircle className="h-3 w-3 mr-1" />
                Not configured
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="tel"
                  placeholder="+254712345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={handleSavePhone}
                disabled={isPending || phone === currentPhone}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isPending ? "Saving..." : "Save"}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Use international format starting with + (e.g., +254712345678 for Kenya)
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">How it works</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• When a lecturer confirms a class, you&apos;ll get an SMS</li>
              <li>• When a class is cancelled, you&apos;ll be notified immediately</li>
              <li>• No more wasted trips to cancelled classes!</li>
            </ul>
          </div>

          {/* Sandbox Note */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-medium text-amber-800 mb-1">📱 Demo Mode</h4>
            <p className="text-sm text-amber-700">
              This app uses Africa&apos;s Talking sandbox. To receive SMS during the demo, 
              register your phone at{" "}
              <a
                href="https://simulator.africastalking.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                simulator.africastalking.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
