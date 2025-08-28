// frontend/app/components/Header.tsx
"use client";

import { ConnectKitButton } from "connectkit";
import Link from "next/link";

export function Header() {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <Link href="/" className="text-2xl font-bold">
        Pump Clone
      </Link>
      <ConnectKitButton />
    </header>
  );
}