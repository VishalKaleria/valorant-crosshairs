"use client";

import { useEffect, useState } from "react";
import { Crosshair } from "@/types/database";
import CrosshairCard from "@/components/crosshair/CrosshairCard";
import { Button } from "@/components/retroui/Button";
import { siteConfig } from "@/config/site";
import { ArrowRight, Database } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PopularCrosshairs() {
  const router = useRouter();
  const [crosshairs, setCrosshairs] = useState<Crosshair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Show fewer items on mobile for better performance
  const ITEMS_TO_SHOW = isMobile ? 24 : 60;

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchCrosshairs = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api?method=getPopularCrossHairs&limit=${ITEMS_TO_SHOW}&offset=0`
        );
        const data: any = await response.json();
        
        if (data.success && data.data) {
          setCrosshairs(data.data);
        } else {
          setError("Failed to load crosshairs");
        }
      } catch (error) {
        console.error("Failed to fetch crosshairs:", error);
        setError("Failed to load crosshairs");
      } finally {
        setLoading(false);
      }
    };

    fetchCrosshairs();
  }, [ITEMS_TO_SHOW]);

  return (
    <section className="space-y-4 sm:space-y-6 px-1 md:px-4">
      <div>
        <h2 className="font-head text-2xl sm:text-3xl font-bold">
          Best Valorant Crosshair Codes - Popular & Fun
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
          Fun valorant crosshairs, dot crosshair valorant, small crosshair valorant codes. Community voted best crosshairs for headshots.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
          {[...Array(isMobile ? 6 : 12)].map((_, i) => (
            <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8 sm:py-12">
          <p className="text-muted-foreground text-sm sm:text-base">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            className="mt-4"
            size="sm"
          >
            Try Again
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
            {crosshairs.map((crosshair) => (
              <CrosshairCard key={crosshair.id} crosshair={crosshair} />
            ))}
          </div>
          
          {/* Browse All Button */}
          <div className="flex justify-center pt-8">
            <Button 
              size="lg"
              onClick={() => router.push('/database')}
              className="group"
            >
              <Database className="w-5 h-5 mr-2" />
              Browse All {siteConfig.stats.crosshairs.toLocaleString()} Crosshairs
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
