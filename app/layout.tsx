/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";
import { RouterProvider } from "./components/RouterProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "IsabiLove — A Quiet Haven to Remember & Cherish Loved Ones",
  description:
    "A quiet relationship haven to remember, honor, and cherish those entrusted to your heart with words of grace and timely devotion.",
  openGraph: {
    title: "IsabiLove — A Quiet Haven to Remember & Cherish Loved Ones",
    description:
      "A quiet relationship haven to remember, honor, and cherish those entrusted to your heart with words of grace and timely devotion.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport = {
  themeColor: "#8c6239",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..800;1,9..144,300..800&family=Source+Sans+3:ital,wght@0,300..800;1,300..800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/images/avatar_partner_1792816163693.jpg"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/images/avatar_partner_1792816163693.jpg"
        />
        <meta name="theme-color" content="#8c6239" />
      </head>
      <body className="bg-[#f3ece1] text-[#2a241c] antialiased selection:bg-[#8c6239]/20 selection:text-[#2a241c] min-h-screen">
        <AuthProvider>
          <AppProvider>
            <RouterProvider>{children}</RouterProvider>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}