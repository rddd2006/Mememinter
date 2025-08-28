// frontend/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "./components/Header"; // 1. Import the Header

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pump Clone",
  description: "Create and trade memecoins",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Header /> {/* 2. Add the Header here */}
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}