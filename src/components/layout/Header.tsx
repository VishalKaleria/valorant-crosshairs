"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/retroui/Button";
import { Badge } from "@/components/retroui/Badge";
import { Moon, Sun, Menu, X, Database, Hammer, Upload, Heart } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { useVotes } from "@/contexts/VotesContext";

export default function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getUserStats } = useVotes();
  const stats = getUserStats();

  useEffect(() => {
    setMounted(true);
  }, []);

  const navigation = [
    { name: "Database", href: "/database", icon: Database },
    { name: "Builder", href: "/builder", icon: Hammer },
    { name: "Submit", href: "/submit", icon: Upload },
    { name: "Saved", href: "/my-crosshairs", icon: Heart, badge: stats.totalUpvoted + stats.totalCopied },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-primary bg-background">
      <nav className="container mx-auto px-4" aria-label="Main navigation">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="font-head text-lg sm:text-xl lg:text-2xl font-bold">
                <span className="text-primary">VAL</span>
                <span className="text-foreground">CROSSHAIRS</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded transition-all ${
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent text-muted-foreground hover:text-black"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                  {item.badge ? (
                    <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-4">
                      {item.badge}
                    </Badge>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {mounted && (
              <Button
                variant="link"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            )}

            {/* Mobile menu button */}
            <Button
              variant="link"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container mx-auto px-3 py-2 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded transition-all ${
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{item.name}</span>
                  {item.badge ? (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {item.badge}
                    </Badge>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>
      )}
      </nav>
    </header>
  );
}
