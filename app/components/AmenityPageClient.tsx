"use client";

import { useState } from "react";
import { listAmenities, deleteAmenity } from "@/app/actions/amenity";
import { amenityNameToDisplay } from "@/app/utils/amenityDisplay";
import AmenityCreateForm from "@/app/components/AmenityCreateForm";
import { Amenity } from "@/app/schemas/amenity";

interface AmenityPageClientProps {
  initialAmenities: Amenity[];
}

export default function AmenityPageClient({ initialAmenities }: AmenityPageClientProps) {
  const [amenities, setAmenities] = useState<Amenity[]>(initialAmenities);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadAmenities = async () => {
    try {
      setIsLoading(true);
      const data = await listAmenities();
      setAmenities(data);
    } catch (error) {
      console.error("Failed to load amenities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (amenityId: string) => {
    if (!confirm("Are you sure you want to delete this amenity?")) {
      return;
    }

    try {
      setDeletingId(amenityId);
      await deleteAmenity(amenityId);
      await loadAmenities();
    } catch (error) {
      console.error("Failed to delete amenity:", error);
      alert("Failed to delete amenity. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Amenities</h1>
      
      <AmenityCreateForm onSuccess={loadAmenities} />

      <div style={{ marginTop: "40px" }}>
        <h2>Existing Amenities</h2>
        {isLoading ? (
          <p>Loading amenities...</p>
        ) : amenities.length === 0 ? (
          <p>No amenities found.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {amenities.map((amenity) => (
              <li
                key={amenity.amenity_id}
                style={{
                  padding: "10px",
                  marginBottom: "8px",
                  backgroundColor: "#f9f9f9",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <strong>{amenityNameToDisplay(amenity.name)}</strong>
                  <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                    ID: {amenity.amenity_id}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(amenity.amenity_id)}
                  disabled={deletingId === amenity.amenity_id}
                  style={{
                    padding: "5px 10px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: deletingId === amenity.amenity_id ? "not-allowed" : "pointer",
                    opacity: deletingId === amenity.amenity_id ? 0.6 : 1,
                    fontSize: "12px",
                  }}
                >
                  {deletingId === amenity.amenity_id ? "Deleting..." : "Delete"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
