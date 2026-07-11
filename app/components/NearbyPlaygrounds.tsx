"use client";

import { useGeolocation } from "@/app/hooks/useGeolocation";
import { useNearbyPlaygrounds } from "@/app/hooks/useNearbyPlaygrounds";
import Playground from "./NearbyPlayground";
import styles from "@/app/page.module.css";

export default function NearbyPlaygrounds() {
  const geo = useGeolocation();
  const { playgrounds, loading, error, currentPage, totalPages, setCurrentPage, allPlaygroundsCount } = useNearbyPlaygrounds(geo);

  // Location status
  if (geo.status === "loading" || geo.status === "idle") {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyStateMessage}>Waiting for location access...</p>
      </div>
    );
  }

  if (geo.status === "error") {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyStateTitle}>Location Required</p>
        <p className={styles.emptyStateMessage}>{geo.error}</p>
      </div>
    );
  }

  // Playground results
  if (loading) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyStateMessage}>Loading playgrounds near you...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyStateTitle}>Error Loading Playgrounds</p>
        <p className={styles.emptyStateMessage}>{error}</p>
      </div>
    );
  }

  if (playgrounds.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyStateMessage}>No playgrounds found nearby.</p>
      </div>
    );
  }

  return (
    <div>
      <ul className={styles.list}>
        {playgrounds.map((playground) => (
          <Playground key={playground.id} playground={playground} />
        ))}
      </ul>
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "20px", alignItems: "center" }}>
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            style={{
              padding: "8px 12px",
              backgroundColor: currentPage === 1 ? "#ccc" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: currentPage === 1 ? "default" : "pointer",
            }}
          >
            Previous
          </button>
          <span style={{ margin: "0 10px", fontSize: "14px" }}>
            Page {currentPage} of {totalPages} ({allPlaygroundsCount} total)
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: "8px 12px",
              backgroundColor: currentPage === totalPages ? "#ccc" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: currentPage === totalPages ? "default" : "pointer",
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}