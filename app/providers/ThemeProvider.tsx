"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ReactNode } from "react";

const theme = createTheme({
  palette: {
    primary: {
      main: "#0597F2", // Sky blue
    },
    secondary: {
      main: "#FF6B35", // Warm orange (playful)
    },
    success: {
      main: "#078C03", // Green
    },
    background: {
      default: "#f0f7ff", // Light blue-tinted background
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: "var(--font-roboto), system-ui, -apple-system, sans-serif",
    h1: {
      fontFamily: "var(--font-barriecito), cursive",
      fontWeight: 400,
    },
    h2: {
      fontFamily: "var(--font-barriecito), cursive",
      fontWeight: 400,
    },
    h3: {
      fontFamily: "var(--font-barriecito), cursive",
      fontWeight: 400,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

export function ThemeRegistry({ children }: { children: ReactNode }) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
