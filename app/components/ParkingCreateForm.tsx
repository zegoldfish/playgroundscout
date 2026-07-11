"use client";

import { useState } from "react";
import { createParking } from "@/app/actions/parking";

interface ParkingCreateFormProps {
  onSuccess?: () => void;
}

interface FormData {
  name: string;
}

export default function ParkingCreateForm({ onSuccess }: ParkingCreateFormProps) {
  const [formData, setFormData] = useState<FormData>({ name: "" });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name as keyof FormData]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      if (!formData.name.trim()) {
        setMessage({ type: "error", text: "Parking name is required" });
        setIsSubmitting(false);
        return;
      }

      await createParking({ name: formData.name });
      setMessage({ type: "success", text: "Parking created successfully!" });
      setFormData({ name: "" });
      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Error creating parking:", error);
      setMessage({ type: "error", text: `Failed to create parking: ${errorMessage}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "500px", margin: "20px 0" }}>
      <h2>Create New Parking</h2>

      <div style={{ marginBottom: "15px" }}>
        <label htmlFor="name">Parking Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Street Parking, Parking Lot, Garage"
          required
          style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
        />
      </div>

      {message && (
        <div
          style={{
            padding: "10px",
            marginBottom: "15px",
            borderRadius: "4px",
            backgroundColor: message.type === "success" ? "#d4edda" : "#f8d7da",
            color: message.type === "success" ? "#155724" : "#721c24",
            border: `1px solid ${message.type === "success" ? "#c3e6cb" : "#f5c6cb"}`,
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
        }}
      >
        {isSubmitting ? "Creating..." : "Create Parking"}
      </button>
    </form>
  );
}
