"use client";

import { useState, useEffect } from "react";
import { Button, SxProps, Theme } from "@mui/material";
import DirectionsIcon from "@mui/icons-material/Directions";
import MapsPreferenceModal from "./MapsPreferenceModal";
import { useGeolocation } from "@/app/hooks/useGeolocation";

interface NavigateButtonProps {
  lat: number;
  lon: number;
  fullWidth?: boolean;
  size?: "small" | "medium" | "large";
  sx?: SxProps<Theme>;
}

function getNavigationUrl(
  destinationLat: number,
  destinationLon: number,
  preference: "auto" | "apple" | "google" = "auto",
  originLat?: number,
  originLon?: number
): string {
  const isApple = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);

  const originParam = originLat !== undefined && originLon !== undefined ? `${originLat},${originLon}` : undefined;

  if (preference === "apple") {
    if (originParam) {
      return `https://maps.apple.com/?saddr=${originParam}&daddr=${destinationLat},${destinationLon}`;
    }
    return `https://maps.apple.com/?daddr=${destinationLat},${destinationLon}`;
  }
  if (preference === "google") {
    if (originParam) {
      return `https://www.google.com/maps/dir/?api=1&origin=${originParam}&destination=${destinationLat},${destinationLon}`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${destinationLat},${destinationLon}`;
  }
  // auto-detect
  if (isApple) {
    if (originParam) {
      return `https://maps.apple.com/?saddr=${originParam}&daddr=${destinationLat},${destinationLon}`;
    }
    return `https://maps.apple.com/?daddr=${destinationLat},${destinationLon}`;
  }
  if (originParam) {
    return `https://www.google.com/maps/dir/?api=1&origin=${originParam}&destination=${destinationLat},${destinationLon}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${destinationLat},${destinationLon}`;
}

export default function NavigateButton({
  lat,
  lon,
  fullWidth,
  size = "medium",
  sx,
}: NavigateButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [hasSavedPreference, setHasSavedPreference] = useState(false);
  const geo = useGeolocation();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mapsPreference");
      setHasSavedPreference(!!saved);
    }
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // If preference is saved, use it directly
    if (hasSavedPreference) {
      const preference = (localStorage.getItem("mapsPreference") as "auto" | "apple" | "google") || "auto";
      const url = getNavigationUrl(
        lat,
        lon,
        preference,
        geo.coords?.latitude,
        geo.coords?.longitude
      );
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      // Show modal to choose preference
      setModalOpen(true);
    }
  };

  const handleNavigate = (preference: "auto" | "apple" | "google") => {
    localStorage.setItem("mapsPreference", preference);
    const url = getNavigationUrl(
      lat,
      lon,
      preference,
      geo.coords?.latitude,
      geo.coords?.longitude
    );
    window.open(url, "_blank", "noopener,noreferrer");
    setModalOpen(false);
  };

  return (
    <>
      <Button
        onClick={handleClick}
        variant="outlined"
        size={size}
        startIcon={<DirectionsIcon />}
        fullWidth={fullWidth}
        sx={sx}
      >
        Get Directions
      </Button>
      <MapsPreferenceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onNavigate={handleNavigate}
      />
    </>
  );
}
