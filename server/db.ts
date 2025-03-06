import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { log } from "./vite";

if (!process.env.DATABASE_URL) {
  log("DATABASE_URL is not set. Please set your database connection string in .env file", "database");
  log("Current working directory: " + process.cwd(), "database");
  log("Environment variables available: " + Object.keys(process.env).join(", "), "database");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql);

log("Connected to Neon PostgreSQL database", "database");