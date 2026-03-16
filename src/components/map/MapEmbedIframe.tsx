import React from "react";

interface MapEmbedIframeProps {
  lat?: number;
  lng?: number;
  query?: string;
  title?: string;
  height?: number;
}

const iframeBaseStyle: React.CSSProperties = {
  width: "100%",
  border: 0,
};

export function buildGoogleMapsEmbedUrl(lat: number, lng: number) {
  const coordinates = `${lat},${lng}`;
  return `https://maps.google.com/maps?q=${encodeURIComponent(coordinates)}&z=15&output=embed`;
}

export function buildGoogleMapsQueryEmbedUrl(query: string) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;
}

const MapEmbedIframe: React.FC<MapEmbedIframeProps> = ({
  lat,
  lng,
  query,
  title = "Selected property location",
  height = 320,
}) => {
  const embedUrl =
    typeof lat === "number" && typeof lng === "number"
      ? buildGoogleMapsEmbedUrl(lat, lng)
      : buildGoogleMapsQueryEmbedUrl(query ?? "");

  return (
    <iframe
      title={title}
      src={embedUrl}
      style={{ ...iframeBaseStyle, height: `${height}px` }}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
    />
  );
};

export default MapEmbedIframe;
