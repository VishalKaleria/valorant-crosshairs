"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/retroui/Input";
import { Button } from "@/components/retroui/Button";
import { ArrowRight, Database, Search } from "lucide-react";
import { siteConfig } from "@/config/site";

export default function SearchBar() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/database?search=${encodeURIComponent(searchTerm)}`);
    } else {
      router.push('/database');
    }
  };

  return (
    <section className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
        <Input
          type="text"
          placeholder="Search crosshair codes or player names..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Button type="submit">
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline ml-2">Search</span>
        </Button>
      </form>
      
      {/* Browse All Button */}
          <div className="flex justify-center">
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
    </section>
  );
}
