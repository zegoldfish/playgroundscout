"use client";

import { useState } from "react";
import { createAmenity } from "@/app/actions/amenity";
import { Amenity } from "@/app/schemas/amenity";
import { amenityNameToDisplay } from "@/app/utils/amenityDisplay";
import {
  Box,
  TextField,
  Button,
  Alert,
  Stack,
  Typography,
  Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

interface AmenityCreateInlineProps {
  onAmenityCreated: (amenity: Amenity) => void;
}

export default function AmenityCreateInline({
  onAmenityCreated,
}: AmenityCreateInlineProps) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

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
      setMessage({
        type: "success",
        text: `"${amenityNameToDisplay(newAmenity.name)}" added!`,
      });
      setName("");
      onAmenityCreated(newAmenity);

      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
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
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
      <Stack spacing={1.5}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>
          Add New Amenity
        </Typography>
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <TextField
            fullWidth
            size="small"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="New amenity name..."
            disabled={isSubmitting}
          />
          <Button
            variant="contained"
            size="small"
            onClick={handleCreate}
            disabled={isSubmitting}
            startIcon={<AddIcon />}
            sx={{ flexShrink: 0, mt: 0.5 }}
          >
            Add
          </Button>
        </Stack>

        {message && (
          <Alert
            severity={message.type === "success" ? "success" : "error"}
            onClose={() => setMessage(null)}
            sx={{ mt: 1 }}
          >
            {message.text}
          </Alert>
        )}
      </Stack>
    </Paper>
  );
}

