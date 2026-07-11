import { useEffect, useState } from "react";

export type GeoState =
  | { status: "idle" | "loading"; coords: null; error: null }
  | { status: "ready"; coords: { latitude: number; longitude: number }; error: null }
  | { status: "error"; coords: null; error: string };

export function useGeolocation() {
  const [geo, setGeo] = useState<GeoState>({ status: "idle", coords: null, error: null });

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setGeo({ status: "error", coords: null, error: "Geolocation is not supported in this browser." });
      return;
    }

    setGeo({ status: "loading", coords: null, error: null });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setGeo({ status: "ready", coords: { latitude, longitude }, error: null });
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? "Location permission denied."
            : error.code === error.POSITION_UNAVAILABLE
              ? "Location unavailable."
              : error.code === error.TIMEOUT
                ? "Location request timed out."
                : "Could not retrieve location.";

        setGeo({ status: "error", coords: null, error: message });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, []);

  return geo;
}
