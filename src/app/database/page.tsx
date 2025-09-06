import { Metadata } from "next";
import { Suspense } from "react";
import DatabaseClient from "./DatabaseClient";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Browse ${siteConfig.stats.crosshairs.toLocaleString()} Crosshairs - ${siteConfig.title}`,
  description: `Search our full Valorant crosshair database with ${siteConfig.stats.crosshairs.toLocaleString()} codes. Filter by pro, fun, dot, or rank. Submit your own crosshair codes for free.`,
  keywords: "valorant crosshair database, search crosshairs, filter crosshairs, submit crosshair code, pro player crosshairs, fun crosshairs valorant",
  openGraph: {
    title: `Browse ${siteConfig.stats.crosshairs.toLocaleString()} Valorant Crosshairs`,
    description: "Search and filter through thousands of Valorant crosshair codes. Find your perfect crosshair.",
    images: [
      {
        url: '/assets/og-images/database-page.png',
        width: 1200,
        height: 630,
        alt: 'Valorant Crosshair Database',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ['/assets/og-images/database-page.png'],
  },
  alternates: {
    canonical: 'https://valorantcrosshairs.online/database',
  },
};

export default function DatabasePage() {
  return (
    <Suspense 
      fallback={
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-head text-3xl sm:text-4xl md:text-5xl font-bold">
              Crosshair Database
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Loading crosshairs...
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
            {[...Array(24)].map((_, i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      }
    >
      <DatabaseClient />
    </Suspense>
  );
}
