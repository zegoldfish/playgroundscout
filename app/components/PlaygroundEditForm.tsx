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
import {
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  Alert,
  Stack,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";

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
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      name: e.target.value,
    }));
  };

  const handleAmenityToggle = (amenityId: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter((id) => id !== amenityId)
        : [...prev.amenities, amenityId],
    }));
  };

  const handleParkingToggle = (parkingId: string) => {
    setFormData((prev) => ({
      ...prev,
      parkings: prev.parkings.includes(parkingId)
        ? prev.parkings.filter((id) => id !== parkingId)
        : [...prev.parkings, parkingId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSaving(true);

    try {
      await updatePlayground(playground.park_id, {
        name: formData.name,
        amenities: formData.amenities,
        parkings: formData.parkings,
      });
      setSuccess(true);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred while updating the playground"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: 3,
        borderRadius: 2,
        backgroundColor: "background.paper",
      }}
    >
      <Stack spacing={3}>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">Playground updated successfully!</Alert>}

        {/* Name Field */}
        <TextField
          label="Playground Name"
          value={formData.name}
          onChange={handleNameChange}
          fullWidth
          disabled={isSaving}
        />

        {/* Lat/Lon Display (Read-only) */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <Box>
            <TextField
              label="Latitude"
              value={playground.latitude}
              fullWidth
              disabled
              variant="outlined"
            />
          </Box>
          <Box>
            <TextField
              label="Longitude"
              value={playground.longitude}
              fullWidth
              disabled
              variant="outlined"
            />
          </Box>
        </Box>

        {/* Amenities Section */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
            Amenities
          </Typography>
          {!amenitiesLoaded ? (
            <CircularProgress size={20} />
          ) : availableAmenities.length === 0 ? (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              No amenities available
            </Typography>
          ) : (
            <Stack spacing={1}>
              {availableAmenities.map((amenity) => (
                <FormControlLabel
                  key={amenity.amenity_id}
                  control={
                    <Checkbox
                      checked={formData.amenities.includes(amenity.amenity_id)}
                      onChange={() => handleAmenityToggle(amenity.amenity_id)}
                      disabled={isSaving}
                    />
                  }
                  label={amenityNameToDisplay(amenity.name)}
                />
              ))}
            </Stack>
          )}
          <Box sx={{ mt: 2 }}>
            <AmenityCreateInline
              onAmenityCreated={() => {
                listAmenities().then(setAvailableAmenities);
              }}
            />
          </Box>
        </Box>

        {/* Parkings Section */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
            Parking
          </Typography>
          {!parkingsLoaded ? (
            <CircularProgress size={20} />
          ) : availableParkings.length === 0 ? (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              No parkings available
            </Typography>
          ) : (
            <Stack spacing={1}>
              {availableParkings.map((parking) => (
                <FormControlLabel
                  key={parking.parking_id}
                  control={
                    <Checkbox
                      checked={formData.parkings.includes(parking.parking_id)}
                      onChange={() => handleParkingToggle(parking.parking_id)}
                      disabled={isSaving}
                    />
                  }
                  label={parking.name}
                />
              ))}
            </Stack>
          )}
        </Box>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          {onCancel && (
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
