export interface LocalizedText {
  pl: string;
  en: string;
}

export interface Vineyard {
  id: string;
  name: string;
  slug: string;
  location: LocalizedText;
  address: string;
  coordinates: { lat: number; lng: number };
  description: LocalizedText;
  shortDescription: LocalizedText;
  tags: string[];
  phone?: string;
  website?: string;
  email?: string;
  openingHours?: LocalizedText;
  imageUrl: string;
  galleryUrls?: string[];
  wines: string[];
  distanceFromCenter?: number;
  organic?: boolean;
  rating?: number;
  reviewCount?: number;
}

export interface Cellar {
  id: string;
  name: string;
  slug: string;
  location: LocalizedText;
  address: string;
  coordinates: { lat: number; lng: number };
  description: LocalizedText;
  shortDescription: LocalizedText;
  yearBuilt?: number;
  historicalSignificance: LocalizedText;
  imageUrl: string;
  galleryUrls?: string[];
  openingHours?: LocalizedText;
  visitDurationMinutes: number;
  order?: number;
}

export interface Wine {
  id: string;
  name: string;
  vineyardId: string;
  type: "red" | "white" | "rose" | "sparkling";
  grape: string;
  year?: number;
  description: LocalizedText;
  tastingNotes?: LocalizedText;
  foodPairing?: LocalizedText;
  abv?: number;
  volume?: number;
  price?: { min: number; max: number };
  awards?: LocalizedText[];
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
}

export interface FestivalEvent {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  date: string;
  startTime: string;
  endTime: string;
  category: "concert" | "tasting" | "workshop" | "parade" | "other";
  location: LocalizedText;
  coordinates?: { lat: number; lng: number };
}

export interface Festival {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  startDate: string;
  endDate: string;
  location: LocalizedText;
  coordinates: { lat: number; lng: number };
  imageUrl: string;
  events: FestivalEvent[];
}

export interface Badge {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  icon: string;
  requirement: LocalizedText;
  pointsRequired?: number;
  category: "visit" | "review" | "collection" | "festival" | "special";
}

export interface PointAction {
  type: "comment" | "visit_gps" | "visit_qr" | "purchase" | "festival_checkin";
  points: number;
  label: LocalizedText;
  description: LocalizedText;
  cooldownHours?: number;
}

export interface UserComment {
  id: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  targetType: "vineyard" | "cellar" | "wine";
  targetId: string;
  rating: number;
  text: string;
  photoUrl?: string;
  createdAt: string;
}

// ── Wine trails ──────────────────────────────────────────────────

export interface TrailStop {
  order: number;
  type: "vineyard" | "cellar" | "poi";
  targetId: string;
  name: LocalizedText;
  description: LocalizedText;
  coordinates: { lat: number; lng: number };
  durationMinutes: number;
}

export interface WineTrail {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  difficulty: "easy" | "medium" | "hard";
  durationMinutes: number;
  distanceKm: number;
  imageUrl?: string;
  stops: TrailStop[];
}

// ── Tasting events ───────────────────────────────────────────────

export interface TastingEvent {
  id: string;
  vineyardId?: string;
  title: LocalizedText;
  description: LocalizedText;
  date: string;
  startTime: string;
  endTime: string;
  price?: number;
  maxParticipants?: number;
  currentParticipants: number;
  imageUrl?: string;
  coordinates?: { lat: number; lng: number };
}

// ── Rewards ──────────────────────────────────────────────────────

export interface Reward {
  id: string;
  vineyardId?: string;
  title: LocalizedText;
  description: LocalizedText;
  pointsCost: number;
  category: "tasting" | "wine" | "merchandise" | "experience";
  imageUrl?: string;
  active: boolean;
  totalClaimed: number;
}

// ── Wine notes ───────────────────────────────────────────────────

export interface WineNote {
  id: string;
  userId: string;
  wineId: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

// ── Winery stats ─────────────────────────────────────────────────

export interface VineyardStats {
  vineyardId: string;
  totalCheckIns: number;
  uniqueVisitors: number;
  averageRating: number;
  totalComments: number;
  popularWines: Array<{ wineId: string; name: string; rating: number; reviewCount: number }>;
  checkInsByMonth: Array<{ month: string; count: number }>;
}

export interface PlatformStats {
  totalUsers: number;
  totalCheckIns: number;
  totalComments: number;
  activeVineyards: number;
  topVineyards: Array<{ id: string; name: string; checkIns: number; rating: number }>;
  monthlyActivity: Array<{ month: string; checkIns: number; users: number }>;
}
