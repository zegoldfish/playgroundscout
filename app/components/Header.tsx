"use client";

import { Box, Typography, AppBar, Toolbar, Button } from "@mui/material";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { hasElevatedAccess } from "@/app/utils/userRole";
import AuthStatus from "./AuthStatus";

export default function Header() {
  const { data: session } = useSession();
  const hasElevated = hasElevatedAccess((session?.user as any)?.role);

  return (
    <AppBar position="static" sx={{ backgroundColor: "primary.main" }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
        <Typography
          variant="h1"
          sx={{
            fontSize: "1.5rem",
            fontFamily: "var(--font-barriecito), cursive",
            fontWeight: 400,
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
        <AuthStatus />
      </Toolbar>
    </AppBar>
  );
}
