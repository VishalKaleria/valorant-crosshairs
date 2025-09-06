"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/retroui/Card";
import { Button } from "@/components/retroui/Button";
import { Copy, ThumbsUp, ThumbsDown, Edit } from "lucide-react";
import { Crosshair } from "@/types/database";
import { deserializeCode } from "@/lib/crosshair-service";
import { colorPalette } from "@/lib/crosshair-data";
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
    // Available backgrounds with their dominant colors
    const backgrounds = [
      { name: 'blaugelb.webp', colors: ['blue', 'yellow'], luminance: 'medium' },
      { name: 'blue.webp', colors: ['blue'], luminance: 'dark' },
      { name: 'grass.webp', colors: ['green'], luminance: 'medium' },
      { name: 'green.webp', colors: ['green'], luminance: 'dark' },
      { name: 'metall.webp', colors: ['gray', 'silver'], luminance: 'medium' },
      { name: 'orange.webp', colors: ['orange'], luminance: 'bright' },
      { name: 'sky.webp', colors: ['cyan', 'blue'], luminance: 'bright' },
      { name: 'yellow.webp', colors: ['yellow'], luminance: 'bright' }
    ];

    // Get primary color from profile
    const primaryColor = profile?.primary?.color;
    if (primaryColor === undefined || primaryColor === null) {
      return '/assets/vcrdb-backgrounds/metall.webp'; // Default neutral background
    }
    
    let crosshairLuminance = 'medium';
    let crosshairColorName = 'white';
    
    // If using custom hex color
    if (primaryColor === 8 && profile?.primary?.hexColor?.value) {
      const hex = profile.primary.hexColor.value.substring(0, 6);
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      
      crosshairLuminance = luminance > 0.6 ? 'bright' : luminance < 0.3 ? 'dark' : 'medium';
      
      // Determine dominant color from hex
      if (r > g && r > b) crosshairColorName = 'red';
      else if (g > r && g > b) crosshairColorName = 'green';
      else if (b > r && b > g) crosshairColorName = 'blue';
      else if (r > 200 && g > 200) crosshairColorName = 'yellow';
      else if (r > 200 && b < 100) crosshairColorName = 'orange';
      else if (b > 200 && g > 200) crosshairColorName = 'cyan';
    } else {
      // Use color palette for standard colors
      const colorMap: { [key: number]: string } = {
        0: 'white',
        1: 'green',
        2: 'yellow',
        3: 'cyan',
        4: 'pink',
        5: 'purple',
        6: 'white',
        7: 'yellow'
      };
      
      crosshairColorName = colorMap[primaryColor] || 'white';
      
      const colorHex = colorPalette[primaryColor];
      if (colorHex) {
        const r = parseInt(colorHex.substring(1, 3), 16);
        const g = parseInt(colorHex.substring(3, 5), 16);
        const b = parseInt(colorHex.substring(5, 7), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        crosshairLuminance = luminance > 0.6 ? 'bright' : luminance < 0.3 ? 'dark' : 'medium';
      }
    }
    
    // Select best contrasting background
    let selectedBackground = backgrounds[0];
    
    if (crosshairLuminance === 'bright') {
      // For bright crosshairs, prefer dark backgrounds
      const darkBackgrounds = backgrounds.filter(bg => bg.luminance === 'dark');
      selectedBackground = darkBackgrounds.length > 0 
        ? darkBackgrounds[Math.floor(Math.random() * darkBackgrounds.length)]
        : backgrounds.find(bg => bg.name === 'blue.webp') || backgrounds[0];
    } else if (crosshairLuminance === 'dark') {
      // For dark crosshairs, prefer bright backgrounds
      const brightBackgrounds = backgrounds.filter(bg => bg.luminance === 'bright');
      selectedBackground = brightBackgrounds.length > 0
        ? brightBackgrounds[Math.floor(Math.random() * brightBackgrounds.length)]
        : backgrounds.find(bg => bg.name === 'sky.webp') || backgrounds[0];
    } else {
      // For medium luminance, avoid matching colors
      const contrastingBackgrounds = backgrounds.filter(bg => 
        !bg.colors.includes(crosshairColorName.toLowerCase())
      );
      if (contrastingBackgrounds.length > 0) {
        selectedBackground = contrastingBackgrounds[Math.floor(Math.random() * contrastingBackgrounds.length)];
      } else {
        // If no perfect match, use a neutral background
        selectedBackground = backgrounds.find(bg => bg.name === 'metall.webp') || backgrounds[0];
      }
    }
    
    return `/assets/vcrdb-backgrounds/${selectedBackground.name}`;
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
