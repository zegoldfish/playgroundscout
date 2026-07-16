import type { Metadata } from "next";
import { Roboto, Barriecito } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/app/providers/AuthProvider";
import Header from "@/app/components/Header";

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
          <Header />
          <main>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
