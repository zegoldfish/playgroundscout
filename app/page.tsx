import { Box, Container, Typography } from "@mui/material";
import PlaygroundScoutBanner from "@/app/components/PlaygroundScoutBanner";
import NearbyPlaygrounds from "@/app/components/NearbyPlaygrounds";

export default function HomePage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0f7ff 0%, #e5f4ff 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="md">
        {/* Hero Section */}
        <Box
          sx={{
            background: "white",
            borderRadius: 3,
            p: 5,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            mb: 6,
            textAlign: "center",
          }}
        >
          <PlaygroundScoutBanner />
          <Typography
            variant="h5"
            sx={{
              mt: 2,
              mb: 0,
              color: "text.secondary",
              fontWeight: 500,
            }}
          >
            Discover and Explore the Best Playgrounds Near You
          </Typography>
        </Box>

        {/* Playgrounds Section */}
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h3"
            sx={{
              textAlign: "center",
              mb: 4,
              fontFamily: "var(--font-barriecito), cursive",
              color: "primary.main",
            }}
          >
            Nearby Playgrounds
          </Typography>
          <NearbyPlaygrounds />
        </Box>
      </Container>
    </Box>
  );
}
