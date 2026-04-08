import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  auth0Sub: text("auth0_sub").notNull().unique(),
  email: text("email").notNull(),
  name: text("name"),
  picture: text("picture"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const savedBriefs = pgTable("saved_briefs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  siteName: text("site_name").notNull(),
  siteType: text("site_type").notNull(),
  description: text("description").notNull(),
  colors: text("colors"),
  sections: jsonb("sections").$type<string[]>().notNull().default([]),
  generatedCode: text("generated_code"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type SavedBrief = typeof savedBriefs.$inferSelect;
export type NewSavedBrief = typeof savedBriefs.$inferInsert;
