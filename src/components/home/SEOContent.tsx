"use client";

import { siteConfig } from "@/config/site";

export default function SEOContent() {
  return (
    <section className="mt-16 px-4 pb-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Main keyword section */}
        <div className="text-center space-y-3">
          <h2 className="font-head text-2xl sm:text-3xl font-bold text-foreground">
            Valorant Crosshair Codes Database 2025
          </h2>
          <p className="text-base sm:text-lg text-foreground max-w-4xl mx-auto">
            Largest collection of <strong>valorant crosshair codes</strong> with {siteConfig.stats.crosshairs.toLocaleString()} free codes. 
            Find <strong>best valorant crosshair codes</strong> from pro players and community. 
            Copy <strong>TenZ valorant crosshair</strong>, <strong>Demon1 crosshair code</strong>, 
            <strong>Aspas crosshair</strong> instantly for ranked matches.
          </p>
        </div>

        {/* Popular searches grid */}
        <div className="space-y-4">
          <h3 className="font-head text-xl font-bold text-center text-foreground">
            Popular Valorant Crosshair Searches
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 text-center">
            {[
              "valorant crosshair codes",
              "best valorant crosshair codes", 
              "valorant pro crosshairs",
              "tenz valorant crosshair",
              "demon1 crosshair code",
              "aspas crosshair",
              "zekken crosshair",
              "fun valorant crosshairs",
              "dot crosshair valorant",
              "small crosshair valorant",
              "vct crosshair codes 2025",
              "valorant crosshair database"
            ].map((keyword) => (
              <div key={keyword} className="p-3 bg-card border border-border rounded-lg">
                <span className="text-sm font-medium text-foreground">{keyword}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pro players section */}
        <div className="space-y-4">
          <h3 className="font-head text-xl font-bold text-center text-foreground">
            Pro Player Crosshair Codes Available
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              "TenZ", "Demon1", "Aspas", "Zekken", "yay", "ScreaM", 
              "Chronicle", "Leo", "Derke", "Something", "f0rsakeN", 
              "Less", "Alfajer", "nAts", "Sacy", "pANcada", "zellsis",
              "Boaster", "Shao", "Suygetsu", "ardiis", "crashies"
            ].map((player) => (
              <span key={player} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                {player} crosshair
              </span>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-border">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{siteConfig.stats.crosshairs.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Crosshair Codes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{siteConfig.stats.proCrosshairs}+</div>
            <div className="text-sm text-muted-foreground">Pro Players</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">Daily</div>
            <div className="text-sm text-muted-foreground">Updates</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">100%</div>
            <div className="text-sm text-muted-foreground">Free</div>
          </div>
        </div>
      </div>
    </section>
  );
}
