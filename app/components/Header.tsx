"use client";

import { useState } from "react";
import { Box, Typography, AppBar, Toolbar, Button, IconButton } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { hasElevatedAccess } from "@/app/utils/userRole";
import AuthStatus from "./AuthStatus";
import MapsPreferenceModal from "./MapsPreferenceModal";

export default function Header() {
  const { data: session } = useSession();
  const hasElevated = hasElevatedAccess((session?.user as any)?.role);
  const [mapsModalOpen, setMapsModalOpen] = useState(false);

  return (
    <AppBar position="static" sx={{ backgroundColor: "primary.main" }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
        <Typography
          component={Link}
          href="/"
          variant="h1"
          sx={{
            fontSize: "1.5rem",
            fontFamily: "var(--font-barriecito), cursive",
            fontWeight: 400,
            textDecoration: "none",
            color: "inherit",
            cursor: "pointer",
            "&:hover": {
              opacity: 0.8,
            },
          }}
        >
          🛝 Playground Scout
        </Typography>
        {hasElevated && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              component={Link}
              href="/amenity"
              sx={{
                color: "white",
                fontSize: "0.9rem",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              Amenities
            </Button>
            <Button
              component={Link}
              href="/parking"
              sx={{
                color: "white",
                fontSize: "0.9rem",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              Parking
            </Button>
          </Box>
        )}
        <IconButton
          onClick={() => setMapsModalOpen(true)}
          sx={{
            color: "white",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
          }}
          title="Maps service settings"
        >
          <SettingsIcon />
        </IconButton>
        <AuthStatus />
      </Toolbar>
      <MapsPreferenceModal
        open={mapsModalOpen}
        onClose={() => setMapsModalOpen(false)}
      />
    </AppBar>
  );
}
