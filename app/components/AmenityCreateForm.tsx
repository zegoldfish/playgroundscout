"use client";

import { useState } from "react";
import { createAmenity } from "@/app/actions/amenity";
import { amenityNameToDisplay } from "@/app/utils/amenityDisplay";
import { Box, TextField, Button, Alert, Stack, Typography, Paper } from "@mui/material";

interface AmenityCreateFormProps {
  onSuccess?: () => void;
}

interface FormData {
  name: string;
}

export default function AmenityCreateForm({ onSuccess }: AmenityCreateFormProps) {
  const [formData, setFormData] = useState<FormData>({ name: "" });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

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
        setMessage({ type: "error", text: "Amenity name is required" });
        setIsSubmitting(false);
        return;
      }

      const newAmenity = await createAmenity({ name: formData.name });
      setMessage({
        type: "success",
        text: `"${amenityNameToDisplay(newAmenity.name)}" created successfully!`,
      });
      setFormData({ name: "" });
      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("Error creating amenity:", error);
      setMessage({
        type: "error",
        text: `Failed to create amenity: ${errorMessage}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Create New Amenity
        </Typography>

        <TextField
          fullWidth
          label="Amenity Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Basketball Hoop, Slide, Swings"
          required
        />

        {message && (
          <Alert
            severity={message.type === "success" ? "success" : "error"}
            onClose={() => setMessage(null)}
          >
            {message.text}
          </Alert>
        )}

        <Button
          fullWidth
          variant="contained"
          type="submit"
          disabled={isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? "Creating..." : "Create Amenity"}
        </Button>
      </Stack>
    </Paper>
  );
}
