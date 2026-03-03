import type { Badge, PointAction } from "../types";

export const badges: Badge[] = [
  {
    id: "first-sip",
    name: { pl: "Pierwszy Łyk", en: "First Sip" },
    description: { pl: "Odwiedź swoją pierwszą winnicę", en: "Visit your first vineyard" },
    icon: "wine",
    requirement: { pl: "Odwiedź 1 winnicę", en: "Visit 1 vineyard" },
    category: "visit",
  },
  {
    id: "explorer",
    name: { pl: "Odkrywca", en: "Explorer" },
    description: { pl: "Odwiedź 5 różnych winnic", en: "Visit 5 different vineyards" },
    icon: "compass",
    requirement: { pl: "Odwiedź 5 winnic", en: "Visit 5 vineyards" },
    category: "visit",
  },
  {
    id: "sommelier",
    name: { pl: "Sommelier", en: "Sommelier" },
    description: { pl: "Odwiedź wszystkie winnice w regionie", en: "Visit all vineyards in the region" },
    icon: "award",
    requirement: { pl: "Odwiedź wszystkie winnice", en: "Visit all vineyards" },
    category: "visit",
  },
  {
    id: "connoisseur",
    name: { pl: "Koneser", en: "Connoisseur" },
    description: { pl: "Oceń 10 różnych win", en: "Rate 10 different wines" },
    icon: "star",
    requirement: { pl: "Dodaj 10 ocen win", en: "Add 10 wine ratings" },
    category: "review",
  },
  {
    id: "collector",
    name: { pl: "Kolekcjoner", en: "Collector" },
    description: { pl: "Dodaj 20 win do ulubionych", en: "Add 20 wines to favorites" },
    icon: "heart",
    requirement: { pl: "20 ulubionych win", en: "20 favorite wines" },
    category: "collection",
  },
  {
    id: "festival-goer",
    name: { pl: "Winobraniowicz", en: "Festival Goer" },
    description: { pl: "Weź udział w Winobraniu", en: "Attend the Wine Harvest Festival" },
    icon: "party",
    requirement: { pl: "Check-in na Winobraniu", en: "Check in at Winobranie" },
    category: "festival",
  },
  {
    id: "trail-master",
    name: { pl: "Przewodnik", en: "Trail Master" },
    description: { pl: "Przejdź całą trasę piwnic winnych", en: "Complete the full wine cellar route" },
    icon: "map",
    requirement: { pl: "Odwiedź wszystkie piwnice na szlaku", en: "Visit all cellars on the trail" },
    category: "visit",
  },
  {
    id: "photographer",
    name: { pl: "Fotograf", en: "Photographer" },
    description: { pl: "Dodaj 10 zdjęć z winnic", en: "Add 10 vineyard photos" },
    icon: "camera",
    requirement: { pl: "Prześlij 10 zdjęć", en: "Upload 10 photos" },
    category: "special",
  },
];

export const pointActions: PointAction[] = [
  {
    type: "comment",
    points: 30,
    label: { pl: "Dodaj recenzję", en: "Leave a Review" },
    description: {
      pl: "Napisz komentarz i oceń winnicę lub wino (max 1 per miejsce)",
      en: "Write a comment and rate a vineyard or wine (max 1 per place)",
    },
  },
  {
    type: "visit_gps",
    points: 50,
    label: { pl: "Odwiedź winnicę", en: "Visit a Vineyard" },
    description: {
      pl: "Potwierdź wizytę zdjęciem gdy jesteś w winnicy (GPS + foto)",
      en: "Confirm your visit with a photo while at the vineyard (GPS + photo)",
    },
    cooldownHours: 24,
  },
  {
    type: "visit_qr",
    points: 50,
    label: { pl: "Skanuj QR", en: "Scan QR Code" },
    description: {
      pl: "Zeskanuj kod QR wystawiony w winnicy",
      en: "Scan the QR code displayed at the vineyard",
    },
    cooldownHours: 24,
  },
  {
    type: "purchase",
    points: 100,
    label: { pl: "Kup wino", en: "Buy Wine" },
    description: {
      pl: "Prześlij zdjęcie paragonu z zakupu wina",
      en: "Upload a photo of your wine purchase receipt",
    },
  },
  {
    type: "festival_checkin",
    points: 75,
    label: { pl: "Winobranie check-in", en: "Festival Check-in" },
    description: {
      pl: "Zamelduj się na terenie festiwalu Winobranie",
      en: "Check in at the Winobranie festival grounds",
    },
    cooldownHours: 24,
  },
];
