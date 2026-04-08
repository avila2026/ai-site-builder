import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";

import { savedBriefs, users, type NewUser, type User } from "./schema";

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

export async function findOrCreateUser(userData: {
  auth0Sub: string;
  email: string;
  name?: string | null;
  picture?: string | null;
}): Promise<User> {
  const db = getDb();

  // Tenta encontrar usuário existente
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.auth0Sub, userData.auth0Sub))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // Cria novo usuário
  const newUser: NewUser = {
    auth0Sub: userData.auth0Sub,
    email: userData.email,
    name: userData.name ?? null,
    picture: userData.picture ?? null,
  };

  const inserted = await db.insert(users).values(newUser).returning();
  return inserted[0];
}
