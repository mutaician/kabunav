"use client";

import dynamic from "next/dynamic";
import { Venue } from "./campus-map";

// Dynamically import the map component with no SSR
const CampusMap = dynamic(() => import("./campus-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <svg className="animate-spin h-8 w-8 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-sm text-gray-500">Loading map...</span>
      </div>
    </div>
  ),
});

interface MapWrapperProps {
  venues: Venue[];
  selectedVenueId?: string | null;
  onVenueSelect?: (venue: Venue) => void;
  showNavigation?: boolean;
  className?: string;
}

export function MapWrapper({
  venues,
  selectedVenueId,
  onVenueSelect,
  showNavigation = false,
  className = "",
}: MapWrapperProps) {
  return (
    <CampusMap
      venues={venues}
      selectedVenueId={selectedVenueId}
      onVenueSelect={onVenueSelect}
      showNavigation={showNavigation}
      className={className}
    />
  );
}
