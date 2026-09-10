import { Navbar } from "@/components/navbar";
import "./globals.css";
import ClientRoot from "@/lib/config";
import { ThemeProvider } from "next-themes";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body suppressHydrationWarning={true}>
                <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
                    <ClientRoot>
                        <Navbar />
                        {children}
                    </ClientRoot>
                </ThemeProvider>
            </body>
        </html>
    );
}
