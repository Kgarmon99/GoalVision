import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { log } from "./vite";

let db: ReturnType<typeof drizzle> | null = null;

if (process.env.DATABASE_URL) {
  try {
    const sql = neon(process.env.DATABASE_URL);
    db = drizzle(sql);
    log("Connected to Neon PostgreSQL database", "database");
  } catch (error) {
    log("Failed to connect to database, will use in-memory storage", "database");
  }
} else {
  log("DATABASE_URL is not set. Using in-memory storage for local development", "database");
}

export { db };