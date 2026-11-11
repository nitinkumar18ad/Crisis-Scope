/**
 * db-resolver.ts
 * 
 * Tries to connect to the real PostgreSQL database.
 * If the connection fails, falls back to the in-memory mock database.
 * 
 * This allows the app to run fully offline / without a local database.
 */

import { logger } from "./lib/logger";
import { mockDb } from "./mock-db";

export let useRealDb = false;

export async function checkDbConnection(): Promise<boolean> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    logger.warn("DATABASE_URL not set — using mock in-memory database");
    return false;
  }

  try {
    // Try to connect via the workspace/db module which has pg bundled
    const { pool } = await import("@workspace/db");
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    logger.info("Database connection successful — using real PostgreSQL");
    return true;
  } catch (err: any) {
    logger.warn({ err: err?.message }, "Database connection failed — falling back to mock in-memory database");
    return false;
  }
}

export { mockDb };
