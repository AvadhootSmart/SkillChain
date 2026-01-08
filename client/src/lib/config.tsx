// src/app/client-root.tsx
"use client";

import dynamic from "next/dynamic";
import { Toaster } from "sonner";

const Providers = dynamic(
  () => import("@/providers/provider").then((m) => m.Providers),
  { ssr: false },
);

export default function ClientRoot({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Providers>
        <main className="max-w-7xl mx-auto">{children}</main>
        <Toaster />
      </Providers>
    </>
  );
}
