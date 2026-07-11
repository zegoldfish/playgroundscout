"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePlaygroundExists } from "@/app/hooks/usePlaygroundExists";
import { savePlayground } from "@/app/actions/playground";
import { listAmenities } from "@/app/actions/amenity";
import { amenityNameToDisplay } from "@/app/utils/amenityDisplay";
import { getTileUrl } from "@/app/utils/tiles";
import RatingDisplay from "./RatingDisplay";
import styles from "@/app/page.module.css";

interface PlaygroundProps {
  playground: {
    id: number;
    name: string;
    lat: number;
    lon: number;
    distance?: number;
    tags?: Record<string, string>;
  }
}

// Helper to get emoji based on leisure type
function getLeisureEmoji(leisure: string | undefined): string {
  if (!leisure) return "🎯";
  if (leisure === "playground") return "🛝";
  if (leisure === "park") return "🌳";
  return "🎯";
}

// Helper to extract and format relevant tag chips
function getTagChips(tags: Record<string, string> | undefined): Array<{ label: string; type: string }> {
  if (!tags) return [];
  
  const chips: Array<{ label: string; type: string }> = [];
  
  // Leisure type
  if (tags.leisure) {
    chips.push({
      label: tags.leisure === "playground" ? "Playground" : "Park",
      type: "leisure",
    });
  }
  
  // Surface
  if (tags.surface) {
    const surfaceLabel = {
      grass: "Grass",
      asphalt: "Asphalt",
      paved_smooth: "Paved",
      wood_chips: "Wood chips",
      sand: "Sand",
      rubber: "Rubber",
    }[tags.surface] || "Park";
    chips.push({ label: surfaceLabel, type: "surface" });
  }
  
  // Lit
  if (tags.lit === "yes") {
    chips.push({ label: "Lit", type: "feature" });
  }
  
  // Wheelchair accessible
  if (tags.wheelchair === "yes") {
    chips.push({ label: "Accessible", type: "feature" });
  }
  
  // Fee
  if (tags.fee === "yes") {
    chips.push({ label: "Paid", type: "feature" });
  }
  
  // Restricted access
  if (tags.access === "private" || tags.access === "customers") {
    chips.push({ label: "Restricted", type: "feature" });
  }
  
  return chips.slice(0, 4); // Limit to 4 chips
}

// Helper to get emoji for amenity type
function getAmenityEmoji(amenityName: string): string {
  const lowerName = amenityName.toLowerCase();
  if (lowerName.includes("swing")) return "🎪";
  if (lowerName.includes("slide")) return "🛝";
  if (lowerName.includes("basketball")) return "🏀";
  if (lowerName.includes("tennis")) return "🎾";
  if (lowerName.includes("picnic")) return "🧺";
  if (lowerName.includes("table")) return "🏓";
  if (lowerName.includes("bench")) return "🪑";
  if (lowerName.includes("fountain")) return "💧";
  if (lowerName.includes("grill")) return "🔥";
  if (lowerName.includes("wheelchair")) return "♿";
  return "✨";
}

