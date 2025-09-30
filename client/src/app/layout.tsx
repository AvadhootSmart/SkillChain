import { Providers } from "@/providers/provider";
import "./globals.css";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <main className="max-w-7xl mx-auto">{children}</main>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
