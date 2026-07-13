import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Yum Diary",
  description: "屬於你的美食日記",
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
