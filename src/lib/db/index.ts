import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { savedBriefs } from "./schema";

export function hasDatabaseConfig() {
  return Boolean(process.env.DATABASE_URL);
}

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL nao configurada");
  }

  return databaseUrl;
}

function getSql() {
  return neon(getDatabaseUrl());
}

export function getDb() {
  return drizzle(getSql(), {
    schema: { savedBriefs },
  });
}

export async function checkDatabaseConnection() {
  if (!hasDatabaseConfig()) {
    return false;
  }

  try {
    const sql = getSql();
    await sql`select 1`;
    return true;
  } catch {
    return false;
  }
}
