import { Navbar } from "@/components/navbar";
import "./globals.css";
import ClientRoot from "@/lib/config";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientRoot>
          <Navbar />
          {children}
        </ClientRoot>
      </body>
    </html>
  );
}
