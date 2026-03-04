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
