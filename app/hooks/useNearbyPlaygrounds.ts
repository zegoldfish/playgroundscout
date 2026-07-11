import { useEffect, useState } from "react";
import type { GeoState } from "@/app/hooks/useGeolocation";

export interface Playground {
  id: number;
  name: string;
  lat: number;
  lon: number;
  distance?: number;
  tags?: Record<string, string>;
}

interface UseNearbyPlaygroundsOptions {
  radius?: number; // Search radius in meters
}

// Helper function to retry fetch with exponential backoff
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3,
  baseDelay = 1000
): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // If response is OK, return it
      if (response.ok) {
        return response;
      }

      // If it's a rate limit (429) or server error (5xx), retry
      if (response.status === 429 || response.status >= 500) {
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt);
          console.log(`Overpass API error ${response.status}, retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
      }

      // For other errors, throw immediately
      throw new Error(`HTTP error! status: ${response.status}`);
    } catch (error) {
      // Retry on timeout or network errors
      if (attempt < maxRetries && (error instanceof Error && 
          (error.name === 'AbortError' || error.message.includes('fetch')))) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Overpass API timeout/error, retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      // If it's the last attempt or a different error, throw
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}

const ITEMS_PER_PAGE = 10;
const CACHE_KEY_PREFIX = "playgrounds_cache_";
const CACHE_EXPIRY_MINUTES = 30;

interface CacheData {
  playgrounds: Playground[];
  timestamp: number;
}

function getCacheKey(lat: number, lon: number, radius: number): string {
  // Round coordinates to 4 decimal places (~11m precision) to group similar locations
  const roundedLat = Math.round(lat * 10000) / 10000;
  const roundedLon = Math.round(lon * 10000) / 10000;
  return `${CACHE_KEY_PREFIX}${roundedLat}_${roundedLon}_${radius}`;
}

function getFromCache(key: string): Playground[] | null {
  try {
    if (typeof window === "undefined") return null;
    
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const data: CacheData = JSON.parse(cached);
    const now = Date.now();
    const expiryMs = CACHE_EXPIRY_MINUTES * 60 * 1000;

    // Check if cache is still valid
    if (now - data.timestamp > expiryMs) {
      localStorage.removeItem(key);
      return null;
    }

    return data.playgrounds;
  } catch (error) {
    console.warn("Error reading from cache:", error);
    return null;
  }
}

function saveToCache(key: string, playgrounds: Playground[]): void {
  try {
    if (typeof window === "undefined") return;

    const data: CacheData = {
      playgrounds,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn("Error saving to cache:", error);
  }
}

export function useNearbyPlaygrounds(geo: GeoState, options: UseNearbyPlaygroundsOptions = {}) {
  const { radius = 2000 } = options;
  const [allPlaygrounds, setAllPlaygrounds] = useState<Playground[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const OVERPASS_API_URL = "https://overpass-api.de/api/interpreter";

  useEffect(() => {
    if (geo.status !== "ready" || !geo.coords) {
      return;
    }

    const fetchPlaygrounds = async () => {
      setLoading(true);
      setError(null);

      try {
        const { latitude, longitude } = geo.coords;
        const cacheKey = getCacheKey(latitude, longitude, radius);

        // Check cache first
        const cachedPlaygrounds = getFromCache(cacheKey);
        if (cachedPlaygrounds) {
          console.log("Loading playgrounds from cache");
          setAllPlaygrounds(cachedPlaygrounds);
          setCurrentPage(1);
          setLoading(false);
          return;
        }

        // Overpass API query to find playgrounds and parks
        const query = `
          [out:json];
          (
            node["leisure"="playground"](around:${radius},${latitude},${longitude});
            way["leisure"="playground"](around:${radius},${latitude},${longitude});
            relation["leisure"="playground"](around:${radius},${latitude},${longitude});
            node["leisure"="park"](around:${radius},${latitude},${longitude});
            way["leisure"="park"](around:${radius},${latitude},${longitude});
            relation["leisure"="park"](around:${radius},${latitude},${longitude});
          );
          out center;
        `;

        const response = await fetchWithRetry(OVERPASS_API_URL, {
          method: "POST",
          body: query,
        });

        const data = await response.json();

        // Process the results
        const playgroundList: Playground[] = data.elements.map((element: any) => {
          const lat = element.lat || element.center?.lat;
          const lon = element.lon || element.center?.lon;

          // Calculate distance from user
          const distance = lat && lon ? calculateDistance(latitude, longitude, lat, lon) : undefined;
          console.log("Playground:", element);
          return {
            id: element.id,
            name: element.tags?.name || element.tags?.operator || "Unnamed Playground",
            lat,
            lon,
            distance,
            tags: element.tags,
          };
        });

        // Sort by distance
        playgroundList.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));

        // Save to cache
        saveToCache(cacheKey, playgroundList);

        setAllPlaygrounds(playgroundList);
        setCurrentPage(1);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch playgrounds");
      } finally {
        setLoading(false);
      }
    };

    fetchPlaygrounds();
  }, [geo, radius]);

  const totalPages = Math.ceil(allPlaygrounds.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const playgrounds = allPlaygrounds.slice(startIndex, endIndex);

  return {
    playgrounds,
    loading,
    error,
    currentPage,
    totalPages,
    setCurrentPage,
    allPlaygroundsCount: allPlaygrounds.length,
  };
}

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
