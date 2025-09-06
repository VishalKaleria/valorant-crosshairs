"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/retroui/Button";
import { Badge } from "@/components/retroui/Badge";
import { Copy, Edit, ThumbsUp, Eye } from "lucide-react";
import { Crosshair } from "@/types/database";
import { deserializeCode } from "@/lib/crosshair-service";
import CrosshairPreview from "./CrosshairPreview";
import { toast } from "sonner";
import { useVotes } from "@/contexts/VotesContext";
import Link from "next/link";

interface CrosshairModalProps {
  crosshair: Crosshair | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CrosshairModal({ crosshair, isOpen, onClose }: CrosshairModalProps) {
  const [copied, setCopied] = useState(false);
  const { upvote, trackCopy, hasUpvoted } = useVotes();
  
  if (!crosshair) return null;
  
  const profile = deserializeCode(crosshair.code);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(crosshair.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackCopy(crosshair.id);
      toast.success("Code copied to clipboard!");
    } catch {
      toast.error("Failed to copy code");
    }
  };
  
  const handleUpvote = async () => {
    if (!hasUpvoted(crosshair.id)) {
      await upvote(crosshair.id);
      toast.success("Upvoted!");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogClose onClose={onClose} />
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-8">
            <span>{crosshair.name || `Crosshair #${crosshair.id}`}</span>
            {crosshair.isPro && <Badge>PRO</Badge>}
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-4 space-y-4">
          {/* Preview */}
          <div className="aspect-video bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center">
            {profile && (
              <CrosshairPreview profile={profile} view="primary" isFiring={false} size={150} />
            )}
          </div>
          
          {/* Info */}
          <div className="space-y-2">
            {crosshair.source && (
              <p className="text-sm">
                <span className="text-muted-foreground">Created by:</span> {crosshair.source}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {crosshair.total_copies} copies
              </span>
              <span className="flex items-center gap-1">
                <ThumbsUp className="h-4 w-4" />
                {crosshair.votes} votes
              </span>
            </div>
          </div>
          
          {/* Code */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Crosshair Code:</p>
            <code className="text-xs font-mono break-all">{crosshair.code}</code>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              onClick={handleCopy}
              variant={copied ? "default" : "secondary"}
              className="flex-1"
            >
              <Copy className="h-4 w-4 mr-2" />
              {copied ? "Copied!" : "Copy Code"}
            </Button>
            
            <Button
              onClick={handleUpvote}
              variant={hasUpvoted(crosshair.id) ? "default" : "outline"}
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              Upvote
            </Button>
            
            <Button asChild variant="outline">
              <Link href={`/builder#${crosshair.code}`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
