import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Ma_Shan_Zheng, Zen_Maru_Gothic } from "next/font/google";
import { headers } from "next/headers";

import AppShell from "@/components/layout/AppShell";
import Providers from "@/src/components/providers/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const zenMaru = Zen_Maru_Gothic({
  variable: "--font-zen-maru",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const maShan = Ma_Shan_Zheng({
  variable: "--font-ma-shan",
  subsets: ["latin"],
  weight: "400",
});

/** Brand primary (caramel) — browser chrome / PWA theme. */
export const viewport: Viewport = {
  themeColor: "#B98F6B",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Yum Diary",
  description: "療癒系美食日記與共同點餐。",
  applicationName: "Yum Diary",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Yum Diary",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcut: ["/icons/favicon.ico"],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const initialPathname = headersList.get("x-pathname") ?? "";

  return (
    <html
      lang="zh-TW"
      className={`${geistSans.variable} ${geistMono.variable} ${zenMaru.variable} ${maShan.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>
          <AppShell initialPathname={initialPathname}>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
