import { Metadata } from "next";
import SubmitClient from "./SubmitClient";

export const metadata: Metadata = {
  title: "Submit Your Crosshair - Valorant Crosshairs Codes Database",
  description: "Share your Valorant crosshair code with the community. Submit custom or pro-inspired crosshairs to our free database.",
  keywords: "submit valorant crosshair, share crosshair code, add crosshair database, upload crosshair valorant",
  openGraph: {
    title: "Submit Your Valorant Crosshair Code",
    description: "Share your crosshair with 100,000+ Valorant players. Submit to our free database.",
    images: [
      {
        url: '/assets/og-images/submit-page.png',
        width: 1200,
        height: 630,
        alt: 'Submit Valorant Crosshair',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ['/assets/og-images/submit-page.png'],
  },
  alternates: {
    canonical: 'https://valorantcrosshairs.online/submit',
  },
};

export default function SubmitPage() {
  return <SubmitClient />;
}
