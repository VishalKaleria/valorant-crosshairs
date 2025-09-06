import { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import SearchBar from "@/components/home/SearchBar";
import ProCrosshairs from "@/components/home/ProCrosshairs";
import PopularCrosshairs from "@/components/home/PopularCrosshairs";
import SEOContent from "@/components/home/SEOContent";

export const metadata: Metadata = {
  title: "Valorant Crosshair Codes Database - 30,000+ Free Crosshairs",
  description: "Free Valorant crosshair codes database with pro settings from TenZ, Demon1, and more. Copy, edit, and import codes for better aim in 2025. Search by tags like fun or small dot.",
  keywords: "valorant crosshair codes, best valorant crosshair codes, valorant pro crosshairs, tenz valorant crosshair, demon1 crosshair code, aspas crosshair, zekken crosshair",
  openGraph: {
    title: "Valorant Crosshair Codes Database - 30,000+ Free Crosshairs",
    description: "The largest collection of Valorant crosshair codes. Copy pro player settings instantly.",
    images: [
      {
        url: '/assets/og-images/home-page.png',
        width: 1200,
        height: 630,
        alt: 'Valorant Crosshair Codes Database Home',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ['/assets/og-images/home-page.png'],
  },
  alternates: {
    canonical: 'https://valorantcrosshairs.online',
  },
};

export default function Home() {
  return (
    <div className="space-y-8">
      <HeroSection />
      <SearchBar />
      <ProCrosshairs />
      <PopularCrosshairs />
      <SEOContent />
    </div>
  );
}
