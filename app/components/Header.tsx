"use client";

import { Box, Typography, AppBar, Toolbar } from "@mui/material";
import AuthStatus from "./AuthStatus";

export default function Header() {
  return (
    <AppBar position="static" sx={{ backgroundColor: "primary.main" }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
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
        <AuthStatus />
      </Toolbar>
    </AppBar>
  );
}
