"use client";

import { useState } from "react";
import { listParkings, deleteParking } from "@/app/actions/parking";
import ParkingCreateForm from "@/app/components/ParkingCreateForm";
import { Parking } from "@/app/schemas/parking";

interface ParkingPageClientProps {
  initialParkings: Parking[];
}

export default function ParkingPageClient({ initialParkings }: ParkingPageClientProps) {
  const [parkings, setParkings] = useState<Parking[]>(initialParkings);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadParkings = async () => {
    try {
      setIsLoading(true);
      const data = await listParkings();
      setParkings(data);
    } catch (error) {
      console.error("Failed to load parkings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (parkingId: string) => {
    if (!confirm("Are you sure you want to delete this parking?")) {
      return;
    }

    try {
      setDeletingId(parkingId);
      await deleteParking(parkingId);
      await loadParkings();
    } catch (error) {
      console.error("Failed to delete parking:", error);
      alert("Failed to delete parking. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Parkings</h1>
      
      <ParkingCreateForm onSuccess={loadParkings} />

      <div style={{ marginTop: "40px" }}>
        <h2>Existing Parkings</h2>
        {isLoading ? (
          <p>Loading parkings...</p>
        ) : parkings.length === 0 ? (
          <p>No parkings found.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {parkings.map((parking) => (
              <li
                key={parking.parking_id}
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
                  <strong>{parking.name}</strong>
                  <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                    ID: {parking.parking_id}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(parking.parking_id)}
                  disabled={deletingId === parking.parking_id}
                  style={{
                    padding: "5px 10px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: deletingId === parking.parking_id ? "not-allowed" : "pointer",
                    opacity: deletingId === parking.parking_id ? 0.6 : 1,
                    fontSize: "12px",
                  }}
                >
                  {deletingId === parking.parking_id ? "Deleting..." : "Delete"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
