import { Metadata } from "next";
import { Suspense } from 'react';
import BuilderClient from './BuilderClient';

export const metadata: Metadata = {
  title: "Crosshair Builder - Create & Edit Valorant Crosshairs",
  description: "Build and customize your perfect Valorant crosshair with our free online builder. Edit existing codes or create from scratch.",
  keywords: "valorant crosshair builder, crosshair generator, custom crosshair creator, edit crosshair code",
  openGraph: {
    title: "Valorant Crosshair Builder - Create Your Perfect Crosshair",
    description: "Free online Valorant crosshair builder. Customize every aspect and generate your code instantly.",
    images: [
      {
        url: '/assets/og-images/builder-page.png',
        width: 1200,
        height: 630,
        alt: 'Valorant Crosshair Builder',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ['/assets/og-images/builder-page.png'],
  },
  alternates: {
    canonical: 'https://valorantcrosshairs.online/builder',
  },
};

export default function BuilderPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BuilderClient />
    </Suspense>
  );
}
