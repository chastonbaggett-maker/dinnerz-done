import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "@/lib/db/schema";

let client: Client | null = null;
let db: LibSQLDatabase<typeof schema> | null = null;

export function isDatabaseConfigured() {
  return Boolean(process.env.TURSO_DATABASE_URL);
}

/** @deprecated Use isDatabaseConfigured */
export const isSupabaseConfigured = isDatabaseConfigured;

function getTursoClient() {
  if (!process.env.TURSO_DATABASE_URL) {
    throw new Error("TURSO_DATABASE_URL is not configured");
  }

  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }

  return client;
}

export function getDb() {
  if (!isDatabaseConfigured()) {
    throw new Error("Database is not configured");
  }

  if (!db) {
    db = drizzle(getTursoClient(), { schema });
  }

  return db;
}

/** @deprecated Use getDb() */
export function createServerClient() {
  return getDb();
}

export function getRawClient() {
  return getTursoClient();
}
