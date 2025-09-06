"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";

interface VoteData {
  upvoted: number[];
  downvoted: number[];
  copied: number[];
}

interface VotesContextType {
  voteData: VoteData;
  hasUpvoted: (crosshairId: number) => boolean;
  hasDownvoted: (crosshairId: number) => boolean;
  hasCopied: (crosshairId: number) => boolean;
  upvote: (crosshairId: number) => Promise<boolean>;
  downvote: (crosshairId: number) => Promise<boolean>;
  trackCopy: (crosshairId: number) => Promise<void>;
  getUserStats: () => {
    totalUpvoted: number;
    totalDownvoted: number;
    totalCopied: number;
    upvotedIds: number[];
    downvotedIds: number[];
    copiedIds: number[];
  };
}

const STORAGE_KEY = "valcrosshairs_votes";

const VotesContext = createContext<VotesContextType | undefined>(undefined);

export function VotesProvider({ children }: { children: ReactNode }) {
  const [voteData, setVoteData] = useState<VoteData>({
    upvoted: [],
    downvoted: [],
    copied: [],
  });

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setVoteData(parsed);
      } catch (e) {
        console.error("Failed to parse vote data:", e);
      }
    }
  }, []);

  // Save to localStorage whenever voteData changes
  useEffect(() => {
    if (voteData.upvoted.length > 0 || voteData.downvoted.length > 0 || voteData.copied.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(voteData));
    }
  }, [voteData]);

  const hasUpvoted = (crosshairId: number) => {
    return voteData.upvoted.includes(crosshairId);
  };

  const hasDownvoted = (crosshairId: number) => {
    return voteData.downvoted.includes(crosshairId);
  };

  const hasCopied = (crosshairId: number) => {
    return voteData.copied.includes(crosshairId);
  };

  const upvote = async (crosshairId: number) => {
    if (hasUpvoted(crosshairId)) return false;

    try {
      const response = await fetch("/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "upvoteCrosshair",
          crosshairId,
        }),
      });

      if (response.ok) {
        setVoteData((prev) => ({
          ...prev,
          upvoted: [...prev.upvoted, crosshairId],
          downvoted: prev.downvoted.filter((id) => id !== crosshairId),
        }));
        toast.success("Upvoted!");
        return true;
      }
    } catch (error) {
      console.error("Failed to upvote:", error);
      toast.error("Failed to upvote");
    }
    return false;
  };

  const downvote = async (crosshairId: number) => {
    if (hasDownvoted(crosshairId)) return false;

    try {
      const response = await fetch("/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "downvoteCrosshair",
          crosshairId,
        }),
      });

      if (response.ok) {
        setVoteData((prev) => ({
          ...prev,
          downvoted: [...prev.downvoted, crosshairId],
          upvoted: prev.upvoted.filter((id) => id !== crosshairId),
        }));
        toast.success("Downvoted!");
        return true;
      }
    } catch (error) {
      console.error("Failed to downvote:", error);
      toast.error("Failed to downvote");
    }
    return false;
  };

  const trackCopy = async (crosshairId: number) => {
    try {
      await fetch("/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "copyCrosshair",
          crosshairId,
        }),
      });

      setVoteData((prev) => ({
        ...prev,
        copied: prev.copied.includes(crosshairId) 
          ? prev.copied 
          : [...prev.copied, crosshairId],
      }));
    } catch (error) {
      console.error("Failed to track copy:", error);
    }
  };

  const getUserStats = () => {
    return {
      totalUpvoted: voteData.upvoted.length,
      totalDownvoted: voteData.downvoted.length,
      totalCopied: voteData.copied.length,
      upvotedIds: voteData.upvoted,
      downvotedIds: voteData.downvoted,
      copiedIds: voteData.copied,
    };
  };

  return (
    <VotesContext.Provider
      value={{
        voteData,
        hasUpvoted,
        hasDownvoted,
        hasCopied,
        upvote,
        downvote,
        trackCopy,
        getUserStats,
      }}
    >
      {children}
    </VotesContext.Provider>
  );
}

export function useVotes() {
  const context = useContext(VotesContext);
  if (context === undefined) {
    throw new Error("useVotes must be used within a VotesProvider");
  }
  return context;
}
