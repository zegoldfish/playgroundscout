"use client";

import { useGeolocation } from "@/app/hooks/useGeolocation";
import { useNearbyPlaygrounds } from "@/app/hooks/useNearbyPlaygrounds";
import Playground from "./NearbyPlayground";
import {
  Box,
  CircularProgress,
  Alert,
  List,
  Pagination,
  Stack,
  Typography,
} from "@mui/material";

export default function NearbyPlaygrounds() {
  const geo = useGeolocation();
  const {
    playgrounds,
    loading,
    error,
    currentPage,
    totalPages,
    setCurrentPage,
    allPlaygroundsCount,
  } = useNearbyPlaygrounds(geo);

  // Location status
  if (geo.status === "loading" || geo.status === "idle") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (geo.status === "error") {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
          Location Required
        </Typography>
        <Typography variant="body2">{geo.error}</Typography>
      </Alert>
    );
  }

  // Playground results
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
          Error Loading Playgrounds
        </Typography>
        <Typography variant="body2">{error}</Typography>
      </Alert>
    );
  }

  if (playgrounds.length === 0) {
    return (
      <Alert severity="info">No playgrounds found nearby.</Alert>
    );
  }

  return (
    <Box>
      <List sx={{ display: "flex", flexDirection: "column", gap: 2, p: 0 }}>
        {playgrounds.map((playground) => (
          <Playground key={playground.id} playground={playground} />
        ))}
      </List>

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Stack spacing={2} alignItems="center">
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(_, page) => setCurrentPage(page)}
              color="primary"
              size="large"
            />
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Page {currentPage} of {totalPages} ({allPlaygroundsCount} total)
            </Typography>
          </Stack>
        </Box>
      )}
    </Box>
  );
}