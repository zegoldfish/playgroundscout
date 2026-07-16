"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Box, Button, Typography, CircularProgress } from "@mui/material";

export default function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <CircularProgress size={24} />;
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      {session?.user ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2" sx={{ color: "white", fontWeight: 500 }}>
            {session.user.name || session.user.email}
          </Typography>
          <Button
            onClick={() => signOut({ redirect: true })}
            variant="outlined"
            size="small"
            sx={{
              color: "white",
              borderColor: "white",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderColor: "white",
              },
            }}
          >
            Sign Out
          </Button>
        </Box>
      ) : (
        <Button
          component={Link}
          href="/auth/signin"
          variant="contained"
          size="small"
          sx={{
            backgroundColor: "white",
            color: "primary.main",
            fontWeight: 600,
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.9)",
            },
          }}
        >
          Sign In
        </Button>
      )}
    </Box>
  );
}
