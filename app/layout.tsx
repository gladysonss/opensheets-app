import { PrivacyProvider } from "@/components/privacy-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { main_font } from "@/public/fonts/font_index";
import type { Metadata } from "next";
import "./globals.css";

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
      <head>
        <script
          defer
          src="https://umami.felipecoutinho.com/script.js"
          data-website-id="42f8519e-de88-467e-8969-d13a76211e43"
        ></script>
      </head>
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
      </body>
    </html>
  );
}
