import type { Metadata } from "next";
import "./globals.css";
import { Archivo_Black, Space_Grotesk } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/retroui/Sonner";
import { siteConfig } from "@/config/site";
import { VotesProvider } from "@/contexts/VotesContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import StructuredData from "@/components/StructuredData";
 
const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-head",
  display: "swap",
});
 
const space = Space_Grotesk({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Valorant Crosshair Codes 2025 - Best Pro & Fun Database",
  description: "Free Valorant crosshair codes database with pro settings from TenZ, Demon1, and more. Copy, edit, and import codes for better aim in 2025. Search by tags like fun or small dot.",
  keywords: "valorant crosshair codes, best valorant crosshair codes, valorant pro crosshairs, tenz valorant crosshair, demon1 crosshair code, aspas crosshair, zekken crosshair, fun valorant crosshairs, dot crosshair valorant, small crosshair valorant, vct crosshair codes 2025",
  authors: [{ name: siteConfig.creator.name }],
  metadataBase: new URL('https://valorantcrosshairs.online'),
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'icon', url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { rel: 'icon', url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  openGraph: {
    title: "Valorant Crosshair Codes 2025 - Best Pro & Fun Database",
    description: "Free Valorant crosshair codes database with 30,000+ pro settings. Copy TenZ, Demon1, Aspas crosshair codes instantly.",
    type: "website",
    locale: "en_US",
    url: 'https://valorantcrosshairs.online',
    siteName: "Valorant Crosshair Codes Database",
    images: [
      {
        url: '/assets/og-images/home-page.png',
        width: 1200,
        height: 630,
        alt: 'Valorant Crosshair Codes Database - 30,000+ Free Crosshairs',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Valorant Crosshair Codes Database 2025",
    description: "30,000+ free Valorant crosshair codes from pro players. Copy codes instantly for ranked matches.",
    images: ['/assets/og-images/home-page.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: 'https://valorantcrosshairs.online',
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <StructuredData />
      </head>
      <body
        className={`${archivoBlack.variable} ${space.variable} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider>
          <VotesProvider>
            <ErrorBoundary>
              <Header />
              <main className="flex-1">
                <div className="container mx-auto px-1 sm:px-6 lg:px-8 py-6 sm:py-8">
                  {children}
                </div>
              </main>
              <Footer />
              <Toaster position="bottom-right" />
            </ErrorBoundary>
          </VotesProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
