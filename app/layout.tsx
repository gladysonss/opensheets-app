import { PrivacyProvider } from "@/components/privacy-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { main_font } from "@/public/fonts/font_index";
import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "OpenSheets",
  description: "Finanças pessoais descomplicadas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${main_font.className} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="light">
          <PrivacyProvider>
            {children}
            <Toaster position="top-right" />
          </PrivacyProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
