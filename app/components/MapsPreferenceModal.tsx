"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Box,
  Radio,
  FormControlLabel,
  FormControl,
} from "@mui/material";

interface MapsPreferenceModalProps {
  open: boolean;
  onClose: () => void;
  onNavigate?: (preference: "auto" | "apple" | "google") => void;
}

export default function MapsPreferenceModal({
  open,
  onClose,
  onNavigate,
}: MapsPreferenceModalProps) {
  const [preference, setPreference] = useState<"auto" | "apple" | "google">("auto");

  useEffect(() => {
    if (typeof window !== "undefined" && open) {
      const stored = localStorage.getItem("mapsPreference") as "auto" | "apple" | "google" | null;
      setPreference(stored || "auto");
    }
  }, [open]);

  const handleNavigate = () => {
    if (onNavigate) {
      localStorage.setItem("mapsPreference", preference);
      onNavigate(preference);
    } else {
      handleSave();
    }
  };

  const handleSave = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("mapsPreference", preference);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Choose Maps Service</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Which maps service would you like to use for directions?
          </Typography>

          <FormControl component="fieldset">
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Radio
                    checked={preference === "auto"}
                    onChange={() => setPreference("auto")}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      Auto-detect
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Apple Maps on iOS/macOS, Google Maps on others
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                control={
                  <Radio
                    checked={preference === "apple"}
                    onChange={() => setPreference("apple")}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      Apple Maps
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Always use Apple Maps
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                control={
                  <Radio
                    checked={preference === "google"}
                    onChange={() => setPreference("google")}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      Google Maps
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Always use Google Maps
                    </Typography>
                  </Box>
                }
              />
            </Stack>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleNavigate} variant="contained">
          {onNavigate ? "Open Directions" : "Save Preference"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
