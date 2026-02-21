"use client";

import { useState } from "react";
import { MapWrapper } from "@/components/map/map-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Navigation, ChevronRight } from "lucide-react";

interface Venue {
  id: string;
  name: string;
  building: string;
  floor: number | null;
  latitude: number;
  longitude: number;
  description: string | null;
}

interface MapPageClientProps {
  venues: Venue[];
}

export function MapPageClient({ venues }: MapPageClientProps) {
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Campus Map</h1>
        <p className="text-gray-600">Find lecture venues at Kabarak University</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <MapWrapper
                venues={venues}
                selectedVenueId={selectedVenueId}
                onVenueSelect={(venue) => setSelectedVenueId(venue.id)}
                showNavigation={true}
                className="h-[500px] lg:h-[600px]"
              />
            </CardContent>
          </Card>
        </div>

        {/* Venue List Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-emerald-600" />
                  Lecture Venues
                </span>
                <Badge variant="secondary">{venues.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
              {venues.map((venue) => (
                <button
                  key={venue.id}
                  onClick={() => setSelectedVenueId(venue.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedVenueId === venue.id
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 hover:border-emerald-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm">
                        {venue.building}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">{venue.name}</p>
                      {venue.floor !== null && (
                        <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          Floor {venue.floor}
                        </span>
                      )}
                    </div>
                    <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${
                      selectedVenueId === venue.id ? "text-emerald-600 rotate-90" : ""
                    }`} />
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Navigation className="h-4 w-4 text-emerald-600" />
                Navigation Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              <p>• Tap the location button to find your position</p>
              <p>• Select a venue to see details</p>
              <p>• Use &quot;Navigate&quot; to get walking directions</p>
              <p>• Pinch to zoom in/out on the map</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
