"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";
import { Github, Twitter, Instagram, Mail } from "lucide-react";

export default function Footer() {
  const [stats, setStats] = useState({
    total_crosshairs: 0,
    total_users: 0,
  });

  useEffect(() => {
    // Fetch stats from API
    fetch("/api?method=getCrossHairStats")
      .then((res) => res.json())
      .then((data: any) => {
        if (data.success && data.data?.[0]) {
          setStats(data.data[0]);
        }
      })
      .catch(console.error);
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-card mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div className="space-y-3">
            <h3 className="font-head text-lg font-bold text-primary">About</h3>
            <p className="text-sm text-muted-foreground">
              Database of {stats.total_crosshairs.toLocaleString()} Valorant crosshair codes. 
              Find pro settings, build custom crosshairs, improve your aim.
            </p>
            <div className="flex space-x-4 text-sm">
              <span className="text-primary font-bold">{stats.total_crosshairs.toLocaleString()}</span>
              <span className="text-muted-foreground">Crosshairs</span>
              <span className="text-primary font-bold">{stats.total_users.toLocaleString()}</span>
              <span className="text-muted-foreground">Users</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="font-head text-lg font-bold">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/database" className="text-muted-foreground hover:text-primary transition-colors">
                  Browse Database
                </Link>
              </li>
              <li>
                <Link href="/builder" className="text-muted-foreground hover:text-primary transition-colors">
                  Crosshair Builder
                </Link>
              </li>
              <li>
                <Link href="/submit" className="text-muted-foreground hover:text-primary transition-colors">
                  Submit Code
                </Link>
              </li>
              <li>
                <Link href="/my-crosshairs" className="text-muted-foreground hover:text-primary transition-colors">
                  My Saved
                </Link>
              </li>
            </ul>
          </div>

          {/* Creator Info */}
          <div className="space-y-3">
            <h3 className="font-head text-lg font-bold">Connect</h3>
            <p className="text-sm text-muted-foreground">
              Created by {siteConfig.creator.name}
            </p>
            <div className="flex space-x-3">
              <a 
                href={siteConfig.links.github} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a 
                href={siteConfig.links.twitter} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href={siteConfig.links.instagram} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href={siteConfig.links.email} 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className="text-xs text-muted-foreground">
              © {currentYear} {siteConfig.fullName} by {siteConfig.creator.name}
            </p>
            <p className="text-xs text-muted-foreground">
              Not affiliated with Riot Games or Valorant
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
