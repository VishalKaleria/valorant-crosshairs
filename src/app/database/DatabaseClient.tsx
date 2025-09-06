"use client";

import { useState, useEffect, useCallback } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Crosshair } from "@/types/database";
import CrosshairCard from "@/components/crosshair/CrosshairCard";
import { Input } from "@/components/retroui/Input";
import { Button } from "@/components/retroui/Button";
import { Badge } from "@/components/retroui/Badge";
import { Search, X } from "lucide-react";
import { siteConfig } from "@/config/site";

export default function DatabaseClient() {
  // Parse initial URL params manually on client side
  const getInitialParams = () => {
    if (typeof window === 'undefined') {
      return { search: '', sortBy: 'votes', filter: '' };
    }
    const params = new URLSearchParams(window.location.search);
    return {
      search: params.get('search') || '',
      sortBy: params.get('sortBy') || 'votes',
      filter: params.get('filter') || ''
    };
  };

  const [initialParams] = useState(getInitialParams);
  
  const [crosshairs, setCrosshairs] = useState<Crosshair[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(initialParams.search);
  const [activeSearchTerm, setActiveSearchTerm] = useState(initialParams.search);
  const [sortBy, setSortBy] = useState(initialParams.sortBy);
  const [showProOnly, setShowProOnly] = useState(initialParams.filter === "pro");

  const ITEMS_PER_PAGE = 30;

  // Update URL params without triggering navigation
  const updateURLParams = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const params = new URLSearchParams();
    
    // Only add params if they have non-default values
    if (activeSearchTerm) params.set("search", activeSearchTerm);
    if (sortBy !== "votes") params.set("sortBy", sortBy);
    if (showProOnly) params.set("filter", "pro");
    
    // Build the new URL
    const newURL = params.toString() 
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    
    // Update URL without reload using replaceState
    window.history.replaceState({}, '', newURL);
  }, [activeSearchTerm, sortBy, showProOnly]);

  // Fetch crosshairs
  const fetchMoreData = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        method: activeSearchTerm ? "searchCrossHairs" : showProOnly ? "getProPlayersCrossHairs" : "getPopularCrossHairs",
        limit: ITEMS_PER_PAGE.toString(),
        offset: (page * ITEMS_PER_PAGE).toString(),
        sortBy: sortBy,
      });
      
      if (activeSearchTerm) {
        params.append("search", activeSearchTerm);
      }

      const response = await fetch(`/api?${params}`);
      const data: { success: boolean; data: Crosshair[]; meta: { count: number; total: number } } = await response.json();

      if (data.success && data.data) {
        setCrosshairs((prev) => [...prev, ...data.data]);
        setPage((prev) => prev + 1);
        // Set hasMore based on total count and current offset
        setHasMore(data.meta.total > (page + 1) * ITEMS_PER_PAGE);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch crosshairs:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [page, activeSearchTerm, sortBy, showProOnly]);

  // Reset and fetch when filters change
  useEffect(() => {
    setCrosshairs([]);
    setPage(0);
    setHasMore(true);
    setLoading(true);
    updateURLParams();
  }, [activeSearchTerm, sortBy, showProOnly, updateURLParams]);

  // Initial fetch
  useEffect(() => {
    if (page === 0 && loading) {
      fetchMoreData();
    }
  }, [fetchMoreData, loading]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput !== activeSearchTerm) {
      setActiveSearchTerm(searchInput);
    }
  };

  const resetFilters = () => {
    setSearchInput("");
    setActiveSearchTerm("");
    setSortBy("votes");
    setShowProOnly(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="font-head text-3xl sm:text-4xl md:text-5xl font-bold">
          Crosshair Database
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
          Browse {siteConfig.stats.crosshairs.toLocaleString()} Valorant crosshair codes. 
          Filter by style, search by player name, or discover community favorites.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by player, code, or style..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" variant="primary">
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline ml-2">Search</span>
        </Button>
      </form>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          variant={showProOnly ? "default" : "secondary"}
          size="sm"
          onClick={() => setShowProOnly(!showProOnly)}
        >
          Pro Only
        </Button>
        <select 
          className="px-3 py-1 border rounded text-sm"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="votes">Most Popular</option>
          <option value="copies">Most Copied</option>
          <option value="recent">Most Recent</option>
        </select>
      </div>

      {/* Active Filters Display */}
      {(activeSearchTerm || showProOnly) && (
        <div className="flex items-center gap-2 justify-center flex-wrap">
          {activeSearchTerm && (
            <Badge variant="secondary" className="gap-1 flex">
              Search: {activeSearchTerm}
              <X 
                className="h-3 w-3 cursor-pointer my-auto" 
                onClick={() => {
                  setSearchInput("");
                  setActiveSearchTerm("");
                }}
              />
            </Badge>
          )}
          {showProOnly && (
            <Badge variant="secondary" className="gap-1 flex">
              Pro Only
              <X 
                className="h-3 w-3 cursor-pointer my-auto" 
                onClick={() => setShowProOnly(false)}
              />
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={resetFilters}>
            Clear all
          </Button>
        </div>
      )}

      {/* Crosshairs Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
          {[...Array(24)].map((_, i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <InfiniteScroll
          dataLength={crosshairs.length}
          next={fetchMoreData}
          hasMore={hasMore}
          loader={
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 mt-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          }
          endMessage={
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">
                {crosshairs.length === 0
                  ? "No crosshairs found for your search."
                  : "You've viewed all available crosshairs! 🎉"}
              </p>
              <Button variant="secondary" className="mt-4" asChild>
                <a href="/submit">Submit Your Crosshair</a>
              </Button>
            </div>
          }
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
            {crosshairs.map((crosshair) => (
              <CrosshairCard key={crosshair.id} crosshair={crosshair} />
            ))}
          </div>
        </InfiniteScroll>
      )}
    </div>
  );
}