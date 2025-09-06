
import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { z, ZodError } from "zod";
import { Crosshair, User } from "@/types/database";

// ---- SCHEMA ----
const getMethod = z.enum([
  "getProPlayersCrossHairs",
  "getPopularCrossHairs",
  "getCrossHairStats",
  "getCrossHairById",
  "getCrossHairsByUserId",
  "getUserById",
  "searchCrossHairs",
]);
type GetMethodType = z.infer<typeof getMethod>;

const getQueryValidator = z.object({
  method: getMethod,
  limit: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 10)),
  offset: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 0)),
  id: z.string().optional().transform((v) => (v ? parseInt(v, 10) : undefined)),
  search: z.string().optional(),
  sortBy: z.enum(["votes", "copies", "recent"]).optional().default("votes"),
});

const postMethod = z.enum(["upvoteCrosshair", "downvoteCrosshair", "copyCrosshair", "createCrosshair"]);

const updateValidator = z.object({
  method: postMethod.exclude(["createCrosshair"]),
  crosshairId: z.number(),
});

const createValidator = z.object({
  method: z.literal("createCrosshair"),
  data: z.object({
    username: z.string().min(1),
    code: z.string().min(1),
    name: z.string().optional(),
    source: z.string().default("self").optional(),
    tags: z.string().optional(),
    isPro: z.boolean().optional(),
  }),
});

type PostBody = z.infer<typeof updateValidator> | z.infer<typeof createValidator>;

// ---- FTS5 SEARCH ----
const prepareSearchTerms = (search: string) => {
  // Clean and normalize input to match unicode61 tokenizer
  const cleaned = search.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '');
  // Split into tokens (minimum 2 chars for prefix indexing)
  const tokens = cleaned.split(/\s+/).filter(token => token.length >= 2);
  // Create prefix and exact queries
  const prefixQuery = tokens.length > 0 ? tokens.map(token => `${token}*`).join(' AND ') : '*';
  const exactQuery = tokens.length > 0 ? tokens.map(token => `"${token}"`).join(' AND ') : '*';
  return {
    prefix: prefixQuery, // e.g., "demon1*"
    exact: exactQuery,  // e.g., '"demon1"'
    original: cleaned
  };
};

const getSearchQuery = (sortBy: string) => {
  // Determine sort order, leveraging indexes
  let orderBy = "c.votes DESC, c.id"; // Uses idx_crosshairs_votes_desc
  if (sortBy === "copies") orderBy = "c.total_copies DESC, c.id"; // Uses idx_crosshairs_copies_desc
  if (sortBy === "recent") orderBy = "c.id DESC"; // Uses idx_crosshairs_recent

  return `
    SELECT c.id, c.userId, c.source, c.name, c.code, c.votes, c.total_copies, c.tags, c.isPro, c.lastUpdated
    FROM crosshairs c
    JOIN crosshairs_fts fts ON c.id = fts.id
    WHERE crosshairs_fts MATCH ?
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `;
};

