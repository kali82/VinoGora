import type { Express, Request, Response } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { vineyards } from "@shared/data/vineyards";
import { cellars } from "@shared/data/cellars";
import { wines } from "@shared/data/wines";
import { festivals } from "@shared/data/festivals";
import { badges, pointActions } from "@shared/data/badges";

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

function getTargetCoordinates(
  targetType: string, targetId: string
): { lat: number; lng: number } | null {
  if (targetType === "vineyard") {
    const v = vineyards.find((x) => x.id === targetId);
    return v?.coordinates ?? null;
  }
  if (targetType === "cellar") {
    const c = cellars.find((x) => x.id === targetId);
    return c?.coordinates ?? null;
  }
  if (targetType === "festival") {
    const f = festivals[0];
    return f?.coordinates ?? null;
  }
  return null;
}

async function evaluateAndUnlockBadges(uid: string) {
  const profile = await storage.getProfile(uid);
  if (!profile) return;

  if (profile.visitedVineyardIds.length >= 1)
    await storage.unlockBadge(uid, "first-sip");
  if (profile.visitedVineyardIds.length >= 5)
    await storage.unlockBadge(uid, "explorer");
  if (profile.visitedVineyardIds.length >= vineyards.length)
    await storage.unlockBadge(uid, "sommelier");
  if (profile.visitedCellarIds.length >= cellars.length)
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

  // ── Static data ──────────────────────────────────────────────

  app.get("/api/vineyards", (_req: Request, res: Response) => {
    res.json(vineyards);
  });

  app.get("/api/vineyards/:id", (req: Request, res: Response) => {
    const v = vineyards.find((x) => x.id === req.params.id || x.slug === req.params.id);
    if (!v) return res.status(404).json({ message: "Vineyard not found" });
    res.json(v);
  });

  app.get("/api/cellars", (_req: Request, res: Response) => {
    res.json(cellars);
  });

  app.get("/api/cellars/:id", (req: Request, res: Response) => {
    const c = cellars.find((x) => x.id === req.params.id || x.slug === req.params.id);
    if (!c) return res.status(404).json({ message: "Cellar not found" });
    res.json(c);
  });

  app.get("/api/wines", (_req: Request, res: Response) => {
    res.json(wines);
  });

  app.get("/api/wines/:id", (req: Request, res: Response) => {
    const w = wines.find((x) => x.id === req.params.id);
    if (!w) return res.status(404).json({ message: "Wine not found" });
    res.json(w);
  });

  app.get("/api/festivals", (_req: Request, res: Response) => {
    res.json(festivals);
  });

  app.get("/api/badges", (_req: Request, res: Response) => {
    res.json({ badges, pointActions });
  });

  // ── Auth verify (lightweight – real verification would use Firebase Admin SDK) ──

  app.post("/api/auth/verify", (req: Request, res: Response) => {
    const { uid, displayName, email, photoUrl } = req.body;
    if (!uid) return res.status(400).json({ message: "uid required" });

    storage.getOrCreateProfile(uid, displayName ?? "User", email, photoUrl)
      .then((profile) => res.json({ ok: true, profile }))
      .catch(() => res.status(500).json({ message: "Internal error" }));
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
    (storage as any).addActivity(userId, "comment", id, 30);
    await evaluateAndUnlockBadges(userId);

    res.status(201).json(comment);
  });

  // ── Check-in (GPS) ───────────────────────────────────────────

  app.post("/api/checkin", async (req: Request, res: Response) => {
    const { userId, targetType, targetId, latitude, longitude, photoUrl } = req.body;

    if (!userId || !targetType || !targetId || latitude == null || longitude == null) {
      return res.status(400).json({ message: "userId, targetType, targetId, latitude, longitude required" });
    }

    const coords = getTargetCoordinates(targetType, targetId);
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
    (storage as any).addActivity(userId, "visit_gps", targetId, pts);
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

    const coords = getTargetCoordinates(targetType, targetId);
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
    (storage as any).addActivity(userId, "visit_qr", targetId, pts);
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
    (storage as any).addActivity(userId, "purchase", wineId ?? "unknown", pts);
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

  return httpServer;
}
