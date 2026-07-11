"use client";

import { useState } from "react";
import { createAmenity } from "@/app/actions/amenity";
import { Amenity } from "@/app/schemas/amenity";
import { amenityNameToDisplay } from "@/app/utils/amenityDisplay";

interface AmenityCreateInlineProps {
  onAmenityCreated: (amenity: Amenity) => void;
}

export default function AmenityCreateInline({ onAmenityCreated }: AmenityCreateInlineProps) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleCreate = async () => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      if (!name.trim()) {
        setMessage({ type: "error", text: "Amenity name is required" });
        setIsSubmitting(false);
        return;
      }

      const newAmenity = await createAmenity({ name });
      setMessage({ type: "success", text: `"${amenityNameToDisplay(newAmenity.name)}" added!` });
      setName("");
      onAmenityCreated(newAmenity);

      // Auto-clear success message after 2 seconds
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Error creating amenity:", error);
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCreate();
    }
  };

  return (
    <div style={{ 
      padding: "12px", 
      marginTop: "12px", 
      backgroundColor: "#f9f9f9", 
      borderRadius: "4px",
      border: "1px solid #e0e0e0"
    }}>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: "200px" }}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="New amenity name..."
            disabled={isSubmitting}
            style={{
              width: "100%",
              padding: "6px 8px",
              boxSizing: "border-box",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "14px",
              opacity: isSubmitting ? 0.6 : 1,
            }}
          />
        </div>
        <button
          type="button"
          onClick={handleCreate}
          disabled={isSubmitting}
          style={{
            padding: "6px 16px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: "500",
            opacity: isSubmitting ? 0.6 : 1,
            whiteSpace: "nowrap",
          }}
        >
          {isSubmitting ? "Creating..." : "+ Add"}
        </button>
      </div>

      {message && (
        <div
          style={{
            marginTop: "8px",
            padding: "8px 10px",
            borderRadius: "4px",
            fontSize: "13px",
            backgroundColor: message.type === "success" ? "#d4edda" : "#f8d7da",
            color: message.type === "success" ? "#155724" : "#721c24",
            border: `1px solid ${message.type === "success" ? "#c3e6cb" : "#f5c6cb"}`,
          }}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}