export default function Playground({ playground }: PlaygroundProps) {
  const { exists, storedName, playground: savedPlayground, loading, refetch } = usePlaygroundExists(playground.id);
  const [saving, setSaving] = useState(false);
  const [amenityNames, setAmenityNames] = useState<string[]>([]);
  const [amenitiesLoaded, setAmenitiesLoaded] = useState(false);
  
  // Load amenities when playground is saved
  useEffect(() => {
    const loadAmenityNames = async () => {
      if (!savedPlayground?.amenities || savedPlayground.amenities.length === 0) {
        setAmenitiesLoaded(true);
        return;
      }

      try {
        const allAmenities = await listAmenities();
        const amenityMap = new Map(allAmenities.map((a) => [a.amenity_id, amenityNameToDisplay(a.name)]));
        const names = savedPlayground.amenities
          .map((id) => amenityMap.get(id))
          .filter((name): name is string => name !== undefined);
        setAmenityNames(names);
        setAmenitiesLoaded(true);
      } catch (error) {
        console.error("Failed to load amenity names:", error);
        setAmenitiesLoaded(true);
      }
    };
    loadAmenityNames();
  }, [savedPlayground?.amenities]);

  const displayName = storedName ?? playground.name;
  const emoji = getLeisureEmoji(playground.tags?.leisure);
  const chips = getTagChips(playground.tags);

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await savePlayground({
        osm_id: playground.id,
        name: playground.name,
        latitude: playground.lat,
        longitude: playground.lon,
        tags: playground.tags,
      });
      
      if (result.success) {
        refetch();
      } else {
        alert(`Failed to save: ${result.error}`);
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const cardContent = (
    <div className={`${styles.card} ${exists ? styles.cardSaved : styles.cardUnsaved}`}>
      {/* Header with tile map image */}
      <div className={styles.cardHeader}>
        <img
          src={getTileUrl(playground.lat, playground.lon)}
          alt={`Map of ${displayName}`}
          className={styles.cardHeaderImage}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <span className={styles.cardHeaderEmojiOverlay}>{emoji}</span>
        <span className={styles.cardHeaderAttribution}>© OSM</span>
      </div>
      
      {/* Body content */}
      <div className={styles.cardBody}>
        {/* Title row with distance badge */}
        <div className={styles.cardTitleRow}>
          <h3 className={styles.cardName}>{displayName}</h3>
          {playground.distance && (
            <span className={styles.cardDistanceBadge}>
              {playground.distance.toFixed(1)} km
            </span>
          )}
        </div>
        
        {/* Rating display - only show for saved playgrounds */}
        {exists && savedPlayground && (
          <div className={styles.cardRatingRow}>
            <RatingDisplay
              rating={savedPlayground.average_rating}
              count={savedPlayground.rating_count}
              size="small"
            />
          </div>
        )}
        
        {/* Tag chips */}
        {chips.length > 0 && (
          <div className={styles.cardChips}>
            {chips.map((chip) => (
              <span
                key={chip.label}
                className={`${styles.cardChip} ${styles[`cardChip${chip.type.charAt(0).toUpperCase() + chip.type.slice(1)}`]}`}
              >
                {chip.label}
              </span>
            ))}
          </div>
        )}
        
        {/* Amenities Section - only show for saved playgrounds */}
        {exists && amenitiesLoaded && amenityNames.length > 0 && (
          <div className={styles.cardAmenitiesSection}>
            <h4 className={styles.cardAmenitiesTitle}>Amenities</h4>
            <div className={styles.cardAmenitiesList}>
              {amenityNames.map((name) => (
                <div key={name} className={styles.cardAmenityItem}>
                  <span className={styles.cardAmenityEmoji}>{getAmenityEmoji(name)}</span>
                  <span className={styles.cardAmenityName}>{name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Footer with status and action */}
        <div className={styles.cardFooter}>
          <div className={styles.cardStatus}>
            {loading ? (
              <span className={styles.cardStatusChecking}>Checking...</span>
            ) : exists ? (
              <span className={styles.cardStatusSaved}>✓ In Database</span>
            ) : (
              <span className={styles.cardStatusNotSaved}>⊘ Not saved yet</span>
            )}
          </div>
          {exists === false && !loading && (
            <button
              onClick={handleSave}
              disabled={saving}
              className={styles.addToScoutButton}
            >
              {saving ? "Adding..." : "Add to Scout"}
            </button>
          )}
          {exists === true && (
            <span className={styles.viewDetailsIndicator}>View →</span>
          )}
        </div>
      </div>
    </div>
  );

  // If saved to DB, wrap in a link to the detail page
  if (exists === true) {
    return (
      <li>
        <Link
          href={`/playground/playground-${playground.id}`}
          className={styles.cardWrapper}
        >
          {cardContent}
        </Link>
      </li>
    );
  }

  // If not saved, render as plain card (no link)
  return (
    <li>
      {cardContent}
    </li>
  );
}
