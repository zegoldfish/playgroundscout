"use client";

import { useState } from "react";
import { saveUserRating } from "@/app/actions/rating";
import {
  Box,
  Rating,
  TextField,
  Button,
  Alert,
  Stack,
  Typography,
  LinearProgress,
  Paper,
} from "@mui/material";

interface RatingFormProps {
  playgroundId: string;
  userId: string;
  initialRating?: number;
  initialNotes?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function RatingForm({
  playgroundId,
  userId,
  initialRating,
  initialNotes,
  onSuccess,
  onCancel,
}: RatingFormProps) {
  const [rating, setRating] = useState(initialRating || 0);
  const [notes, setNotes] = useState(initialNotes || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    if (rating === 0) {
      setError("Please select a rating");
      setSaving(false);
      return;
    }

    try {
      const result = await saveUserRating(playgroundId, userId, {
        rating,
        notes: notes.trim() || undefined,
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onSuccess?.();
        }, 1200);
      } else {
        setError(result.error || "Failed to save rating");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  const notesLength = notes.length;
  const maxNotes = 500;
  const notesPercentage = (notesLength / maxNotes) * 100;

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      elevation={1}
      sx={{
        p: 3,
        background: "linear-gradient(135deg, #f5f7ff 0%, #f0f7ff 100%)",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "primary.light",
      }}
    >
      <Stack spacing={3}>
        {/* Rating Section */}
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            How would you rate this playground?
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Rating
              value={rating}
              onChange={(_, newValue) => setRating(newValue || 0)}
              size="large"
              sx={{ fontSize: "2.5rem" }}
            />
            {rating > 0 && (
              <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main" }}>
                {rating}/5
              </Typography>
            )}
          </Box>
        </Box>

        {/* Notes Section */}
        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Share your experience
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: notesPercentage > 80 ? "warning.main" : "text.secondary",
              }}
            >
              {notesLength}/{maxNotes}
            </Typography>
          </Box>
          <TextField
            fullWidth
            multiline
            rows={5}
            value={notes}
            onChange={(e) => {
              if (e.target.value.length <= maxNotes) {
                setNotes(e.target.value);
              }
            }}
            placeholder="What did you think? Is it good for your kids? Any tips for other parents? ✨"
            inputProps={{ maxLength: maxNotes }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 1.5,
              },
            }}
          />
          <Box sx={{ mt: 1 }}>
            <LinearProgress
              variant="determinate"
              value={Math.min(notesPercentage, 100)}
              sx={{
                height: 6,
                borderRadius: 1,
                backgroundColor: "#e0e0e0",
                "& .MuiLinearProgress-bar": {
                  backgroundColor:
                    notesPercentage > 80 ? "warning.main" : "primary.main",
                },
              }}
            />
          </Box>
        </Box>

        {/* Messages */}
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" onClose={() => setSuccess(false)}>
            Rating and notes saved!
          </Alert>
        )}

        {/* Actions */}
        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            type="submit"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}
