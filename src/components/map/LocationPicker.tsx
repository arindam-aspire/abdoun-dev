import React, { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const apiKey: string = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

interface Location {
  lat: number;
  lng: number;
}

interface LocationPickerProps {
  city?: string;
  area?: string;
  address?: string;
  onLocationSelect?: (location: Location) => void;
}

const containerStyle: React.CSSProperties = {
  width: "100%",
  height: "400px",
};

const fallbackLocation: Location = {
  lat: 31.9539, // Amman fallback
  lng: 35.9106,
};

const LocationPicker: React.FC<LocationPickerProps> = ({
  city,
  area,
  address,
  onLocationSelect,
}) => {
  const [mapCenter, setMapCenter] = useState<Location>(fallbackLocation);
  const [markerPosition, setMarkerPosition] =
    useState<Location>(fallbackLocation);
  const [isMapReady, setIsMapReady] = useState(false);

  // Get user current location on load
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setMapCenter(location);
        setMarkerPosition(location);

        onLocationSelect?.(location);
      },
      () => {
        console.log("User denied location permission");
      },
    );
  }, [onLocationSelect]);

  useEffect(() => {
    const locationParts = [address, area, city, "Jordan"]
      .map((value) => value?.trim())
      .filter(Boolean);

    if (
      !isMapReady ||
      locationParts.length < 2 ||
      typeof window === "undefined" ||
      !window.google?.maps
    ) {
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    const searchQuery = locationParts.join(", ");
    const timeoutId = window.setTimeout(() => {
      geocoder.geocode({ address: searchQuery }, (results, status) => {
        if (status !== "OK" || !results?.[0]?.geometry?.location) {
          return;
        }

        const location = {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng(),
        };

        setMapCenter(location);
        setMarkerPosition(location);
        onLocationSelect?.(location);
      });
    }, 500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [address, area, city, isMapReady, onLocationSelect]);

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;

    const location = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };

    setMarkerPosition(location);
    onLocationSelect?.(location);
  };

  const handleMarkerDrag = (event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;

    const location = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };

    setMarkerPosition(location);
    onLocationSelect?.(location);
  };

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <div>
        {/* Google Map */}
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={14}
          onClick={handleMapClick}
          onLoad={() => setIsMapReady(true)}
        >
          <Marker
            position={markerPosition}
            draggable
            onDragEnd={handleMarkerDrag}
          />
        </GoogleMap>
      </div>
    </LoadScript>
  );
};

export default LocationPicker;
