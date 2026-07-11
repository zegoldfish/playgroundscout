import type { Metadata } from "next";
import { Roboto, Barriecito } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/app/providers/AuthProvider";
import AuthStatus from "@/app/components/AuthStatus";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-roboto",
});

const barriecito = Barriecito({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-barriecito",
});

export const metadata: Metadata = {
  title: "Playground Scout",
  description: "Discover and Explore the Best Playgrounds Near You",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} ${barriecito.variable}`}>
        <AuthProvider>
          <header style={{ 
            padding: "1rem 2rem", 
            backgroundColor: "var(--color-blue-700)", 
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <h1 style={{ margin: 0, fontSize: "1.5rem", fontFamily: "var(--font-barriecito)" }}>
              🛝 Playground Scout
            </h1>
            <AuthStatus />
          </header>
          <main>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
