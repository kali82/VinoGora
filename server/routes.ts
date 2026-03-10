import type { Express, Request, Response } from "express";
import { type Server } from "http";
import { storage } from "./storage";

function getDistanceMeters(
  lat1: number, lng1: number, lat2: number, lng2: number
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function getTargetCoordinates(
  targetType: string, targetId: string
): Promise<{ lat: number; lng: number } | null> {
  if (targetType === "vineyard") {
    const v = await storage.getVineyard(targetId);
    return v?.coordinates ?? null;
  }
  if (targetType === "cellar") {
    const c = await storage.getCellar(targetId);
    return c?.coordinates ?? null;
  }
  if (targetType === "festival") {
    const festivals = await storage.getFestivals();
    return festivals[0]?.coordinates ?? null;
  }
  return null;
}

async function evaluateAndUnlockBadges(uid: string) {
  const profile = await storage.getProfile(uid);
  if (!profile) return;

  const vineyardCount = await storage.getVineyardCount();
  const cellarCount = await storage.getCellarCount();

  if (profile.visitedVineyardIds.length >= 1)
    await storage.unlockBadge(uid, "first-sip");
  if (profile.visitedVineyardIds.length >= 5)
    await storage.unlockBadge(uid, "explorer");
  if (profile.visitedVineyardIds.length >= vineyardCount)
    await storage.unlockBadge(uid, "sommelier");
  if (profile.visitedCellarIds.length >= cellarCount)
    await storage.unlockBadge(uid, "trail-master");
  if (profile.favoriteWineIds.length >= 20)
    await storage.unlockBadge(uid, "collector");

  const checkIns = await storage.getCheckIns(uid);
  if (checkIns.some((c) => c.targetType === "festival"))
    await storage.unlockBadge(uid, "festival-goer");
  if (checkIns.filter((c) => c.photoUrl).length >= 10)
    await storage.unlockBadge(uid, "photographer");
}

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {

  app.use("/api", (_req: Request, res: Response, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });

  // ── Static data ──────────────────────────────────────────────

  app.get("/api/vineyards", async (_req: Request, res: Response) => {
    const data = await storage.getVineyards();
    res.json(data);
  });

  app.get("/api/vineyards/:id", async (req: Request, res: Response) => {
    const v = await storage.getVineyard(req.params.id as string);
    if (!v) return res.status(404).json({ message: "Vineyard not found" });
    res.json(v);
  });

  app.get("/api/cellars", async (_req: Request, res: Response) => {
    const data = await storage.getCellars();
    res.json(data);
  });

  app.get("/api/cellars/:id", async (req: Request, res: Response) => {
    const c = await storage.getCellar(req.params.id as string);
    if (!c) return res.status(404).json({ message: "Cellar not found" });
    res.json(c);
  });

  app.get("/api/wines", async (_req: Request, res: Response) => {
    const data = await storage.getWines();
    res.json(data);
  });

  app.get("/api/wines/:id", async (req: Request, res: Response) => {
    const w = await storage.getWine(req.params.id as string);
    if (!w) return res.status(404).json({ message: "Wine not found" });
    res.json(w);
  });

  app.get("/api/festivals", async (_req: Request, res: Response) => {
    const data = await storage.getFestivals();
    res.json(data);
  });

  app.get("/api/badges", async (_req: Request, res: Response) => {
    const badges = await storage.getBadges();
    const pointActions = await storage.getPointActions();
    res.json({ badges, pointActions });
  });

  // ── Auth verify ─────────────────────────────────────────────

  app.post("/api/auth/verify", async (req: Request, res: Response) => {
    const {
      uid, displayName, email, photoUrl,
      localPoints, localFavoriteWineIds, localUnlockedBadgeIds,
      localVisitedVineyardIds, localVisitedCellarIds,
    } = req.body;
    if (!uid) return res.status(400).json({ message: "uid required" });

    try {
      const profile = await storage.getOrCreateProfile(uid, displayName ?? "User", email, photoUrl);

      if (typeof localPoints === "number" && localPoints > profile.points) {
        await storage.updateProfilePoints(uid, localPoints - profile.points);
        profile.points = localPoints;
      }

      let needsUpdate = false;
      const mergeArr = (existing: string[], incoming?: string[]) => {
        if (!Array.isArray(incoming)) return;
        for (const id of incoming) {
          if (!existing.includes(id)) {
            existing.push(id);
            needsUpdate = true;
          }
        }
      };
      mergeArr(profile.favoriteWineIds, localFavoriteWineIds);
      mergeArr(profile.unlockedBadgeIds, localUnlockedBadgeIds);
      mergeArr(profile.visitedVineyardIds, localVisitedVineyardIds);
      mergeArr(profile.visitedCellarIds, localVisitedCellarIds);

      if (needsUpdate) {
        await storage.updateProfileArrays(uid, {
          favoriteWineIds: profile.favoriteWineIds,
          unlockedBadgeIds: profile.unlockedBadgeIds,
          visitedVineyardIds: profile.visitedVineyardIds,
          visitedCellarIds: profile.visitedCellarIds,
        });
      }

      res.json({ ok: true, profile });
    } catch {
      res.status(500).json({ message: "Internal error" });
    }
  });

  // ── Comments ──────────────────────────────────────────────────

  app.get("/api/comments/:type/:id", async (req: Request, res: Response) => {
    const type = req.params.type as string;
    const id = req.params.id as string;
    const comments = await storage.getComments(type, id);
    res.json(comments);
  });

  app.post("/api/comments/:type/:id", async (req: Request, res: Response) => {
    const type = req.params.type as string;
    const id = req.params.id as string;
    const { userId, userName, userAvatar, rating, text, photoUrl } = req.body;

    if (!userId || !text || !rating) {
      return res.status(400).json({ message: "userId, text, and rating are required" });
    }

    const already = await storage.hasUserCommented(userId, type, id);
    if (already) {
      return res.status(409).json({ message: "You already commented on this" });
    }

    const comment = await storage.addComment({
      userId,
      userName: userName ?? "User",
      userAvatar,
      targetType: type as "vineyard" | "cellar" | "wine",
      targetId: id,
      rating,
      text,
      photoUrl,
    });

    await storage.updateProfilePoints(userId, 30);
    await storage.addActivity(userId, "comment", id, 30);
    await evaluateAndUnlockBadges(userId);

    res.status(201).json(comment);
  });

  // ── Check-in (GPS) ───────────────────────────────────────────

  app.post("/api/checkin", async (req: Request, res: Response) => {
    const { userId, targetType, targetId, latitude, longitude, photoUrl } = req.body;

    if (!userId || !targetType || !targetId || latitude == null || longitude == null) {
      return res.status(400).json({ message: "userId, targetType, targetId, latitude, longitude required" });
    }

    const coords = await getTargetCoordinates(targetType, targetId);
    if (!coords) {
      return res.status(404).json({ message: "Target not found" });
    }

    const distance = getDistanceMeters(latitude, longitude, coords.lat, coords.lng);
    if (distance > 200) {
      return res.status(403).json({ message: "Too far from location", distance: Math.round(distance) });
    }

    const allowed = await storage.canCheckIn(userId, targetId, 24);
    if (!allowed) {
      return res.status(429).json({ message: "Check-in cooldown active (24h)" });
    }

    const checkin = await storage.addCheckIn({
      userId, targetType, targetId, method: "gps", photoUrl, latitude, longitude,
    });

    const pts = targetType === "festival" ? 75 : 50;
    await storage.updateProfilePoints(userId, pts);
    if (targetType === "vineyard" || targetType === "cellar") {
      await storage.addVisited(userId, targetType, targetId);
    }
    await storage.addActivity(userId, "visit_gps", targetId, pts);
    await evaluateAndUnlockBadges(userId);

    res.status(201).json({ checkin, pointsEarned: pts });
  });

  // ── Check-in (QR) ────────────────────────────────────────────

  app.post("/api/checkin/qr", async (req: Request, res: Response) => {
    const { userId, qrPayload } = req.body;

    if (!userId || !qrPayload) {
      return res.status(400).json({ message: "userId and qrPayload required" });
    }

    let parsed: { targetType: string; targetId: string; hash?: string };
    try {
      parsed = JSON.parse(qrPayload);
    } catch {
      return res.status(400).json({ message: "Invalid QR code" });
    }

    const { targetType, targetId } = parsed;
    if (!targetType || !targetId) {
      return res.status(400).json({ message: "Invalid QR payload" });
    }

    const coords = await getTargetCoordinates(targetType, targetId);
    if (!coords) {
      return res.status(404).json({ message: "Target not found" });
    }

    const allowed = await storage.canCheckIn(userId, targetId, 24);
    if (!allowed) {
      return res.status(429).json({ message: "Check-in cooldown active (24h)" });
    }

    const checkin = await storage.addCheckIn({
      userId, targetType: targetType as any, targetId, method: "qr",
    });

    const pts = 50;
    await storage.updateProfilePoints(userId, pts);
    if (targetType === "vineyard" || targetType === "cellar") {
      await storage.addVisited(userId, targetType as any, targetId);
    }
    await storage.addActivity(userId, "visit_qr", targetId, pts);
    await evaluateAndUnlockBadges(userId);

    res.status(201).json({ checkin, pointsEarned: pts });
  });

  // ── Purchase (receipt upload) ─────────────────────────────────

  app.post("/api/purchase", async (req: Request, res: Response) => {
    const { userId, photoUrl, wineId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "userId required" });
    }

    const pts = 100;
    await storage.updateProfilePoints(userId, pts);
    await storage.addActivity(userId, "purchase", wineId ?? "unknown", pts);
    await evaluateAndUnlockBadges(userId);

    res.json({ ok: true, pointsEarned: pts });
  });

  // ── Favorites ─────────────────────────────────────────────────

  app.get("/api/favorites", async (req: Request, res: Response) => {
    const userId = req.query.userId as string;
    if (!userId) return res.status(400).json({ message: "userId query param required" });
    const favs = await storage.getFavorites(userId);
    res.json(favs);
  });

  app.post("/api/favorites", async (req: Request, res: Response) => {
    const { userId, wineId } = req.body;
    if (!userId || !wineId) {
      return res.status(400).json({ message: "userId and wineId required" });
    }
    const result = await storage.toggleFavorite(userId, wineId);
    await evaluateAndUnlockBadges(userId);
    res.json(result);
  });

  // ── User profile ──────────────────────────────────────────────

  app.get("/api/user/profile", async (req: Request, res: Response) => {
    const userId = req.query.userId as string;
    if (!userId) return res.status(400).json({ message: "userId query param required" });
    const profile = await storage.getProfile(userId);
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  });

  // ── Activity history ──────────────────────────────────────────

  app.get("/api/user/activity", async (req: Request, res: Response) => {
    const userId = req.query.userId as string;
    if (!userId) return res.status(400).json({ message: "userId query param required" });
    const activity = await storage.getActivity(userId);
    res.json(activity);
  });

  // ── Ratings aggregation ─────────────────────────────────────

  app.get("/api/ratings/:type/:id", async (req: Request, res: Response) => {
    const type = req.params.type as string;
    const id = req.params.id as string;
    const result = await storage.getAverageRating(type, id);
    res.json(result);
  });

  // ── Leaderboard ─────────────────────────────────────────────

  app.get("/api/leaderboard", async (_req: Request, res: Response) => {
    const limit = parseInt(_req.query.limit as string) || 50;
    const leaderboard = await storage.getLeaderboard(limit);
    res.json(leaderboard);
  });

  // ── Wine notes ──────────────────────────────────────────────────

  app.get("/api/wine-notes", async (req: Request, res: Response) => {
    const userId = req.query.userId as string;
    if (!userId) return res.status(400).json({ message: "userId query param required" });
    const notes = await storage.getWineNotes(userId);
    res.json(notes);
  });

  app.put("/api/wine-notes", async (req: Request, res: Response) => {
    const { userId, wineId, note } = req.body;
    if (!userId || !wineId || !note) {
      return res.status(400).json({ message: "userId, wineId, and note required" });
    }
    const result = await storage.setWineNote(userId, wineId, note);
    res.json(result);
  });

  app.delete("/api/wine-notes/:wineId", async (req: Request, res: Response) => {
    const userId = req.query.userId as string;
    const wineId = req.params.wineId as string;
    if (!userId) return res.status(400).json({ message: "userId query param required" });
    await storage.deleteWineNote(userId, wineId);
    res.json({ ok: true });
  });

  // ── Wine trails ────────────────────────────────────────────────

  app.get("/api/trails", async (_req: Request, res: Response) => {
    const trails = await storage.getWineTrails();
    res.json(trails);
  });

  app.get("/api/trails/:id", async (req: Request, res: Response) => {
    const trail = await storage.getWineTrail(req.params.id as string);
    if (!trail) return res.status(404).json({ message: "Trail not found" });
    res.json(trail);
  });

  // ── Tasting events ─────────────────────────────────────────────

  app.get("/api/events", async (_req: Request, res: Response) => {
    const events = await storage.getTastingEvents();
    res.json(events);
  });

  app.get("/api/events/:id", async (req: Request, res: Response) => {
    const event = await storage.getTastingEvent(req.params.id as string);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  });

  // ── Rewards ────────────────────────────────────────────────────

  app.get("/api/rewards", async (_req: Request, res: Response) => {
    const rewards = await storage.getRewards();
    res.json(rewards);
  });

  app.post("/api/rewards/claim", async (req: Request, res: Response) => {
    const { userId, rewardId } = req.body;
    if (!userId || !rewardId) {
      return res.status(400).json({ message: "userId and rewardId required" });
    }
    const result = await storage.claimReward(userId, rewardId);
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }
    res.json(result);
  });

  app.get("/api/rewards/claims", async (req: Request, res: Response) => {
    const userId = req.query.userId as string;
    if (!userId) return res.status(400).json({ message: "userId query param required" });
    const claims = await storage.getUserClaims(userId);
    res.json(claims);
  });

  // ── Winery dashboard stats ─────────────────────────────────────

  app.get("/api/winery/stats/:vineyardId", async (req: Request, res: Response) => {
    const stats = await storage.getVineyardStats(req.params.vineyardId as string);
    res.json(stats);
  });

  // ── Platform stats (city/admin) ────────────────────────────────

  app.get("/api/platform/stats", async (_req: Request, res: Response) => {
    const stats = await storage.getPlatformStats();
    res.json(stats);
  });

  // ── Push subscriptions ──────────────────────────────────────

  app.post("/api/push/subscribe", async (req: Request, res: Response) => {
    const { userId, subscription } = req.body;
    if (!userId || !subscription) {
      return res.status(400).json({ message: "userId and subscription required" });
    }
    await storage.addPushSubscription(userId, subscription);
    res.json({ ok: true });
  });

  app.delete("/api/push/subscribe", async (req: Request, res: Response) => {
    const userId = req.query.userId as string;
    if (userId) await storage.removePushSubscription(userId);
    res.json({ ok: true });
  });

  return httpServer;
}
