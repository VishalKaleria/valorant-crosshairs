"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/retroui/Card";
import { Button } from "@/components/retroui/Button";
import { Input } from "@/components/retroui/Input";
import { Textarea } from "@/components/retroui/Textarea";
import { Label } from "@/components/retroui/Label";
import { Badge } from "@/components/retroui/Badge";
import { Switch } from "@/components/retroui/Switch";
import { toast } from "sonner";
import { deserializeCode } from "@/lib/crosshair-service";
import CrosshairPreview from "@/components/crosshair/CrosshairPreview";
import { Send, Copy, Eye } from "lucide-react";

export default function SubmitClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    code: "",
    name: "",
    tags: "",
    isPro: false,
  });

  const [previewProfile, setPreviewProfile] = useState<any>(null);

  const popularTags = [
    "dot",
    "small",
    "pro",
    "fun",
    "minimal",
    "classic",
    "no-lines",
    "thick",
    "thin",
    "cyan",
    "green",
    "yellow",
  ];

  const handleCodeChange = (code: string) => {
    setFormData({ ...formData, code });

    // Try to parse and preview the code
    if (code.trim()) {
      const profile = deserializeCode(code);
      setPreviewProfile(profile);
    } else {
      setPreviewProfile(null);
    }
  };

  const handleTagClick = (tag: string) => {
    const currentTags = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (currentTags.includes(tag)) {
      // Remove tag
      setFormData({
        ...formData,
        tags: currentTags.filter((t) => t !== tag).join(", "),
      });
    } else {
      // Add tag
      setFormData({
        ...formData,
        tags: [...currentTags, tag].join(", "),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all required fields
    if (
      !formData.username ||
      !formData.code ||
      !formData.name ||
      !formData.tags
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate code
    const profile = deserializeCode(formData.code);
    if (!profile) {
      toast.error("Invalid crosshair code. Please check and try again.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "createCrosshair",
          data: {
            username: formData.username,
            code: formData.code,
            name: formData.name,
            source: "self",
            tags: formData.tags,
            isPro: formData.isPro,
          },
        }),
      });

      const data: any = await response.json();

      if (data.success) {
        toast.success("Crosshair submitted successfully!", {
          description: "Your crosshair has been added to the database.",
        });

        // Reset form
        setFormData({
          username: "",
          code: "",
          name: "",
          tags: "",
          isPro: false,
        });
        setPreviewProfile(null);

        // Redirect to the database
        setTimeout(() => {
          router.push("/database");
        }, 2000);
      } else {
        toast.error(data.message || "Failed to submit crosshair");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      handleCodeChange(text);
      toast.success("Code pasted from clipboard");
    } catch (error) {
      toast.error("Failed to read clipboard");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="font-head text-3xl sm:text-4xl font-bold">
          Submit Your Crosshair
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Share your custom crosshair with the community. Your submission will be
          instantly available for others to use.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card>
          <Card.Header>
            <Card.Title>Crosshair Details</Card.Title>
          </Card.Header>
          <Card.Content>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">
                  Your Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="username"
                  placeholder="Enter your name or gamertag"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                />
                <p className="text-xs text-muted-foreground">
                  This will be shown as the creator
                </p>
              </div>

              {/* Crosshair Code */}
              <div className="space-y-2">
                <Label htmlFor="code">
                  Crosshair Code <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <Textarea
                    id="code"
                    placeholder="Paste your crosshair code here (e.g., 0;P;c;1;o;1;d;1...)"
                    value={formData.code}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      handleCodeChange(e.target.value)
                    }
                    className="font-mono text-xs"
                    rows={3}
                    required
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    onClick={handlePasteFromClipboard}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Copy from Valorant: Settings → Crosshair → Export Profile Code
                </p>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Crosshair Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., 'Precise Dot', 'Classic Cross'"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags">
                  Tags <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="tags"
                  placeholder="e.g., dot, small, cyan"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  required
                />
                <div className="flex flex-wrap gap-1 mt-2">
                  {popularTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={
                        formData.tags.includes(tag) ? "default" : "outline"
                      }
                      className="cursor-pointer text-xs"
                      onClick={() => handleTagClick(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Is Pro */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPro"
                  checked={formData.isPro}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isPro: checked })
                  }
                />
                <Label htmlFor="isPro" className="cursor-pointer">
                  This is a pro player&apos;s crosshair
                </Label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={
                  loading ||
                  !formData.username ||
                  !formData.code ||
                  !formData.name ||
                  !formData.tags
                }
              >
                {loading ? (
                  "Submitting..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Crosshair
                  </>
                )}
              </Button>
            </form>
          </Card.Content>
        </Card>

        {/* Preview */}
        <Card>
          <Card.Header>
            <Card.Title className="flex items-center justify-between">
              Preview
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreview(!preview)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </Card.Title>
          </Card.Header>
          <Card.Content>
            {previewProfile ? (
              <div className="space-y-4">
                <div className="aspect-square bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center">
                  <CrosshairPreview
                    profile={previewProfile}
                    view="primary"
                    isFiring={false}
                    size={200}
                  />
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Code Valid ✓</h4>
                  <p className="text-xs text-muted-foreground">
                    Your crosshair code is valid and will display correctly in
                    game.
                  </p>
                </div>
              </div>
            ) : (
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                <p className="text-sm text-muted-foreground text-center px-4">
                  Enter a crosshair code to see preview
                </p>
              </div>
            )}
          </Card.Content>
        </Card>
      </div>

      {/* Guidelines */}
      <Card>
        <Card.Header>
          <Card.Title>Submission Guidelines</Card.Title>
        </Card.Header>
        <Card.Content>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Make sure your crosshair code is valid and works in Valorant</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>All fields (name, username, code, tags) are required</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Add relevant tags to help others find your crosshair</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>
                Only mark as &quot;Pro&quot; if it&apos;s genuinely from a
                professional player
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Duplicate codes will be automatically rejected</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Your submission will be public and available for anyone to use</span>
            </li>
          </ul>
        </Card.Content>
      </Card>
    </div>
  );
}