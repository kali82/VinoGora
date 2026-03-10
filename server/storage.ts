import { type User, type InsertUser } from "@shared/schema";
import {
  profiles,
  comments as commentsTable,
  checkIns as checkInsTable,
  activities as activitiesTable,
  vineyardsTable,
  winesTable,
  cellarsTable,
  festivalsTable,
  festivalEventsTable,
  badgesTable,
  pointActionsTable,
  pushSubscriptions,
  wineNotes,
  wineTrailsTable,
  tastingEventsTable,
  rewardsTable,
  rewardClaimsTable,
  users,
} from "@shared/schema";
import type {
  Vineyard, Cellar, Wine, Festival, Badge, PointAction,
  WineTrail, TastingEvent, Reward, WineNote, VineyardStats, PlatformStats,
} from "@shared/types";
import { db } from "./db";
import { eq, and, desc, sql, or, count as countFn } from "drizzle-orm";

// ── Record types ──────────────────────────────────────────────────

export interface CheckInRecord {
  id: string;
  userId: string;
  targetType: "vineyard" | "cellar" | "festival";
  targetId: string;
  method: "gps" | "qr";
  timestamp: string;
  photoUrl?: string;
  latitude?: number;
  longitude?: number;
}

export interface CommentRecord {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  targetType: "vineyard" | "cellar" | "wine";
  targetId: string;
  rating: number;
  text: string;
  photoUrl?: string;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email?: string;
  photoUrl?: string;
  points: number;
  favoriteWineIds: string[];
  unlockedBadgeIds: string[];
  visitedVineyardIds: string[];
  visitedCellarIds: string[];
  role: string;
  managedVineyardId?: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoUrl?: string;
  points: number;
  level: number;
}

// ── IStorage interface ────────────────────────────────────────────

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getOrCreateProfile(uid: string, displayName: string, email?: string, photoUrl?: string): Promise<UserProfile>;
  getProfile(uid: string): Promise<UserProfile | undefined>;
  updateProfilePoints(uid: string, delta: number): Promise<void>;
  updateProfileArrays(uid: string, data: {
    favoriteWineIds?: string[];
    unlockedBadgeIds?: string[];
    visitedVineyardIds?: string[];
    visitedCellarIds?: string[];
  }): Promise<void>;
  addVisited(uid: string, type: "vineyard" | "cellar", targetId: string): Promise<void>;
  unlockBadge(uid: string, badgeId: string): Promise<void>;

  getComments(targetType: string, targetId: string): Promise<CommentRecord[]>;
  addComment(comment: Omit<CommentRecord, "id" | "createdAt">): Promise<CommentRecord>;
  hasUserCommented(userId: string, targetType: string, targetId: string): Promise<boolean>;

  getAverageRating(targetType: string, targetId: string): Promise<{ average: number; count: number }>;

  addCheckIn(checkin: Omit<CheckInRecord, "id" | "timestamp">): Promise<CheckInRecord>;
  getCheckIns(userId: string): Promise<CheckInRecord[]>;
  canCheckIn(userId: string, targetId: string, cooldownHours: number): Promise<boolean>;

  getFavorites(userId: string): Promise<string[]>;
  toggleFavorite(userId: string, wineId: string): Promise<{ added: boolean }>;

  getActivity(userId: string): Promise<Array<{ type: string; targetId: string; timestamp: string; points: number }>>;
  addActivity(userId: string, type: string, targetId: string, points: number): Promise<void>;

  getLeaderboard(limit: number): Promise<LeaderboardEntry[]>;

  // Static data
  getVineyards(): Promise<Vineyard[]>;
  getVineyard(idOrSlug: string): Promise<Vineyard | undefined>;
  getVineyardCount(): Promise<number>;
  getWines(): Promise<Wine[]>;
  getWine(id: string): Promise<Wine | undefined>;
  getCellars(): Promise<Cellar[]>;
  getCellar(idOrSlug: string): Promise<Cellar | undefined>;
  getCellarCount(): Promise<number>;
  getFestivals(): Promise<Festival[]>;
  getBadges(): Promise<Badge[]>;
  getPointActions(): Promise<PointAction[]>;

  // Wine notes
  getWineNotes(userId: string): Promise<WineNote[]>;
  setWineNote(userId: string, wineId: string, note: string): Promise<WineNote>;
  deleteWineNote(userId: string, wineId: string): Promise<void>;

  // Wine trails
  getWineTrails(): Promise<WineTrail[]>;
  getWineTrail(id: string): Promise<WineTrail | undefined>;

  // Tasting events
  getTastingEvents(): Promise<TastingEvent[]>;
  getTastingEvent(id: string): Promise<TastingEvent | undefined>;

  // Rewards
  getRewards(): Promise<Reward[]>;
  claimReward(userId: string, rewardId: string): Promise<{ success: boolean; message: string }>;
  getUserClaims(userId: string): Promise<Array<{ rewardId: string; claimedAt: string; status: string }>>;

  // Stats
  getVineyardStats(vineyardId: string): Promise<VineyardStats>;
  getPlatformStats(): Promise<PlatformStats>;

  // Push subscriptions
  addPushSubscription(userId: string, subscription: unknown): Promise<void>;
  removePushSubscription(userId: string): Promise<void>;
  getPushSubscription(userId: string): Promise<unknown | undefined>;
}

