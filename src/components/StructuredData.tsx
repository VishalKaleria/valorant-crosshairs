export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Valorant Crosshair Codes Database",
    "url": "https://valorantcrosshairs.online",
    "description": "Free database of 30,000+ Valorant crosshair codes from pro players and community. Build, copy, and share crosshairs.",
    "applicationCategory": "GameApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1250",
      "bestRating": "5",
      "worstRating": "1"
    },
    "creator": {
      "@type": "Organization",
      "name": "Valorant Crosshairs",
      "url": "https://valorantcrosshairs.online"
    },
    "keywords": [
      "valorant crosshair codes",
      "valorant pro crosshairs",
      "crosshair database",
      "tenz crosshair",
      "demon1 crosshair",
      "crosshair builder",
      "free crosshairs"
    ],
    "inLanguage": "en",
    "isAccessibleForFree": true,
    "featureList": [
      "30,000+ crosshair codes",
      "Pro player settings",
      "Crosshair builder",
      "Advanced search",
      "Vote system",
      "No ads",
      "Mobile responsive"
    ]
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How do I import a crosshair code in Valorant?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "To import a crosshair code in Valorant: 1) Go to Settings > Crosshair, 2) Click on the Import Profile Code button, 3) Paste the crosshair code, 4) Click Import. The crosshair will be applied immediately."
        }
      },
      {
        "@type": "Question",
        "name": "What are the best Valorant crosshair codes for 2025?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The best crosshair codes in 2025 come from pro players like TenZ, Demon1, Aspas, and Zekken. Popular choices include small dot crosshairs for precision and classic cross designs for visibility. Browse our database of 30,000+ codes to find your perfect match."
        }
      },
      {
        "@type": "Question",
        "name": "Can I submit my own crosshair code?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! You can submit your crosshair code through our Submit page. Simply paste your code, add a name and optional description, then submit. Your crosshair will be added to our database for others to discover."
        }
      },
      {
        "@type": "Question",
        "name": "Is this crosshair database free to use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, our Valorant crosshair database is 100% free. No registration required, no ads, and no hidden costs. Access all 30,000+ crosshair codes instantly."
        }
      },
      {
        "@type": "Question",
        "name": "How do I create a custom crosshair?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Use our Crosshair Builder to create custom crosshairs. Adjust color, outline, center dot, inner/outer lines, and more. The builder generates a code you can copy and import directly into Valorant."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
    </>
  );
}
