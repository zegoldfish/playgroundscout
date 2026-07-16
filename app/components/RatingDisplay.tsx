"use client";

import { Rating, Box, Typography, Stack } from "@mui/material";

interface RatingDisplayProps {
  rating?: number;
  count?: number;
  userRating?: number;
  size?: "small" | "large";
}

export default function RatingDisplay({
  rating,
  count = 0,
  userRating,
  size = "large",
}: RatingDisplayProps) {
  const ratingSize = size === "small" ? 20 : 28;
  const textVariant = size === "small" ? "body2" : "body1";

  return (
    <Stack spacing={1}>
      {/* Average rating */}
      {rating ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Rating value={rating} readOnly size={size === "small" ? "small" : "medium"} />
          <Typography variant={textVariant} sx={{ fontWeight: 600 }}>
            {rating}/5
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", opacity: 0.7 }}
          >
            ({count} {count === 1 ? "rating" : "ratings"})
          </Typography>
        </Box>
      ) : (
        <Typography variant={textVariant} sx={{ color: "text.secondary" }}>
          No ratings yet
        </Typography>
      )}

      {/* User's personal rating */}
      {userRating && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            borderTop: "1px solid",
            borderColor: "divider",
            pt: 1,
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
            Your rating:
          </Typography>
          <Rating value={userRating} readOnly size="small" />
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            {userRating}/5
          </Typography>
        </Box>
      )}
    </Stack>
  );
}
