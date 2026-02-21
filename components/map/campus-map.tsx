"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet with webpack
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const UserIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const DestinationIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

export interface Venue {
  id: string;
  name: string;
  building: string;
  latitude: number;
  longitude: number;
  description: string | null;
}

interface CampusMapProps {
  venues: Venue[];
  selectedVenueId?: string | null;
  onVenueSelect?: (venue: Venue) => void;
  showNavigation?: boolean;
  className?: string;
}

// Kabarak University center coordinates (main campus)
// Based on real GPS coordinates: -0.16648, 35.96491
const KABARAK_CENTER: [number, number] = [-0.16648, 35.96491];
const DEFAULT_ZOOM = 17;

export function CampusMap({
  venues,
  selectedVenueId,
  onVenueSelect,
  showNavigation = false,
  className = "",
}: CampusMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const routeLineRef = useRef<L.Polyline | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [walkingTime, setWalkingTime] = useState<number | null>(null);

  // Derive selected venue from ID
  const selectedVenue = useMemo(() => {
    return venues.find((v) => v.id === selectedVenueId) || null;
  }, [venues, selectedVenueId]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: KABARAK_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
    });

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add campus boundary circle (approximate)
    L.circle(KABARAK_CENTER, {
      radius: 500, // 500m radius
      color: "#10b981",
      fillColor: "#10b981",
      fillOpacity: 0.05,
      weight: 2,
      dashArray: "5, 10",
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Add venue markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    // Add markers for each venue
    venues.forEach((venue) => {
      if (!venue.latitude || !venue.longitude) return;

      const isSelected = venue.id === selectedVenueId;
      const marker = L.marker([venue.latitude, venue.longitude], {
        icon: isSelected ? DestinationIcon : DefaultIcon,
      }).addTo(mapRef.current!);

      // Create popup content
      const popupContent = `
        <div class="p-2 min-w-[200px]">
          <h3 class="font-bold text-emerald-700 text-base">${venue.building}</h3>
          <p class="text-sm text-gray-700 mt-1">${venue.name}</p>
          ${venue.description ? `<p class="text-xs text-gray-500 mt-1">${venue.description}</p>` : ""}
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on("click", () => {
        onVenueSelect?.(venue);
      });

      markersRef.current.set(venue.id, marker);
    });
  }, [venues, selectedVenueId, onVenueSelect]);

  // Handle selected venue changes - pan map to venue
  useEffect(() => {
    if (!mapRef.current || !selectedVenueId) return;

    const venue = venues.find((v) => v.id === selectedVenueId);
    if (venue) {
      mapRef.current.setView([venue.latitude, venue.longitude], 18);
      
      const marker = markersRef.current.get(venue.id);
      if (marker) {
        marker.openPopup();
      }
    }
  }, [selectedVenueId, venues]);

  // Get user location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        setIsLocating(false);

        // Add or update user marker
        if (mapRef.current) {
          if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng([latitude, longitude]);
          } else {
            userMarkerRef.current = L.marker([latitude, longitude], {
              icon: UserIcon,
            })
              .addTo(mapRef.current)
              .bindPopup("<strong>You are here</strong>");
          }
          userMarkerRef.current.openPopup();
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        setIsLocating(false);
        // For demo purposes, simulate a location near the campus
        const simulatedLocation: [number, number] = [
          KABARAK_CENTER[0] + (Math.random() - 0.5) * 0.002,
          KABARAK_CENTER[1] + (Math.random() - 0.5) * 0.002,
        ];
        setUserLocation(simulatedLocation);
        
        if (mapRef.current) {
          if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng(simulatedLocation);
          } else {
            userMarkerRef.current = L.marker(simulatedLocation, {
              icon: UserIcon,
            })
              .addTo(mapRef.current)
              .bindPopup("<strong>You are here (simulated)</strong>");
          }
          userMarkerRef.current.openPopup();
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Calculate route between user and destination
  const showRoute = () => {
    if (!mapRef.current || !userLocation || !selectedVenue) return;

    // Remove existing route
    if (routeLineRef.current) {
      routeLineRef.current.remove();
    }

    const destination: [number, number] = [selectedVenue.latitude, selectedVenue.longitude];

    // Calculate distance (Haversine formula)
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (userLocation[0] * Math.PI) / 180;
    const φ2 = (destination[0] * Math.PI) / 180;
    const Δφ = ((destination[0] - userLocation[0]) * Math.PI) / 180;
    const Δλ = ((destination[1] - userLocation[1]) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceMeters = R * c;

    setDistance(Math.round(distanceMeters));
    setWalkingTime(Math.round(distanceMeters / 80)); // ~80m/min walking speed

    // Draw route line with animation effect
    const routePoints: [number, number][] = [userLocation, destination];
    
    routeLineRef.current = L.polyline(routePoints, {
      color: "#10b981",
      weight: 4,
      opacity: 0.8,
      dashArray: "10, 10",
      lineCap: "round",
    }).addTo(mapRef.current);

    // Add walking direction line (thicker background)
    L.polyline(routePoints, {
      color: "#059669",
      weight: 6,
      opacity: 0.6,
    }).addTo(mapRef.current);

    // Fit bounds to show entire route
    const bounds = L.latLngBounds([userLocation, destination]);
    mapRef.current.fitBounds(bounds, { padding: [50, 50] });
  };

  // Clear route
  const clearRoute = () => {
    if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }
    setDistance(null);
    setWalkingTime(null);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Map Container */}
      <div
        ref={mapContainerRef}
        className="w-full h-full rounded-lg overflow-hidden"
        style={{ minHeight: "400px" }}
      />

      {/* Controls Overlay */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <button
          onClick={getUserLocation}
          disabled={isLocating}
          className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          title="Get my location"
        >
          {isLocating ? (
            <svg className="animate-spin h-5 w-5 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>

        <button
          onClick={() => mapRef.current?.setView(KABARAK_CENTER, DEFAULT_ZOOM)}
          className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
          title="Center map"
        >
          <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>
      </div>

      {/* Navigation Info Panel */}
      {showNavigation && selectedVenue && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">{selectedVenue.building}</h3>
              <p className="text-sm text-gray-600">{selectedVenue.name}</p>
              
              {distance !== null && walkingTime !== null && (
                <div className="mt-2 flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-emerald-600">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    {distance} m
                  </span>
                  <span className="flex items-center gap-1 text-gray-600">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    ~{walkingTime} min walk
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              {userLocation && !distance && (
                <button
                  onClick={showRoute}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                >
                  Navigate
                </button>
              )}
              {distance && (
                <button
                  onClick={clearRoute}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                >
                  Clear
                </button>
              )}
              {!userLocation && (
                <button
                  onClick={getUserLocation}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                >
                  Get Location
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur rounded-lg shadow p-3 text-xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Your Location</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Destination</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
          <span>Campus Buildings</span>
        </div>
      </div>
    </div>
  );
}

export default CampusMap;
