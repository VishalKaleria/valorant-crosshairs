import { Metadata } from "next";
import MyCrosshairsClient from "./MyCrosshairsClient";

export const metadata: Metadata = {
  title: "My Crosshairs - Saved & Voted | Valorant Crosshairs",
  description: "View your saved, upvoted, and copied Valorant crosshair codes. Manage your personal collection.",
  keywords: "my valorant crosshairs, saved crosshairs, favorited crosshairs, crosshair collection",
  openGraph: {
    title: "My Valorant Crosshairs Collection",
    description: "Manage your saved and voted Valorant crosshair codes in one place.",
    images: [
      {
        url: '/assets/og-images/my-crosshairs-page.png',
        width: 1200,
        height: 630,
        alt: 'My Valorant Crosshairs',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ['/assets/og-images/my-crosshairs-page.png'],
  },
  alternates: {
    canonical: 'https://valorantcrosshairs.online/my-crosshairs',
  },
};

export default function MyCrosshairsPage() {
  return <MyCrosshairsClient />;
}
