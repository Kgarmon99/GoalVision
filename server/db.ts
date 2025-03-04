import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";
import { log } from "./vite";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);

log("Connected to Neon PostgreSQL database", "database");