const POINTS_PER_LEVEL = 200;

// ── Helpers ───────────────────────────────────────────────────────

function rowToProfile(row: typeof profiles.$inferSelect): UserProfile {
  return {
    uid: row.uid,
    displayName: row.displayName,
    email: row.email ?? undefined,
    photoUrl: row.photoUrl ?? undefined,
    points: row.points,
    favoriteWineIds: row.favoriteWineIds ?? [],
    unlockedBadgeIds: row.unlockedBadgeIds ?? [],
    visitedVineyardIds: row.visitedVineyardIds ?? [],
    visitedCellarIds: row.visitedCellarIds ?? [],
    role: row.role,
    managedVineyardId: row.managedVineyardId ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

function rowToComment(row: typeof commentsTable.$inferSelect): CommentRecord {
  return {
    id: row.id,
    userId: row.userId,
    userName: row.userName ?? "User",
    userAvatar: row.userAvatar ?? undefined,
    targetType: row.targetType as CommentRecord["targetType"],
    targetId: row.targetId,
    rating: row.rating,
    text: row.text,
    photoUrl: row.photoUrl ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

function rowToCheckIn(row: typeof checkInsTable.$inferSelect): CheckInRecord {
  return {
    id: row.id,
    userId: row.userId,
    targetType: row.targetType as CheckInRecord["targetType"],
    targetId: row.targetId,
    method: row.method as CheckInRecord["method"],
    timestamp: row.timestamp.toISOString(),
    photoUrl: row.photoUrl ?? undefined,
    latitude: row.latitude ? parseFloat(row.latitude) : undefined,
    longitude: row.longitude ? parseFloat(row.longitude) : undefined,
  };
}

function rowToVineyard(row: typeof vineyardsTable.$inferSelect): Vineyard {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    location: row.location,
    address: row.address,
    coordinates: row.coordinates,
    description: row.description,
    shortDescription: row.shortDescription,
    tags: row.tags ?? [],
    phone: row.phone ?? undefined,
    website: row.website ?? undefined,
    email: row.email ?? undefined,
    openingHours: row.openingHours ?? undefined,
    imageUrl: row.imageUrl,
    galleryUrls: row.galleryUrls ?? undefined,
    wines: row.wineIds ?? [],
    distanceFromCenter: row.distanceFromCenter ?? undefined,
    organic: row.organic ?? undefined,
    rating: row.rating ?? undefined,
    reviewCount: row.reviewCount ?? undefined,
  };
}

function rowToWine(row: typeof winesTable.$inferSelect): Wine {
  return {
    id: row.id,
    name: row.name,
    vineyardId: row.vineyardId,
    type: row.type as Wine["type"],
    grape: row.grape,
    year: row.year ?? undefined,
    description: row.description,
    tastingNotes: row.tastingNotes ?? undefined,
    foodPairing: row.foodPairing ?? undefined,
    abv: row.abv ?? undefined,
    volume: row.volume ?? undefined,
    price: row.price ?? undefined,
    awards: row.awards ?? undefined,
    imageUrl: row.imageUrl ?? undefined,
    rating: row.rating ?? undefined,
    reviewCount: row.reviewCount ?? undefined,
  };
}

function rowToCellar(row: typeof cellarsTable.$inferSelect): Cellar {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    location: row.location,
    address: row.address,
    coordinates: row.coordinates,
    description: row.description,
    shortDescription: row.shortDescription,
    yearBuilt: row.yearBuilt ?? undefined,
    historicalSignificance: row.historicalSignificance,
    imageUrl: row.imageUrl,
    galleryUrls: row.galleryUrls ?? undefined,
    openingHours: row.openingHours ?? undefined,
    visitDurationMinutes: row.visitDurationMinutes,
    order: row.displayOrder ?? undefined,
  };
}

// ── PgStorage ─────────────────────────────────────────────────────

export class PgStorage implements IStorage {

  // ── Users ───────────────────────────────────────────────────

  async getUser(id: string): Promise<User | undefined> {
    const [row] = await db.select().from(users).where(eq(users.id, id));
    return row;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [row] = await db.select().from(users).where(eq(users.username, username));
    return row;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [row] = await db.insert(users).values(insertUser).returning();
    return row;
  }

  // ── Profiles ────────────────────────────────────────────────

  async getOrCreateProfile(uid: string, displayName: string, email?: string, photoUrl?: string): Promise<UserProfile> {
    const [existing] = await db.select().from(profiles).where(eq(profiles.uid, uid));
    if (existing) return rowToProfile(existing);

    const [created] = await db
      .insert(profiles)
      .values({ uid, displayName, email, photoUrl })
      .returning();
    return rowToProfile(created);
  }

  async getProfile(uid: string): Promise<UserProfile | undefined> {
    const [row] = await db.select().from(profiles).where(eq(profiles.uid, uid));
    return row ? rowToProfile(row) : undefined;
  }

  async updateProfilePoints(uid: string, delta: number): Promise<void> {
    await db
      .update(profiles)
      .set({ points: sql`${profiles.points} + ${delta}` })
      .where(eq(profiles.uid, uid));
  }

  async updateProfileArrays(uid: string, data: {
    favoriteWineIds?: string[];
    unlockedBadgeIds?: string[];
    visitedVineyardIds?: string[];
    visitedCellarIds?: string[];
  }): Promise<void> {
    const updates: Record<string, any> = {};
    if (data.favoriteWineIds) updates.favoriteWineIds = data.favoriteWineIds;
    if (data.unlockedBadgeIds) updates.unlockedBadgeIds = data.unlockedBadgeIds;
    if (data.visitedVineyardIds) updates.visitedVineyardIds = data.visitedVineyardIds;
    if (data.visitedCellarIds) updates.visitedCellarIds = data.visitedCellarIds;
    if (Object.keys(updates).length > 0) {
      await db.update(profiles).set(updates).where(eq(profiles.uid, uid));
    }
  }

  async addVisited(uid: string, type: "vineyard" | "cellar", targetId: string): Promise<void> {
    const profile = await this.getProfile(uid);
    if (!profile) return;

    const list = type === "vineyard" ? profile.visitedVineyardIds : profile.visitedCellarIds;
    if (list.includes(targetId)) return;
    list.push(targetId);

    const field = type === "vineyard" ? { visitedVineyardIds: list } : { visitedCellarIds: list };
    await db.update(profiles).set(field).where(eq(profiles.uid, uid));
  }

  async unlockBadge(uid: string, badgeId: string): Promise<void> {
    const profile = await this.getProfile(uid);
    if (!profile) return;
    if (profile.unlockedBadgeIds.includes(badgeId)) return;

    const updated = [...profile.unlockedBadgeIds, badgeId];
    await db.update(profiles).set({ unlockedBadgeIds: updated }).where(eq(profiles.uid, uid));
  }

  // ── Comments ────────────────────────────────────────────────

  async getComments(targetType: string, targetId: string): Promise<CommentRecord[]> {
    const rows = await db
      .select()
      .from(commentsTable)
      .where(and(eq(commentsTable.targetType, targetType), eq(commentsTable.targetId, targetId)))
      .orderBy(desc(commentsTable.createdAt));
    return rows.map(rowToComment);
  }

  async addComment(data: Omit<CommentRecord, "id" | "createdAt">): Promise<CommentRecord> {
    const [row] = await db
      .insert(commentsTable)
      .values({
        userId: data.userId,
        userName: data.userName,
        userAvatar: data.userAvatar,
        targetType: data.targetType,
        targetId: data.targetId,
        rating: data.rating,
        text: data.text,
        photoUrl: data.photoUrl,
      })
      .returning();
    return rowToComment(row);
  }

  async hasUserCommented(userId: string, targetType: string, targetId: string): Promise<boolean> {
    const [row] = await db
      .select({ c: countFn() })
      .from(commentsTable)
      .where(
        and(
          eq(commentsTable.userId, userId),
          eq(commentsTable.targetType, targetType),
          eq(commentsTable.targetId, targetId),
        ),
      );
    return Number(row.c) > 0;
  }

  async getAverageRating(targetType: string, targetId: string): Promise<{ average: number; count: number }> {
    const [row] = await db
      .select({
        avg: sql<string>`coalesce(round(avg(${commentsTable.rating})::numeric, 1), 0)`,
        cnt: countFn(),
      })
      .from(commentsTable)
      .where(and(eq(commentsTable.targetType, targetType), eq(commentsTable.targetId, targetId)));
    return { average: parseFloat(row.avg) || 0, count: Number(row.cnt) };
  }

  // ── Check-ins ───────────────────────────────────────────────

  async addCheckIn(data: Omit<CheckInRecord, "id" | "timestamp">): Promise<CheckInRecord> {
    const [row] = await db
      .insert(checkInsTable)
      .values({
        userId: data.userId,
        targetType: data.targetType,
        targetId: data.targetId,
        method: data.method,
        photoUrl: data.photoUrl,
        latitude: data.latitude?.toString(),
        longitude: data.longitude?.toString(),
      })
      .returning();
    return rowToCheckIn(row);
  }

  async getCheckIns(userId: string): Promise<CheckInRecord[]> {
    const rows = await db
      .select()
      .from(checkInsTable)
      .where(eq(checkInsTable.userId, userId))
      .orderBy(desc(checkInsTable.timestamp));
    return rows.map(rowToCheckIn);
  }

  async canCheckIn(userId: string, targetId: string, cooldownHours: number): Promise<boolean> {
    const [row] = await db
      .select()
      .from(checkInsTable)
      .where(and(eq(checkInsTable.userId, userId), eq(checkInsTable.targetId, targetId)))
      .orderBy(desc(checkInsTable.timestamp))
      .limit(1);
    if (!row) return true;
    const hoursSince = (Date.now() - row.timestamp.getTime()) / (1000 * 60 * 60);
    return hoursSince >= cooldownHours;
  }

  // ── Favorites ───────────────────────────────────────────────

  async getFavorites(userId: string): Promise<string[]> {
    const profile = await this.getProfile(userId);
    return profile?.favoriteWineIds ?? [];
  }

  async toggleFavorite(userId: string, wineId: string): Promise<{ added: boolean }> {
    const profile = await this.getProfile(userId);
    if (!profile) return { added: false };

    const list = [...profile.favoriteWineIds];
    const idx = list.indexOf(wineId);
    if (idx >= 0) {
      list.splice(idx, 1);
      await db.update(profiles).set({ favoriteWineIds: list }).where(eq(profiles.uid, userId));
      return { added: false };
    }
    list.push(wineId);
    await db.update(profiles).set({ favoriteWineIds: list }).where(eq(profiles.uid, userId));
    return { added: true };
  }

  // ── Activity ────────────────────────────────────────────────

  async getActivity(userId: string): Promise<Array<{ type: string; targetId: string; timestamp: string; points: number }>> {
    const rows = await db
      .select()
      .from(activitiesTable)
      .where(eq(activitiesTable.userId, userId))
      .orderBy(desc(activitiesTable.timestamp));
    return rows.map((r) => ({
      type: r.type,
      targetId: r.targetId,
      timestamp: r.timestamp.toISOString(),
      points: r.points,
    }));
  }

  async addActivity(userId: string, type: string, targetId: string, points: number): Promise<void> {
    await db.insert(activitiesTable).values({ userId, type, targetId, points });
  }

  // ── Leaderboard ─────────────────────────────────────────────

  async getLeaderboard(limit: number): Promise<LeaderboardEntry[]> {
    const rows = await db
      .select()
      .from(profiles)
      .orderBy(desc(profiles.points))
      .limit(limit);
    return rows.map((p) => ({
      uid: p.uid,
      displayName: p.displayName,
      photoUrl: p.photoUrl ?? undefined,
      points: p.points,
      level: Math.floor(p.points / POINTS_PER_LEVEL) + 1,
    }));
  }

  // ── Static data: Vineyards ──────────────────────────────────

  async getVineyards(): Promise<Vineyard[]> {
    const rows = await db.select().from(vineyardsTable);
    return rows.map(rowToVineyard);
  }

  async getVineyard(idOrSlug: string): Promise<Vineyard | undefined> {
    const [row] = await db
      .select()
      .from(vineyardsTable)
      .where(or(eq(vineyardsTable.id, idOrSlug), eq(vineyardsTable.slug, idOrSlug)));
    return row ? rowToVineyard(row) : undefined;
  }

  async getVineyardCount(): Promise<number> {
    const [row] = await db.select({ c: countFn() }).from(vineyardsTable);
    return Number(row.c);
  }

  // ── Static data: Wines ──────────────────────────────────────

  async getWines(): Promise<Wine[]> {
    const rows = await db.select().from(winesTable);
    return rows.map(rowToWine);
  }

  async getWine(id: string): Promise<Wine | undefined> {
    const [row] = await db.select().from(winesTable).where(eq(winesTable.id, id));
    return row ? rowToWine(row) : undefined;
  }

  // ── Static data: Cellars ────────────────────────────────────

  async getCellars(): Promise<Cellar[]> {
    const rows = await db.select().from(cellarsTable).orderBy(cellarsTable.displayOrder);
    return rows.map(rowToCellar);
  }

  async getCellar(idOrSlug: string): Promise<Cellar | undefined> {
    const [row] = await db
      .select()
      .from(cellarsTable)
      .where(or(eq(cellarsTable.id, idOrSlug), eq(cellarsTable.slug, idOrSlug)));
    return row ? rowToCellar(row) : undefined;
  }

  async getCellarCount(): Promise<number> {
    const [row] = await db.select({ c: countFn() }).from(cellarsTable);
    return Number(row.c);
  }

  // ── Static data: Festivals ──────────────────────────────────

  async getFestivals(): Promise<Festival[]> {
    const festivalRows = await db.select().from(festivalsTable);
    const eventRows = await db.select().from(festivalEventsTable);

    return festivalRows.map((f) => ({
      id: f.id,
      name: f.name,
      description: f.description,
      startDate: f.startDate,
      endDate: f.endDate,
      location: f.location,
      coordinates: f.coordinates,
      imageUrl: f.imageUrl,
      events: eventRows
        .filter((e) => e.festivalId === f.id)
        .map((e) => ({
          id: e.id,
          name: e.name,
          description: e.description,
          date: e.date,
          startTime: e.startTime,
          endTime: e.endTime,
          category: e.category as "concert" | "tasting" | "workshop" | "parade" | "other",
          location: e.location,
          coordinates: e.coordinates ?? undefined,
        })),
    }));
  }

  // ── Static data: Badges & Point Actions ─────────────────────

  async getBadges(): Promise<Badge[]> {
    const rows = await db.select().from(badgesTable);
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      icon: r.icon,
      requirement: r.requirement,
      pointsRequired: r.pointsRequired ?? undefined,
      category: r.category as Badge["category"],
    }));
  }

  async getPointActions(): Promise<PointAction[]> {
    const rows = await db.select().from(pointActionsTable);
    return rows.map((r) => ({
      type: r.type as PointAction["type"],
      points: r.points,
      label: r.label,
      description: r.description,
      cooldownHours: r.cooldownHours ?? undefined,
    }));
  }

  // ── Push subscriptions ──────────────────────────────────────

  async addPushSubscription(userId: string, subscription: unknown): Promise<void> {
    await db.delete(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));
    await db.insert(pushSubscriptions).values({ userId, subscription });
  }

  async removePushSubscription(userId: string): Promise<void> {
    await db.delete(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));
  }

  async getPushSubscription(userId: string): Promise<unknown | undefined> {
    const [row] = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId));
    return row?.subscription;
  }

  // ── Wine notes ─────────────────────────────────────────────────

  async getWineNotes(userId: string): Promise<WineNote[]> {
    const rows = await db
      .select()
      .from(wineNotes)
      .where(eq(wineNotes.userId, userId))
      .orderBy(desc(wineNotes.updatedAt));
    return rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      wineId: r.wineId,
      note: r.note,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  async setWineNote(userId: string, wineId: string, note: string): Promise<WineNote> {
    const [existing] = await db
      .select()
      .from(wineNotes)
      .where(and(eq(wineNotes.userId, userId), eq(wineNotes.wineId, wineId)));

    if (existing) {
      const [updated] = await db
        .update(wineNotes)
        .set({ note, updatedAt: new Date() })
        .where(eq(wineNotes.id, existing.id))
        .returning();
      return {
        id: updated.id, userId: updated.userId, wineId: updated.wineId,
        note: updated.note, createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    }

    const [created] = await db
      .insert(wineNotes)
      .values({ userId, wineId, note })
      .returning();
    return {
      id: created.id, userId: created.userId, wineId: created.wineId,
      note: created.note, createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  }

  async deleteWineNote(userId: string, wineId: string): Promise<void> {
    await db
      .delete(wineNotes)
      .where(and(eq(wineNotes.userId, userId), eq(wineNotes.wineId, wineId)));
  }

  // ── Wine trails ────────────────────────────────────────────────

  async getWineTrails(): Promise<WineTrail[]> {
    const rows = await db.select().from(wineTrailsTable);
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      difficulty: r.difficulty as WineTrail["difficulty"],
      durationMinutes: r.durationMinutes,
      distanceKm: r.distanceKm,
      imageUrl: r.imageUrl ?? undefined,
      stops: r.stops,
    }));
  }

  async getWineTrail(id: string): Promise<WineTrail | undefined> {
    const [row] = await db.select().from(wineTrailsTable).where(eq(wineTrailsTable.id, id));
    if (!row) return undefined;
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      difficulty: row.difficulty as WineTrail["difficulty"],
      durationMinutes: row.durationMinutes,
      distanceKm: row.distanceKm,
      imageUrl: row.imageUrl ?? undefined,
      stops: row.stops,
    };
  }

  // ── Tasting events ─────────────────────────────────────────────

  async getTastingEvents(): Promise<TastingEvent[]> {
    const rows = await db.select().from(tastingEventsTable);
    return rows.map((r) => ({
      id: r.id,
      vineyardId: r.vineyardId ?? undefined,
      title: r.title,
      description: r.description,
      date: r.date,
      startTime: r.startTime,
      endTime: r.endTime,
      price: r.price ?? undefined,
      maxParticipants: r.maxParticipants ?? undefined,
      currentParticipants: r.currentParticipants,
      imageUrl: r.imageUrl ?? undefined,
      coordinates: r.coordinates ?? undefined,
    }));
  }

  async getTastingEvent(id: string): Promise<TastingEvent | undefined> {
    const [row] = await db.select().from(tastingEventsTable).where(eq(tastingEventsTable.id, id));
    if (!row) return undefined;
    return {
      id: row.id,
      vineyardId: row.vineyardId ?? undefined,
      title: row.title,
      description: row.description,
      date: row.date,
      startTime: row.startTime,
      endTime: row.endTime,
      price: row.price ?? undefined,
      maxParticipants: row.maxParticipants ?? undefined,
      currentParticipants: row.currentParticipants,
      imageUrl: row.imageUrl ?? undefined,
      coordinates: row.coordinates ?? undefined,
    };
  }

  // ── Rewards ────────────────────────────────────────────────────

  async getRewards(): Promise<Reward[]> {
    const rows = await db.select().from(rewardsTable).where(eq(rewardsTable.active, true));
    return rows.map((r) => ({
      id: r.id,
      vineyardId: r.vineyardId ?? undefined,
      title: r.title,
      description: r.description,
      pointsCost: r.pointsCost,
      category: r.category as Reward["category"],
      imageUrl: r.imageUrl ?? undefined,
      active: r.active,
      totalClaimed: r.totalClaimed,
    }));
  }

  async claimReward(userId: string, rewardId: string): Promise<{ success: boolean; message: string }> {
    const profile = await this.getProfile(userId);
    if (!profile) return { success: false, message: "Profile not found" };

    const [reward] = await db.select().from(rewardsTable).where(eq(rewardsTable.id, rewardId));
    if (!reward || !reward.active) return { success: false, message: "Reward not available" };

    if (profile.points < reward.pointsCost) {
      return { success: false, message: "Not enough points" };
    }

    await db.update(profiles)
      .set({ points: sql`${profiles.points} - ${reward.pointsCost}` })
      .where(eq(profiles.uid, userId));

    await db.update(rewardsTable)
      .set({ totalClaimed: sql`${rewardsTable.totalClaimed} + 1` })
      .where(eq(rewardsTable.id, rewardId));

    await db.insert(rewardClaimsTable).values({
      userId,
      rewardId,
      status: "pending",
    });

    return { success: true, message: "Reward claimed successfully" };
  }

  async getUserClaims(userId: string): Promise<Array<{ rewardId: string; claimedAt: string; status: string }>> {
    const rows = await db
      .select()
      .from(rewardClaimsTable)
      .where(eq(rewardClaimsTable.userId, userId))
      .orderBy(desc(rewardClaimsTable.claimedAt));
    return rows.map((r) => ({
      rewardId: r.rewardId,
      claimedAt: r.claimedAt.toISOString(),
      status: r.status,
    }));
  }

  // ── Stats ──────────────────────────────────────────────────────

  async getVineyardStats(vineyardId: string): Promise<VineyardStats> {
    const [checkInCount] = await db
      .select({ c: countFn() })
      .from(checkInsTable)
      .where(eq(checkInsTable.targetId, vineyardId));

    const uniqueVisitorRows = await db
      .select({ uid: checkInsTable.userId })
      .from(checkInsTable)
      .where(eq(checkInsTable.targetId, vineyardId))
      .groupBy(checkInsTable.userId);

    const [ratingRow] = await db
      .select({
        avg: sql<string>`coalesce(round(avg(${commentsTable.rating})::numeric, 1), 0)`,
        cnt: countFn(),
      })
      .from(commentsTable)
      .where(and(eq(commentsTable.targetType, "vineyard"), eq(commentsTable.targetId, vineyardId)));

    const vineyard = await this.getVineyard(vineyardId);
    const wineIds = vineyard?.wines ?? [];
    const popularWines: VineyardStats["popularWines"] = [];
    for (const wid of wineIds) {
      const wine = await this.getWine(wid);
      if (wine) {
        const [wr] = await db
          .select({
            avg: sql<string>`coalesce(round(avg(${commentsTable.rating})::numeric, 1), 0)`,
            cnt: countFn(),
          })
          .from(commentsTable)
          .where(and(eq(commentsTable.targetType, "wine"), eq(commentsTable.targetId, wid)));
        popularWines.push({
          wineId: wid,
          name: wine.name,
          rating: parseFloat(wr.avg) || 0,
          reviewCount: Number(wr.cnt),
        });
      }
    }

    return {
      vineyardId,
      totalCheckIns: Number(checkInCount.c),
      uniqueVisitors: uniqueVisitorRows.length,
      averageRating: parseFloat(ratingRow.avg) || 0,
      totalComments: Number(ratingRow.cnt),
      popularWines: popularWines.sort((a, b) => b.rating - a.rating),
      checkInsByMonth: [],
    };
  }

  async getPlatformStats(): Promise<PlatformStats> {
    const [userCount] = await db.select({ c: countFn() }).from(profiles);
    const [checkInTotal] = await db.select({ c: countFn() }).from(checkInsTable);
    const [commentTotal] = await db.select({ c: countFn() }).from(commentsTable);
    const [vineyardCount] = await db.select({ c: countFn() }).from(vineyardsTable);

    const vineyardRows = await db.select().from(vineyardsTable);
    const topVineyards: PlatformStats["topVineyards"] = [];
    for (const v of vineyardRows) {
      const [ci] = await db
        .select({ c: countFn() })
        .from(checkInsTable)
        .where(eq(checkInsTable.targetId, v.id));
      const [rt] = await db
        .select({
          avg: sql<string>`coalesce(round(avg(${commentsTable.rating})::numeric, 1), 0)`,
        })
        .from(commentsTable)
        .where(and(eq(commentsTable.targetType, "vineyard"), eq(commentsTable.targetId, v.id)));
      topVineyards.push({
        id: v.id,
        name: v.name,
        checkIns: Number(ci.c),
        rating: parseFloat(rt.avg) || 0,
      });
    }
    topVineyards.sort((a, b) => b.checkIns - a.checkIns);

    return {
      totalUsers: Number(userCount.c),
      totalCheckIns: Number(checkInTotal.c),
      totalComments: Number(commentTotal.c),
      activeVineyards: Number(vineyardCount.c),
      topVineyards,
      monthlyActivity: [],
    };
  }
}

export const storage: IStorage = new PgStorage();
