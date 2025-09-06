"use client";

import { useState, useEffect } from "react";
import { useVotes } from "@/contexts/VotesContext";
import { Crosshair } from "@/types/database";
import CrosshairCard from "@/components/crosshair/CrosshairCard";
import { Card } from "@/components/retroui/Card";
import { Button } from "@/components/retroui/Button";
import { Tabs, TabsContent, TabsTriggerList, TabsTrigger, TabsPanels } from "@/components/retroui/Tab";
import { ThumbsUp, ThumbsDown, Copy, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function MyCrosshairsClient() {
  const { getUserStats, voteData } = useVotes();
  const [crosshairs, setCrosshairs] = useState<{
    upvoted: Crosshair[];
    downvoted: Crosshair[];
    copied: Crosshair[];
  }>({
    upvoted: [],
    downvoted: [],
    copied: [],
  });
  const [loading, setLoading] = useState(true);

  const stats = getUserStats();

  useEffect(() => {
    const loadCrosshairs = async () => {
      setLoading(true);
      
      // Fetch all crosshairs that user has interacted with
      const allIds = [
        ...voteData.upvoted,
        ...voteData.downvoted,
        ...voteData.copied,
      ];
      
      const uniqueIds = [...new Set(allIds)];
      
      if (uniqueIds.length === 0) {
        setLoading(false);
        return;
      }

      try {
        // Fetch crosshairs by IDs
        const promises = uniqueIds.map((id) =>
          fetch(`/api?method=getCrossHairById&id=${id}`)
            .then((res) => res.json())
            .then((data: any) => data.success && data.data?.[0] ? data.data[0] : null)
        );

        const results = await Promise.all(promises);
        const validCrosshairs = results.filter(Boolean) as Crosshair[];

        setCrosshairs({
          upvoted: validCrosshairs.filter((c) => voteData.upvoted.includes(c.id)),
          downvoted: validCrosshairs.filter((c) => voteData.downvoted.includes(c.id)),
          copied: validCrosshairs.filter((c) => voteData.copied.includes(c.id)),
        });
      } catch (error) {
        console.error("Failed to load crosshairs:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCrosshairs();
  }, [voteData]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-head text-3xl font-bold mb-8">My Crosshairs</h1>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-1.5 sm:gap-2">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="font-head text-3xl font-bold mb-2">My Crosshairs</h1>
        <p className="text-muted-foreground">
          Your personal collection of saved and voted crosshairs
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <Card.Content className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Upvoted</p>
                <p className="text-2xl font-bold text-primary">{stats.totalUpvoted}</p>
              </div>
              <ThumbsUp className="h-5 w-5 text-primary" />
            </div>
          </Card.Content>
        </Card>
        <Card>
          <Card.Content className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Downvoted</p>
                <p className="text-2xl font-bold text-destructive">{stats.totalDownvoted}</p>
              </div>
              <ThumbsDown className="h-5 w-5 text-destructive" />
            </div>
          </Card.Content>
        </Card>
        <Card>
          <Card.Content className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Copied</p>
                <p className="text-2xl font-bold text-accent-foreground">{stats.totalCopied}</p>
              </div>
              <Copy className="h-5 w-5 text-accent-foreground" />
            </div>
          </Card.Content>
        </Card>
        <Card>
          <Card.Content className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">
                  {stats.totalUpvoted + stats.totalDownvoted + stats.totalCopied}
                </p>
              </div>
              <BarChart3 className="h-5 w-5" />
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Tabs for different categories */}
      <Tabs defaultValue={0} className="w-full">
        <TabsTriggerList className="grid w-full grid-cols-3">
          <TabsTrigger>
            Upvoted ({stats.totalUpvoted})
          </TabsTrigger>
          <TabsTrigger>
            Downvoted ({stats.totalDownvoted})
          </TabsTrigger>
          <TabsTrigger>
            Copied ({stats.totalCopied})
          </TabsTrigger>
        </TabsTriggerList>

        <TabsPanels className="mt-6">
          <TabsContent>
            {crosshairs.upvoted.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
                {crosshairs.upvoted.map((crosshair) => (
                  <CrosshairCard key={crosshair.id} crosshair={crosshair} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No upvoted crosshairs yet"
                description="Start exploring and upvote crosshairs you like!"
                action="Browse Crosshairs"
                href="/database"
              />
            )}
          </TabsContent>

          <TabsContent>
            {crosshairs.downvoted.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
                {crosshairs.downvoted.map((crosshair) => (
                  <CrosshairCard key={crosshair.id} crosshair={crosshair} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No downvoted crosshairs"
                description="You haven't downvoted any crosshairs yet."
                action="Browse Crosshairs"
                href="/database"
              />
            )}
          </TabsContent>

          <TabsContent>
            {crosshairs.copied.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
                {crosshairs.copied.map((crosshair) => (
                  <CrosshairCard key={crosshair.id} crosshair={crosshair} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No copied crosshairs"
                description="Crosshairs you copy will appear here for easy access."
                action="Find Crosshairs"
                href="/"
              />
            )}
          </TabsContent>
        </TabsPanels>
      </Tabs>
    </div>
  );
}

function EmptyState({
  title,
  description,
  action,
  href,
}: {
  title: string;
  description: string;
  action: string;
  href: string;
}) {
  return (
    <div className="text-center py-12 space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto">{description}</p>
      <Button asChild>
        <Link href={href}>{action}</Link>
      </Button>
    </div>
  );
}
