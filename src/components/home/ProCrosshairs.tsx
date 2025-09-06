"use client";

import { useEffect, useState } from "react";
import { Crosshair } from "@/types/database";
import CrosshairCard from "@/components/crosshair/CrosshairCard";

export default function ProCrosshairs() {
  const [crosshairs, setCrosshairs] = useState<Crosshair[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api?method=getProPlayersCrossHairs")
      .then((res) => res.json())
      .then((data: any) => {
        if (data.success && data.data) {
          setCrosshairs(data.data.slice(0, 12)); // Show top 12 pro crosshairs
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="space-y-4 sm:space-y-6 px-1 md:px-4">
        <h2 className="font-head text-2xl sm:text-3xl font-bold">Pro Player Crosshairs</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4 sm:space-y-6 px-1 md:px-4">
      <div>
        <h2 className="font-head text-2xl sm:text-3xl font-bold">Best Pro Valorant Crosshair Codes 2025</h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
          TenZ valorant crosshair, Demon1 crosshair code, Aspas crosshair settings from VCT 2025. Copy pro crosshairs for better aim.
        </p>
      </div>

      {/* Pro Tips - Mobile optimized */}
      <div className="bg-card border border-border rounded-lg p-3 sm:p-4">
        <div className="flex items-start gap-2">
          <span className="text-lg">💡</span>
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">Pro Tip: Why Cyan?</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Most pros use cyan (light blue) for maximum visibility across all maps without distraction.
            </p>
          </div>
        </div>
      </div>

      {/* Crosshair Grid - Responsive */}
      {crosshairs.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
          {crosshairs.map((crosshair) => (
            <CrosshairCard key={crosshair.id} crosshair={crosshair} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No pro crosshairs available
        </div>
      )}
    </section>
  );
}
