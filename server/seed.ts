import "dotenv/config";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../shared/schema";

import { vineyards } from "../shared/data/vineyards";
import { wines } from "../shared/data/wines";
import { cellars } from "../shared/data/cellars";
import { festivals } from "../shared/data/festivals";
import { badges, pointActions } from "../shared/data/badges";

async function seed() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  console.log("Seeding database...");

  // ── Vineyards ───────────────────────────────────────────────
  console.log("  vineyards...");
  for (const v of vineyards) {
    await db
      .insert(schema.vineyardsTable)
      .values({
        id: v.id,
        name: v.name,
        slug: v.slug,
        location: v.location,
        address: v.address,
        coordinates: v.coordinates,
        description: v.description,
        shortDescription: v.shortDescription,
        tags: v.tags,
        phone: v.phone,
        website: v.website,
        email: v.email,
        openingHours: v.openingHours,
        imageUrl: v.imageUrl,
        galleryUrls: v.galleryUrls,
        wineIds: v.wines,
        distanceFromCenter: v.distanceFromCenter,
        organic: v.organic,
        rating: v.rating,
        reviewCount: v.reviewCount,
      })
      .onConflictDoNothing();
  }

  // ── Wines ───────────────────────────────────────────────────
  console.log("  wines...");
  for (const w of wines) {
    await db
      .insert(schema.winesTable)
      .values({
        id: w.id,
        name: w.name,
        vineyardId: w.vineyardId,
        type: w.type,
        grape: w.grape,
        year: w.year,
        description: w.description,
        tastingNotes: w.tastingNotes,
        foodPairing: w.foodPairing,
        abv: w.abv,
        volume: w.volume,
        price: w.price,
        awards: w.awards,
        imageUrl: w.imageUrl,
        rating: w.rating,
        reviewCount: w.reviewCount,
      })
      .onConflictDoNothing();
  }

  // ── Cellars ─────────────────────────────────────────────────
  console.log("  cellars...");
  for (const c of cellars) {
    await db
      .insert(schema.cellarsTable)
      .values({
        id: c.id,
        name: c.name,
        slug: c.slug,
        location: c.location,
        address: c.address,
        coordinates: c.coordinates,
        description: c.description,
        shortDescription: c.shortDescription,
        yearBuilt: c.yearBuilt,
        historicalSignificance: c.historicalSignificance,
        imageUrl: c.imageUrl,
        galleryUrls: c.galleryUrls,
        openingHours: c.openingHours,
        visitDurationMinutes: c.visitDurationMinutes,
        displayOrder: c.order,
      })
      .onConflictDoNothing();
  }

  // ── Festivals + Events ──────────────────────────────────────
  console.log("  festivals...");
  for (const f of festivals) {
    await db
      .insert(schema.festivalsTable)
      .values({
        id: f.id,
        name: f.name,
        description: f.description,
        startDate: f.startDate,
        endDate: f.endDate,
        location: f.location,
        coordinates: f.coordinates,
        imageUrl: f.imageUrl,
      })
      .onConflictDoNothing();

    for (const e of f.events) {
      await db
        .insert(schema.festivalEventsTable)
        .values({
          id: e.id,
          festivalId: f.id,
          name: e.name,
          description: e.description,
          date: e.date,
          startTime: e.startTime,
          endTime: e.endTime,
          category: e.category,
          location: e.location,
          coordinates: e.coordinates,
        })
        .onConflictDoNothing();
    }
  }

  // ── Badges ──────────────────────────────────────────────────
  console.log("  badges...");
  for (const b of badges) {
    await db
      .insert(schema.badgesTable)
      .values({
        id: b.id,
        name: b.name,
        description: b.description,
        icon: b.icon,
        requirement: b.requirement,
        pointsRequired: b.pointsRequired,
        category: b.category,
      })
      .onConflictDoNothing();
  }

  // ── Point Actions ───────────────────────────────────────────
  console.log("  point actions...");
  for (const pa of pointActions) {
    await db
      .insert(schema.pointActionsTable)
      .values({
        type: pa.type,
        points: pa.points,
        label: pa.label,
        description: pa.description,
        cooldownHours: pa.cooldownHours,
      })
      .onConflictDoNothing();
  }

  console.log("Seed complete!");
  await pool.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
