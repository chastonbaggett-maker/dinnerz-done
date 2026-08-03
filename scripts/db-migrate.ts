import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@libsql/client";

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) {
    console.error("Set TURSO_DATABASE_URL before running migrations.");
    process.exit(1);
  }

  const client = createClient({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const migrationPath = resolve(process.cwd(), "lib/db/migrations/0000_init.sql");
  const sql = readFileSync(migrationPath, "utf8");
  const statements = sql
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await client.execute(`${statement};`);
  }

  console.log(`Applied ${statements.length} migration statements to ${url}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
