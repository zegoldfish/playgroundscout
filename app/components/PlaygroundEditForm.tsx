"use client";

import { useState, useEffect } from "react";
import { updatePlayground } from "@/app/actions/playground";
import { listAmenities } from "@/app/actions/amenity";
import { amenityNameToDisplay } from "@/app/utils/amenityDisplay";
import { listParkings } from "@/app/actions/parking";
import { Playground } from "@/app/schemas/playground";
import { Amenity } from "@/app/schemas/amenity";
import { Parking } from "@/app/schemas/parking";
import AmenityCreateInline from "@/app/components/AmenityCreateInline";

interface PlaygroundEditFormProps {
  playground: Playground;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function PlaygroundEditForm({
  playground,
  onSuccess,
  onCancel,
}: PlaygroundEditFormProps) {
  const [formData, setFormData] = useState({
    name: playground.name,
    amenities: playground.amenities || [],
    parkings: playground.parkings || [],
  });

  const [availableAmenities, setAvailableAmenities] = useState<Amenity[]>([]);
  const [amenitiesLoaded, setAmenitiesLoaded] = useState(false);
  const [availableParkings, setAvailableParkings] = useState<Parking[]>([]);
  const [parkingsLoaded, setParkingsLoaded] = useState(false);

  useEffect(() => {
    const loadAmenities = async () => {
      try {
        const amenities = await listAmenities();
        setAvailableAmenities(amenities);
        setAmenitiesLoaded(true);
      } catch (error) {
        console.error("Failed to load amenities:", error);
        setAmenitiesLoaded(true);
      }
    };
    loadAmenities();
  }, []);

  useEffect(() => {
    const loadParkings = async () => {
      try {
        const parkings = await listParkings();
        setAvailableParkings(parkings);
        setParkingsLoaded(true);
      } catch (error) {
        console.error("Failed to load parkings:", error);
        setParkingsLoaded(true);
      }
    };
    loadParkings();
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmenityChange = (amenityId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      amenities: checked
        ? [...prev.amenities, amenityId]
        : prev.amenities.filter((id) => id !== amenityId),
    }));
  };

  const handleParkingChange = (parkingId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      parkings: checked
        ? [...prev.parkings, parkingId]
        : prev.parkings.filter((id) => id !== parkingId),
    }));
  };

  const handleAmenityCreated = (newAmenity: Amenity) => {
    // Add the new amenity to the available list
    setAvailableAmenities((prev) => [...prev, newAmenity]);
    
    // Automatically check/select the new amenity
    setFormData((prev) => ({
      ...prev,
      amenities: [...prev.amenities, newAmenity.amenity_id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {

      const updateData: Parameters<typeof updatePlayground>[1] = {
        name: formData.name,
      };

      if (formData.amenities) {
        updateData.amenities = formData.amenities;
      }

      if (formData.parkings) {
        updateData.parkings = formData.parkings;
      }

      const result = await updatePlayground(playground.park_id, updateData);

      if (result.success) {
        setMessage({ type: "success", text: "Playground updated successfully!" });
        onSuccess?.();
      } else {
        setMessage({ type: "error", text: result.error || "Failed to update playground" });
      }
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "An error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "500px", margin: "20px 0" }}>
      <h2>Edit Playground</h2>

      <div style={{ marginBottom: "15px" }}>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label htmlFor="latitude">Latitude</label>
        <input
          type="number"
          id="latitude"
          name="latitude"
          value={playground.latitude}
          readOnly
          style={{ width: "100%", padding: "8px", boxSizing: "border-box", background: '#f5f5f5' }}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label htmlFor="longitude">Longitude</label>
        <input
          type="number"
          id="longitude"
          name="longitude"
          value={playground.longitude}
          readOnly
          style={{ width: "100%", padding: "8px", boxSizing: "border-box", background: '#f5f5f5' }}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>Amenities</label>
        <div style={{ marginTop: "8px" }}>
          {!amenitiesLoaded ? (
            <p>Loading amenities...</p>
          ) : availableAmenities.length === 0 ? (
            <p>No amenities available</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {availableAmenities.map((amenity) => (
                <div key={amenity.amenity_id} style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    id={`amenity-${amenity.amenity_id}`}
                    checked={formData.amenities.includes(amenity.amenity_id)}
                    onChange={(e) => handleAmenityChange(amenity.amenity_id, e.target.checked)}
                    style={{ marginRight: "8px" }}
                  />
                  <label htmlFor={`amenity-${amenity.amenity_id}`} style={{ margin: 0, cursor: "pointer" }}>
                    {amenityNameToDisplay(amenity.name)}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
        <AmenityCreateInline onAmenityCreated={handleAmenityCreated} />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>Parking</label>
        <div style={{ marginTop: "8px" }}>
          {!parkingsLoaded ? (
            <p>Loading parkings...</p>
          ) : availableParkings.length === 0 ? (
            <p>No parkings available</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {availableParkings.map((parking) => (
                <div key={parking.parking_id} style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    id={`parking-${parking.parking_id}`}
                    checked={formData.parkings.includes(parking.parking_id)}
                    onChange={(e) => handleParkingChange(parking.parking_id, e.target.checked)}
                    style={{ marginRight: "8px" }}
                  />
                  <label htmlFor={`parking-${parking.parking_id}`} style={{ margin: 0, cursor: "pointer" }}>
                    {parking.name}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {message && (
        <div
          style={{
            padding: "10px",
            marginBottom: "15px",
            backgroundColor: message.type === "success" ? "#d4edda" : "#f8d7da",
            color: message.type === "success" ? "#155724" : "#721c24",
            borderRadius: "4px",
          }}
        >
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: isSubmitting ? "not-allowed" : "pointer",
          opacity: isSubmitting ? 0.6 : 1,
          marginRight: "10px",
        }}
      >
        {isSubmitting ? "Updating..." : "Update Playground"}
      </button>
      <button
        type="button"
        onClick={onCancel}
        disabled={isSubmitting}
        style={{
          padding: "10px 20px",
          backgroundColor: "#6c757d",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: isSubmitting ? "not-allowed" : "pointer",
          opacity: isSubmitting ? 0.6 : 1,
        }}
      >
        Cancel
      </button>
    </form>
  );
}
