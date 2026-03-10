import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import type { LocalizedText } from "./types";

// ── Auth ──────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// ── User data ─────────────────────────────────────────────────────

export const profiles = pgTable("profiles", {
  uid: varchar("uid").primaryKey(),
  displayName: text("display_name").notNull(),
  email: text("email"),
  photoUrl: text("photo_url"),
  points: integer("points").notNull().default(0),
  favoriteWineIds: jsonb("favorite_wine_ids").$type<string[]>().notNull().default([]),
  unlockedBadgeIds: jsonb("unlocked_badge_ids").$type<string[]>().notNull().default([]),
  visitedVineyardIds: jsonb("visited_vineyard_ids").$type<string[]>().notNull().default([]),
  visitedCellarIds: jsonb("visited_cellar_ids").$type<string[]>().notNull().default([]),
  role: varchar("role", { length: 20 }).notNull().default("user"),
  managedVineyardId: varchar("managed_vineyard_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  userName: text("user_name"),
  userAvatar: text("user_avatar"),
  targetType: varchar("target_type", { length: 20 }).notNull(),
  targetId: varchar("target_id").notNull(),
  rating: integer("rating").notNull(),
  text: text("text").notNull(),
  photoUrl: text("photo_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const checkIns = pgTable("check_ins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  targetType: varchar("target_type", { length: 20 }).notNull(),
  targetId: varchar("target_id").notNull(),
  method: varchar("method", { length: 10 }).notNull(),
  photoUrl: text("photo_url"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: varchar("type", { length: 30 }).notNull(),
  targetId: varchar("target_id").notNull(),
  points: integer("points").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// ── Static / reference data ───────────────────────────────────────

export const vineyardsTable = pgTable("vineyards", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  location: jsonb("location").$type<LocalizedText>().notNull(),
  address: text("address").notNull(),
  coordinates: jsonb("coordinates").$type<{ lat: number; lng: number }>().notNull(),
  description: jsonb("description").$type<LocalizedText>().notNull(),
  shortDescription: jsonb("short_description").$type<LocalizedText>().notNull(),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  phone: text("phone"),
  website: text("website"),
  email: text("email"),
  openingHours: jsonb("opening_hours").$type<LocalizedText>(),
  imageUrl: text("image_url").notNull(),
  galleryUrls: jsonb("gallery_urls").$type<string[]>(),
  wineIds: jsonb("wine_ids").$type<string[]>().notNull().default([]),
  distanceFromCenter: real("distance_from_center"),
  organic: boolean("organic").default(false),
  rating: real("rating"),
  reviewCount: integer("review_count").default(0),
});

export const winesTable = pgTable("wines", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  vineyardId: varchar("vineyard_id").notNull(),
  type: varchar("type", { length: 20 }).notNull(),
  grape: text("grape").notNull(),
  year: integer("year"),
  description: jsonb("description").$type<LocalizedText>().notNull(),
  tastingNotes: jsonb("tasting_notes").$type<LocalizedText>(),
  foodPairing: jsonb("food_pairing").$type<LocalizedText>(),
  abv: real("abv"),
  volume: integer("volume"),
  price: jsonb("price").$type<{ min: number; max: number }>(),
  awards: jsonb("awards").$type<LocalizedText[]>(),
  imageUrl: text("image_url"),
  rating: real("rating"),
  reviewCount: integer("review_count").default(0),
});

export const cellarsTable = pgTable("cellars", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  location: jsonb("location").$type<LocalizedText>().notNull(),
  address: text("address").notNull(),
  coordinates: jsonb("coordinates").$type<{ lat: number; lng: number }>().notNull(),
  description: jsonb("description").$type<LocalizedText>().notNull(),
  shortDescription: jsonb("short_description").$type<LocalizedText>().notNull(),
  yearBuilt: integer("year_built"),
  historicalSignificance: jsonb("historical_significance").$type<LocalizedText>().notNull(),
  imageUrl: text("image_url").notNull(),
  galleryUrls: jsonb("gallery_urls").$type<string[]>(),
  openingHours: jsonb("opening_hours").$type<LocalizedText>(),
  visitDurationMinutes: integer("visit_duration_minutes").notNull(),
  displayOrder: integer("display_order"),
});

export const festivalsTable = pgTable("festivals", {
  id: varchar("id").primaryKey(),
  name: jsonb("name").$type<LocalizedText>().notNull(),
  description: jsonb("description").$type<LocalizedText>().notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  location: jsonb("location").$type<LocalizedText>().notNull(),
  coordinates: jsonb("coordinates").$type<{ lat: number; lng: number }>().notNull(),
  imageUrl: text("image_url").notNull(),
});

export const festivalEventsTable = pgTable("festival_events", {
  id: varchar("id").primaryKey(),
  festivalId: varchar("festival_id").notNull(),
  name: jsonb("name").$type<LocalizedText>().notNull(),
  description: jsonb("description").$type<LocalizedText>().notNull(),
  date: text("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  category: varchar("category", { length: 20 }).notNull(),
  location: jsonb("location").$type<LocalizedText>().notNull(),
  coordinates: jsonb("coordinates").$type<{ lat: number; lng: number }>(),
});

export const badgesTable = pgTable("badges", {
  id: varchar("id").primaryKey(),
  name: jsonb("name").$type<LocalizedText>().notNull(),
  description: jsonb("description").$type<LocalizedText>().notNull(),
  icon: text("icon").notNull(),
  requirement: jsonb("requirement").$type<LocalizedText>().notNull(),
  pointsRequired: integer("points_required"),
  category: varchar("category", { length: 20 }).notNull(),
});

export const pointActionsTable = pgTable("point_actions", {
  type: varchar("type", { length: 30 }).primaryKey(),
  points: integer("points").notNull(),
  label: jsonb("label").$type<LocalizedText>().notNull(),
  description: jsonb("description").$type<LocalizedText>().notNull(),
  cooldownHours: integer("cooldown_hours"),
});

// ── Wine trails ───────────────────────────────────────────────────

export const wineTrailsTable = pgTable("wine_trails", {
  id: varchar("id").primaryKey(),
  name: jsonb("name").$type<LocalizedText>().notNull(),
  description: jsonb("description").$type<LocalizedText>().notNull(),
  difficulty: varchar("difficulty", { length: 10 }).notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  distanceKm: real("distance_km").notNull(),
  imageUrl: text("image_url"),
  stops: jsonb("stops").$type<Array<{
    order: number;
    type: "vineyard" | "cellar" | "poi";
    targetId: string;
    name: LocalizedText;
    description: LocalizedText;
    coordinates: { lat: number; lng: number };
    durationMinutes: number;
  }>>().notNull(),
});

// ── Tasting events ────────────────────────────────────────────────

export const tastingEventsTable = pgTable("tasting_events", {
  id: varchar("id").primaryKey(),
  vineyardId: varchar("vineyard_id"),
  title: jsonb("title").$type<LocalizedText>().notNull(),
  description: jsonb("description").$type<LocalizedText>().notNull(),
  date: text("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  price: integer("price"),
  maxParticipants: integer("max_participants"),
  currentParticipants: integer("current_participants").notNull().default(0),
  imageUrl: text("image_url"),
  coordinates: jsonb("coordinates").$type<{ lat: number; lng: number }>(),
});

// ── Rewards ───────────────────────────────────────────────────────

export const rewardsTable = pgTable("rewards", {
  id: varchar("id").primaryKey(),
  vineyardId: varchar("vineyard_id"),
  title: jsonb("title").$type<LocalizedText>().notNull(),
  description: jsonb("description").$type<LocalizedText>().notNull(),
  pointsCost: integer("points_cost").notNull(),
  category: varchar("category", { length: 20 }).notNull(),
  imageUrl: text("image_url"),
  active: boolean("active").notNull().default(true),
  totalClaimed: integer("total_claimed").notNull().default(0),
});

export const rewardClaimsTable = pgTable("reward_claims", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  rewardId: varchar("reward_id").notNull(),
  claimedAt: timestamp("claimed_at").notNull().defaultNow(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
});

// ── Miscellaneous ─────────────────────────────────────────────────

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  subscription: jsonb("subscription").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const wineNotes = pgTable("wine_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  wineId: varchar("wine_id").notNull(),
  note: text("note").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Zod & types ───────────────────────────────────────────────────

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
