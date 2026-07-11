"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { Playground as PlaygroundType } from "@/app/schemas/playground";
import { listAmenities } from "@/app/actions/amenity";
import { amenityNameToDisplay } from "@/app/utils/amenityDisplay";
import { listParkings } from "@/app/actions/parking";
import RatingDisplay from "./RatingDisplay";
import RatingForm from "./RatingForm";
import styles from "./playground.module.css";

const PlaygroundMap = dynamic(() => import("./PlaygroundMap"), {
  ssr: false,
  loading: () => <div style={{ height: "320px", width: "100%", backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px" }}>Loading map...</div>,
});

interface PlaygroundProps {
  playground: PlaygroundType;
}

export default function Playground({ playground }: PlaygroundProps) {
  const { data: session } = useSession();
  const [amenityNames, setAmenityNames] = useState<string[]>([]);
  const [amenitiesLoaded, setAmenitiesLoaded] = useState(false);
  const [parkingNames, setParkingNames] = useState<string[]>([]);
  const [parkingsLoaded, setParkingsLoaded] = useState(false);
  const [isEditingRating, setIsEditingRating] = useState(false);

  useEffect(() => {
    const loadAmenityNames = async () => {
      if (!playground.amenities || playground.amenities.length === 0) {
        setAmenitiesLoaded(true);
        return;
      }

      try {
        const allAmenities = await listAmenities();
        const amenityMap = new Map(allAmenities.map((a) => [a.amenity_id, amenityNameToDisplay(a.name)]));
        const names = playground.amenities
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
  }, [playground.amenities]);

  useEffect(() => {
    const loadParkingNames = async () => {
      if (!playground.parkings || playground.parkings.length === 0) {
        setParkingsLoaded(true);
        return;
      }

      try {
        const allParkings = await listParkings();
        const parkingMap = new Map(allParkings.map((p) => [p.parking_id, p.name]));
        const names = playground.parkings
          .map((id) => parkingMap.get(id))
          .filter((name): name is string => name !== undefined);
        setParkingNames(names);
        setParkingsLoaded(true);
      } catch (error) {
        console.error("Failed to load parking names:", error);
        setParkingsLoaded(true);
      }
    };
    loadParkingNames();
  }, [playground.parkings]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={styles.contentPanel}>
      {/* Map Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Location</h2>
        <div className={styles.mapContainer}>
          <PlaygroundMap
            latitude={playground.latitude}
            longitude={playground.longitude}
            name={playground.name}
          />
        </div>
      </section>

      {/* Rating Section */}
      <section className={styles.section}>
        <div className={styles.ratingHeader}>
          <h2 className={styles.sectionTitle}>Rating</h2>
          {session?.user && (
            <button
              onClick={() => setIsEditingRating(!isEditingRating)}
              className={styles.editButton}
            >
              {isEditingRating ? "Cancel" : "Add Rating"}
            </button>
          )}
        </div>

        {isEditingRating && session?.user ? (
          <RatingForm
            playgroundId={playground.park_id}
            userId={(session.user as any).id}
            onSuccess={() => setIsEditingRating(false)}
            onCancel={() => setIsEditingRating(false)}
          />
        ) : (
          <div className={styles.ratingDisplay}>
            <div className={styles.ratingSection}>
              <span className={styles.ratingLabel}>Average Rating:</span>
              <RatingDisplay
                rating={playground.average_rating}
                count={playground.rating_count}
                size="large"
              />
            </div>
          </div>
        )}

        {!session?.user && (
          <p className={styles.emptyState} style={{ marginTop: "1rem", textAlign: "center" }}>
            Sign in to add your rating
          </p>
        )}
      </section>

      {/* Amenities Section */}
      {playground.amenities && playground.amenities.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Amenities</h2>
          {!amenitiesLoaded ? (
            <p className={styles.emptyState}>Loading amenities...</p>
          ) : amenityNames.length > 0 ? (
            <div className={styles.pillList}>
              {amenityNames.map((name, index) => (
                <span key={index} className={`${styles.pill} ${styles.pillAmenity}`}>
                  {name}
                </span>
              ))}
            </div>
          ) : (
            <p className={styles.emptyState}>No amenities available</p>
          )}
        </section>
      )}

      {/* Parking Section */}
      {playground.parkings && playground.parkings.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Parking</h2>
          {!parkingsLoaded ? (
            <p className={styles.emptyState}>Loading parking...</p>
          ) : parkingNames.length > 0 ? (
            <div className={styles.pillList}>
              {parkingNames.map((name, index) => (
                <span key={index} className={`${styles.pill} ${styles.pillParking}`}>
                  {name}
                </span>
              ))}
            </div>
          ) : (
            <p className={styles.emptyState}>No parking available</p>
          )}
        </section>
      )}

      {/* OSM Tags Section - Collapsible */}
      {playground.osm_tags && Object.keys(playground.osm_tags).length > 0 && (
        <section className={styles.section}>
          <details className={styles.tagsDetails}>
            <summary>Additional Tags</summary>
            <div className={styles.tagsGrid}>
              {Object.entries(playground.osm_tags).map(([key, value]) => (
                <div key={key} className={styles.tagEntry}>
                  <div className={styles.tagKey}>{key}</div>
                  <div className={styles.tagValue}>{value}</div>
                </div>
              ))}
            </div>
          </details>
        </section>
      )}

      {/* Metadata Footer */}
      <div className={styles.metadata}>
        <div className={styles.metadataGrid}>
          <div className={styles.metadataEntry}>
            <span className={styles.metadataLabel}>Park ID</span>
            <span className={styles.metadataValue}>{playground.park_id}</span>
          </div>
          <div className={styles.metadataEntry}>
            <span className={styles.metadataLabel}>OSM ID</span>
            <span className={styles.metadataValue}>{playground.osm_id}</span>
          </div>
          <div className={styles.metadataEntry}>
            <span className={styles.metadataLabel}>Latitude</span>
            <span className={styles.metadataValue}>{playground.latitude}</span>
          </div>
          <div className={styles.metadataEntry}>
            <span className={styles.metadataLabel}>Longitude</span>
            <span className={styles.metadataValue}>{playground.longitude}</span>
          </div>
          <div className={styles.metadataEntry}>
            <span className={styles.metadataLabel}>Created</span>
            <span className={styles.metadataTimestamp}>{formatDate(playground.created_at)}</span>
          </div>
          <div className={styles.metadataEntry}>
            <span className={styles.metadataLabel}>Updated</span>
            <span className={styles.metadataTimestamp}>{formatDate(playground.updated_at)}</span>
          </div>
          {playground.location_hash && (
            <div className={styles.metadataEntry}>
              <span className={styles.metadataLabel}>Location Hash</span>
              <span className={styles.metadataValue}>{playground.location_hash}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
