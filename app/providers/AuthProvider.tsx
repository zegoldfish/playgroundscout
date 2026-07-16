"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { ThemeRegistry } from "./ThemeProvider";

export default function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeRegistry>
      <SessionProvider>{children}</SessionProvider>
    </ThemeRegistry>
  );
}
