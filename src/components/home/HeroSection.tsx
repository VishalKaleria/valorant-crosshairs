import { siteConfig } from "@/config/site";

export default function HeroSection() {
  return (
    <section className="text-center space-y-6 py-8">
      <h1 className="font-head text-3xl sm:text-4xl md:text-5xl font-bold">
        Valorant Crosshair Codes Database 2025
      </h1>
      <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
        {siteConfig.stats.crosshairs.toLocaleString()} free Valorant crosshair codes from pro players like TenZ, Demon1, Aspas. 
        Best valorant crosshair codes for headshots, small dot, and fun designs.
      </p>
      <div className="flex flex-wrap gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary">
            {(siteConfig.stats.crosshairs / 1000).toFixed(0)}K+
          </span>
          <span className="text-muted-foreground">Codes</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary">
            {(siteConfig.stats.users / 1000).toFixed(0)}K+
          </span>
          <span className="text-muted-foreground">Users</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary">
            {siteConfig.stats.proCrosshairs}+
          </span>
          <span className="text-muted-foreground">Pro</span>
        </div>
      </div>
    </section>
  );
}
