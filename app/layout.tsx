import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
});

import ConvexClientProvider from "./ConvexClientProvider";
import AuthProvider from "./AuthProvider";

const baseObj = {
  title: "Food Mohalla",
  description: "Delicious Food Delivered to Your Doorstep",
};

export const metadata: Metadata = baseObj;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning className={`${plusJakarta.variable} font-display antialiased`}>
        <AuthProvider>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
