"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/retroui/Card";
import { Button } from "@/components/retroui/Button";
import { Copy, ThumbsUp, ThumbsDown, Edit } from "lucide-react";
import { Crosshair } from "@/types/database";
import { deserializeCode } from "@/lib/crosshair-service";
import { selectBackgroundForCrosshair, DEFAULT_BACKGROUND } from "@/lib/background-selector";
import { useVotes } from "@/contexts/VotesContext";
import CrosshairPreview from "./CrosshairPreview";
import { toast } from "sonner";

interface CrosshairCardProps {
  crosshair: Crosshair;
}

export default function CrosshairCard({ crosshair }: CrosshairCardProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [votes, setVotes] = useState(crosshair.votes || 0);
  const { hasUpvoted, hasDownvoted, upvote, downvote, trackCopy } = useVotes();
  const [voteState, setVoteState] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (hasUpvoted(crosshair.id)) {
      setVoteState('up');
    } else if (hasDownvoted(crosshair.id)) {
      setVoteState('down');
    } else {
      setVoteState(null);
    }
  }, [crosshair.id, hasUpvoted, hasDownvoted]);

  const profile = deserializeCode(crosshair.code);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(crosshair.code);
      setCopied(true);
      trackCopy(crosshair.id);
      
      // Track analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'copy_crosshair', {
          crosshair_id: crosshair.id,
          crosshair_name: crosshair.name
        });
      }
      
      toast.success("Crosshair code copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error("Failed to copy code");
    }
  };

  const handleUpvote = async () => {
    if (voteState !== 'up') {
      const success = await upvote(crosshair.id);
      if (success) {
        setVotes(prev => voteState === 'down' ? prev + 2 : prev + 1);
        setVoteState('up');
        
        // Track analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'upvote_crosshair', {
            crosshair_id: crosshair.id,
            crosshair_name: crosshair.name
          });
        }
      }
    }
  };

  const handleDownvote = async () => {
    if (voteState !== 'down') {
      const success = await downvote(crosshair.id);
      if (success) {
        setVotes(prev => voteState === 'up' ? prev - 2 : prev - 1);
        setVoteState('down');
        
        // Track analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'downvote_crosshair', {
            crosshair_id: crosshair.id,
            crosshair_name: crosshair.name
          });
        }
      }
    }
  };

  const handleEdit = () => {
    // Use hash for builder route
    router.push(`/builder#${crosshair.code}`);
  };

  const getBackgroundImage = () => {
    if (!profile) {
      return DEFAULT_BACKGROUND;
    }
    
    return selectBackgroundForCrosshair(crosshair.id, profile);
  };

  return (
    <Card className="relative hover:translate-y-[-2px] transition-transform duration-200">
      <div
        className="h-32 sm:h-40 flex items-center justify-center rounded-t-lg bg-cover bg-center"
        style={{ backgroundImage: `url('${getBackgroundImage()}')` }}
      >
        {profile ? (
          <CrosshairPreview profile={profile} view="primary" isFiring={false} size={100} />
        ) : (
          <span className="text-xs text-muted-foreground">Invalid crosshair</span>
        )}
      </div>
      
      <div className="p-2 space-y-2">
        <h3 className="font-bold text-xs sm:text-sm text-foreground line-clamp-1">
          {crosshair.name || `Crosshair #${crosshair.id}`}
        </h3>

        <div className="flex gap-1 items-center">
          {/* Vote buttons with count in center */}
          <div className="flex items-center border border-border rounded-md overflow-hidden bg-card">
            <Button
              size="sm"
              variant={voteState === 'up' ? "success" : "ghost"}
              onClick={handleUpvote}
              className="rounded-none p-0 h-7 w-8 flex items-center justify-center"
              title="Upvote"
            >
              <ThumbsUp className={`w-3 h-3 ${voteState === 'up' ? 'fill-current' : ''}`} />
            </Button>
            <span className="px-1.5 text-xs font-medium min-w-[32px] text-center text-foreground">
              {votes > 0 ? `+${votes}` : votes}
            </span>
            <Button
              size="sm"
              variant={voteState === 'down' ? "destructive" : "ghost"}
              onClick={handleDownvote}
              className="rounded-none p-0 h-7 w-8 flex items-center justify-center"
              title="Downvote"
            >
              <ThumbsDown className={`w-3 h-3 ${voteState === 'down' ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {/* Copy button - icon only */}
          <Button
            size="sm"
            variant={copied ? "success" : "primary"}
            onClick={handleCopy}
            className="h-7 w-8 p-0 flex items-center justify-center"
            title="Copy code"
          >
            <Copy className="w-3 h-3" />
          </Button>

          {/* Edit button - icon only */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleEdit}
            className="h-7 w-8 p-0 flex items-center justify-center"
            title="Edit in builder"
          >
            <Edit className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