// ---- QUERIES ----
const getDBQuery = (method: GetMethodType, search?: string, sortBy?: string) => {
  switch (method) {
    case "getCrossHairById":
      return `SELECT id, userId, source, name, code, votes, total_copies, tags, isPro, lastUpdated 
              FROM crosshairs WHERE id = ?`;
    
    case "getUserById":
      return `SELECT id, username, password, role, creatorRank, createdAt, updatedAt 
              FROM users WHERE id = ?`;
    
    case "getCrossHairsByUserId":
      return `SELECT id, userId, source, name, code, votes, total_copies, tags, isPro, lastUpdated 
              FROM crosshairs WHERE userId = ? ORDER BY votes DESC`;
    
    case "getPopularCrossHairs":
      return `SELECT id, userId, source, name, code, votes, total_copies, tags, isPro, lastUpdated 
              FROM crosshairs ORDER BY votes DESC, id LIMIT ? OFFSET ?`;
    
    case "getProPlayersCrossHairs":
      return `SELECT id, userId, source, name, code, votes, total_copies, tags, isPro, lastUpdated 
              FROM crosshairs WHERE isPro = 1 ORDER BY votes DESC`;
    
    case "searchCrossHairs":
      if (search && search.trim()) {
        return getSearchQuery(sortBy || "votes");
      }
      let orderBy = "votes DESC, id";
      if (sortBy === "copies") orderBy = "total_copies DESC, id";
      if (sortBy === "recent") orderBy = "id DESC";
      return `SELECT id, userId, source, name, code, votes, total_copies, tags, isPro, lastUpdated 
              FROM crosshairs ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
    
    case "getCrossHairStats":
      return `
        SELECT 
          (SELECT COUNT(*) FROM crosshairs) AS total_crosshairs,
          (SELECT COUNT(*) FROM users) AS total_users,
          (SELECT COUNT(*) FROM crosshairs WHERE isPro = 1) AS total_pro_crosshairs,
          (SELECT MAX(votes) FROM crosshairs) AS highest_votes
      `;
  }
};

// ---- GET HANDLER ----
export async function GET(request: NextRequest) {
  const db = getCloudflareContext().env.DB;
  const { searchParams } = new URL(request.url);

  try {
    const validated = getQueryValidator.parse({
      method: searchParams.get("method"),
      id: searchParams.get("id") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      offset: searchParams.get("offset") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      sortBy: searchParams.get("sortBy") ?? undefined,
    });

    const query = getDBQuery(validated.method, validated.search, validated.sortBy);
    const stmt = db.prepare(query);

    let result;
    switch (validated.method) {
      case "getCrossHairById":
      case "getUserById":
        if (!validated.id) throw new Error("ID is required");
        result = await stmt.bind(validated.id).first<Crosshair | User>();
        return NextResponse.json({ 
          success: true, 
          data: result ? [result] : [], 
          meta: { count: result ? 1 : 0 } 
        });
      
      case "getCrossHairsByUserId":
        if (!validated.id) throw new Error("ID is required");
        result = await stmt.bind(validated.id).all<Crosshair>();
        break;
      
      case "getPopularCrossHairs":
        result = await stmt.bind(validated.limit, validated.offset).all<Crosshair>();
        break;
      
      case "searchCrossHairs":
        if (validated.search && validated.search.trim()) {
          const terms = prepareSearchTerms(validated.search);
          // Log search terms for debugging
          // Try prefix match first
          result = await stmt.bind(terms.prefix, validated.limit, validated.offset).all<Crosshair>();
          // Fallback to exact match if no results
          if (result.results.length === 0 && terms.prefix !== terms.exact) {
            result = await stmt.bind(terms.exact, validated.limit, validated.offset).all<Crosshair>();
          }
        } else {
          result = await stmt.bind(validated.limit, validated.offset).all<Crosshair>();
        }
        break;
      
      case "getProPlayersCrossHairs":
        result = await stmt.all<Crosshair>();
        break;
      
      case "getCrossHairStats":
        result = await stmt.all<{ 
          total_crosshairs: number; 
          total_users: number; 
          total_pro_crosshairs: number; 
          highest_votes: number; 
        }>();
        break;
    }

    return NextResponse.json({ success: true, data: result.results, meta: result.meta });
    
  } catch (error) {
    console.error("Database query error:", error);
    return NextResponse.json({
      success: false,
      message: (error as Error).message || "Internal server error",
    }, { status: error instanceof ZodError ? 400 : 500 });
  }
}

// ---- POST HANDLER ----
export async function POST(request: NextRequest) {
  const db = getCloudflareContext().env.DB;

  try {
    const body = (await request.json()) as PostBody;
    const method = postMethod.parse(body.method);
    let validated: z.infer<typeof updateValidator> | z.infer<typeof createValidator>;
    if (method === "createCrosshair") {
      validated = createValidator.parse(body);
    } else {
      validated = updateValidator.parse(body);
    }

    if (method === "upvoteCrosshair" || method === "downvoteCrosshair" || method === "copyCrosshair") {
      const { crosshairId } = validated as z.infer<typeof updateValidator>;
      const updateQuery = {
        upvoteCrosshair: `UPDATE crosshairs SET votes = votes + 1 WHERE id = ?`,
        downvoteCrosshair: `UPDATE crosshairs SET votes = votes - 1 WHERE id = ?`,
        copyCrosshair: `UPDATE crosshairs SET total_copies = total_copies + 1 WHERE id = ?`,
      }[method];
      
      const stmt = db.prepare(updateQuery);
      const result = await stmt.bind(crosshairId).run();

      if (result.meta.changes === 0) {
        throw new Error("Crosshair not found");
      }

      return NextResponse.json({ success: true, message: "Operation successful" });
      
    } else if (method === "createCrosshair") {
      const { data } = validated as z.infer<typeof createValidator>;
      const cleanedUsername = data.username.split('#')[0] || `guest_${Date.now()}`;

      // Check if user exists
      const userStmt = db.prepare(`SELECT id FROM users WHERE username = ?`);
      const user = await userStmt.bind(cleanedUsername).first<User>();

      let userId: number;
      if (user) {
        userId = user.id;
      } else {
        const insertUserQuery = `INSERT INTO users (username, password, role, creatorRank) VALUES (?, NULL, 'guest', NULL)`;
        const insertUserStmt = db.prepare(insertUserQuery);
        const insertResult = await insertUserStmt.bind(cleanedUsername).run();

        if (!insertResult.success) {
          throw new Error("Failed to create user");
        }
        userId = insertResult.meta.last_row_id as number;
      }

      // Check if crosshair code exists
      const codeStmt = db.prepare(`SELECT id FROM crosshairs WHERE code = ?`);
      const existing = await codeStmt.bind(data.code).first<Crosshair>();

      if (existing) {
        throw new Error("Crosshair code already exists");
      }

      // Insert crosshair
      const insertCrosshairQuery = `
        INSERT INTO crosshairs (userId, source, name, code, votes, total_copies, tags, isPro, lastUpdated)
        VALUES (?, ?, ?, ?, 0, 0, ?, ?, CURRENT_TIMESTAMP)
      `;
      const insertCrosshairStmt = db.prepare(insertCrosshairQuery);
      const insertCrosshairResult = await insertCrosshairStmt.bind(
        userId,
        data.source ?? null,
        data.name ?? null,
        data.code,
        data.tags ?? null,
        data.isPro ?? false
      ).run();

      if (!insertCrosshairResult.success) {
        throw new Error("Failed to create crosshair");
      }

      const newCrosshairId = insertCrosshairResult.meta.last_row_id as number;
      return NextResponse.json({ success: true, data: { id: newCrosshairId } });
    }
  } catch (error) {
    console.error("Database operation error:", error);
    return NextResponse.json({
      success: false,
      message: (error as Error).message || "Internal server error",
    }, { status: error instanceof ZodError ? 400 : 500 });
  }
}