"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Divider,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import MenuIcon from "@mui/icons-material/Menu";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { hasElevatedAccess } from "@/app/utils/userRole";
import AuthStatus from "./AuthStatus";
import MapsPreferenceModal from "./MapsPreferenceModal";

export default function Header() {
  const { data: session } = useSession();
  const hasElevated = hasElevatedAccess((session?.user as any)?.role);
  const [mapsModalOpen, setMapsModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
        {/* Desktop Navigation */}
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
          {hasElevated && (
            <>
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
            </>
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
        </Box>
        {/* Mobile Hamburger Menu */}
        <IconButton
          onClick={() => setDrawerOpen(true)}
          sx={{ display: { xs: "flex", md: "none" }, color: "white" }}
        >
          <MenuIcon />
        </IconButton>
        {/* Desktop Auth Status */}
        <Box sx={{ display: { xs: "none", md: "flex" } }}>
          <AuthStatus />
        </Box>
      </Toolbar>
      <MapsPreferenceModal
        open={mapsModalOpen}
        onClose={() => setMapsModalOpen(false)}
      />
      {/* Mobile Menu Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250, p: 2 }}>
          <List>
            <ListItemButton
              onClick={() => {
                setMapsModalOpen(true);
                setDrawerOpen(false);
              }}
            >
              <SettingsIcon sx={{ mr: 2 }} />
              <ListItemText primary="Maps Settings" />
            </ListItemButton>
            {hasElevated && (
              <>
                <Divider sx={{ my: 1 }} />
                <ListItemButton
                  component={Link}
                  href="/amenity"
                  onClick={() => setDrawerOpen(false)}
                >
                  <ListItemText primary="Amenities" />
                </ListItemButton>
                <ListItemButton
                  component={Link}
                  href="/parking"
                  onClick={() => setDrawerOpen(false)}
                >
                  <ListItemText primary="Parking" />
                </ListItemButton>
              </>
            )}
            <Divider sx={{ my: 1 }} />
            <Box sx={{ mt: 2, "& *": { color: "#000 !important", borderColor: "#000 !important" } }}>
              <AuthStatus />
            </Box>
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}
