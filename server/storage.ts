import { type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";

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
  createdAt: string;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getOrCreateProfile(uid: string, displayName: string, email?: string, photoUrl?: string): Promise<UserProfile>;
  getProfile(uid: string): Promise<UserProfile | undefined>;
  updateProfilePoints(uid: string, delta: number): Promise<void>;
  addVisited(uid: string, type: "vineyard" | "cellar", targetId: string): Promise<void>;
  unlockBadge(uid: string, badgeId: string): Promise<void>;

  getComments(targetType: string, targetId: string): Promise<CommentRecord[]>;
  addComment(comment: Omit<CommentRecord, "id" | "createdAt">): Promise<CommentRecord>;
  hasUserCommented(userId: string, targetType: string, targetId: string): Promise<boolean>;

  addCheckIn(checkin: Omit<CheckInRecord, "id" | "timestamp">): Promise<CheckInRecord>;
  getCheckIns(userId: string): Promise<CheckInRecord[]>;
  canCheckIn(userId: string, targetId: string, cooldownHours: number): Promise<boolean>;

  getFavorites(userId: string): Promise<string[]>;
  toggleFavorite(userId: string, wineId: string): Promise<{ added: boolean }>;

  getActivity(userId: string): Promise<Array<{ type: string; targetId: string; timestamp: string; points: number }>>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private profiles: Map<string, UserProfile>;
  private comments: CommentRecord[];
  private checkIns: CheckInRecord[];
  private activities: Map<string, Array<{ type: string; targetId: string; timestamp: string; points: number }>>;

  constructor() {
    this.users = new Map();
    this.profiles = new Map();
    this.comments = [];
    this.checkIns = [];
    this.activities = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getOrCreateProfile(uid: string, displayName: string, email?: string, photoUrl?: string): Promise<UserProfile> {
    let profile = this.profiles.get(uid);
    if (!profile) {
      profile = {
        uid,
        displayName,
        email,
        photoUrl,
        points: 0,
        favoriteWineIds: [],
        unlockedBadgeIds: [],
        visitedVineyardIds: [],
        visitedCellarIds: [],
        createdAt: new Date().toISOString(),
      };
      this.profiles.set(uid, profile);
    }
    return profile;
  }

  async getProfile(uid: string): Promise<UserProfile | undefined> {
    return this.profiles.get(uid);
  }

  async updateProfilePoints(uid: string, delta: number): Promise<void> {
    const profile = this.profiles.get(uid);
    if (profile) {
      profile.points += delta;
    }
  }

  async addVisited(uid: string, type: "vineyard" | "cellar", targetId: string): Promise<void> {
    const profile = this.profiles.get(uid);
    if (!profile) return;
    const list = type === "vineyard" ? profile.visitedVineyardIds : profile.visitedCellarIds;
    if (!list.includes(targetId)) {
      list.push(targetId);
    }
  }

  async unlockBadge(uid: string, badgeId: string): Promise<void> {
    const profile = this.profiles.get(uid);
    if (profile && !profile.unlockedBadgeIds.includes(badgeId)) {
      profile.unlockedBadgeIds.push(badgeId);
    }
  }

  async getComments(targetType: string, targetId: string): Promise<CommentRecord[]> {
    return this.comments
      .filter((c) => c.targetType === targetType && c.targetId === targetId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async addComment(data: Omit<CommentRecord, "id" | "createdAt">): Promise<CommentRecord> {
    const comment: CommentRecord = {
      ...data,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.comments.push(comment);
    return comment;
  }

  async hasUserCommented(userId: string, targetType: string, targetId: string): Promise<boolean> {
    return this.comments.some(
      (c) => c.userId === userId && c.targetType === targetType && c.targetId === targetId,
    );
  }

  async addCheckIn(data: Omit<CheckInRecord, "id" | "timestamp">): Promise<CheckInRecord> {
    const checkin: CheckInRecord = {
      ...data,
      id: randomUUID(),
      timestamp: new Date().toISOString(),
    };
    this.checkIns.push(checkin);
    return checkin;
  }

  async getCheckIns(userId: string): Promise<CheckInRecord[]> {
    return this.checkIns
      .filter((c) => c.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async canCheckIn(userId: string, targetId: string, cooldownHours: number): Promise<boolean> {
    const last = this.checkIns
      .filter((c) => c.userId === userId && c.targetId === targetId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    if (!last) return true;
    const hoursSince = (Date.now() - new Date(last.timestamp).getTime()) / (1000 * 60 * 60);
    return hoursSince >= cooldownHours;
  }

  async getFavorites(userId: string): Promise<string[]> {
    const profile = this.profiles.get(userId);
    return profile?.favoriteWineIds ?? [];
  }

  async toggleFavorite(userId: string, wineId: string): Promise<{ added: boolean }> {
    const profile = this.profiles.get(userId);
    if (!profile) return { added: false };
    const idx = profile.favoriteWineIds.indexOf(wineId);
    if (idx >= 0) {
      profile.favoriteWineIds.splice(idx, 1);
      return { added: false };
    }
    profile.favoriteWineIds.push(wineId);
    return { added: true };
  }

  async getActivity(userId: string): Promise<Array<{ type: string; targetId: string; timestamp: string; points: number }>> {
    return this.activities.get(userId) ?? [];
  }

  addActivity(userId: string, type: string, targetId: string, points: number) {
    if (!this.activities.has(userId)) {
      this.activities.set(userId, []);
    }
    this.activities.get(userId)!.push({
      type,
      targetId,
      timestamp: new Date().toISOString(),
      points,
    });
  }
}

export const storage = new MemStorage();
