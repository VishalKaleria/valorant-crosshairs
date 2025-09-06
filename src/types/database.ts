// database.ts

export type UserRole = "guest" | "user" | "admin";

export interface User {
  id: number;
  username: string;
  password: string | null;
  role: UserRole;
  creatorRank: string | null;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface Crosshair {
  id: number;
  userId: number | null;
  source: string | null;
  name: string | null;
  code: string;
  votes: number; // Replaced popularityScore
  total_copies: number; // New column
  tags: string | null;
  isPro: boolean | null;
  lastUpdated: string | null; // ISO date string
}