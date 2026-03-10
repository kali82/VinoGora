import type { TastingEvent } from "../types";

export const tastingEvents: TastingEvent[] = [
  {
    id: "tasting-milosz-summer",
    vineyardId: "winnica-milosz",
    title: {
      pl: "Letnia Degustacja w Winnicy Miłosz",
      en: "Summer Tasting at Miłosz Vineyard",
    },
    description: {
      pl: "Odkryj pełną paletę win z winnicy Miłosz. Degustacja 6 win, deski serów i lokalnych przekąsek. Prowadzona przez sommeliera.",
      en: "Discover the full palette of wines from Miłosz Vineyard. Tasting of 6 wines, cheese boards, and local snacks. Guided by a sommelier.",
    },
    date: "2026-06-15",
    startTime: "17:00",
    endTime: "20:00",
    price: 120,
    maxParticipants: 20,
    currentParticipants: 8,
    coordinates: { lat: 51.9356, lng: 15.5062 },
  },
  {
    id: "tasting-julia-organic",
    vineyardId: "winnica-julia",
    title: {
      pl: "Warsztaty Win Ekologicznych",
      en: "Organic Wine Workshop",
    },
    description: {
      pl: "Poznaj tajniki produkcji win ekologicznych. Spacer po winnicy, degustacja 4 win bio, prelekcja o uprawach ekologicznych.",
      en: "Learn the secrets of organic wine production. Vineyard walk, tasting of 4 organic wines, lecture on eco-friendly cultivation.",
    },
    date: "2026-06-22",
    startTime: "14:00",
    endTime: "17:00",
    price: 90,
    maxParticipants: 15,
    currentParticipants: 5,
    coordinates: { lat: 51.9289, lng: 15.5148 },
  },
  {
    id: "tasting-cantina-grill",
    vineyardId: "cantina",
    title: {
      pl: "Wine & Grill – Kolacja w Winnicy",
      en: "Wine & Grill – Vineyard Dinner",
    },
    description: {
      pl: "Wieczór grillowy z parowaniem win do potraw z grilla. 5-daniowe menu, 5 win, zachód słońca nad winnicą.",
      en: "BBQ evening with wine pairing for grilled dishes. 5-course menu, 5 wines, sunset over the vineyard.",
    },
    date: "2026-07-05",
    startTime: "18:00",
    endTime: "22:00",
    price: 180,
    maxParticipants: 30,
    currentParticipants: 18,
    coordinates: { lat: 51.9321, lng: 15.4983 },
  },
  {
    id: "tasting-winobranie-master",
    title: {
      pl: "Masterclass Winobraniowa",
      en: "Winobranie Masterclass",
    },
    description: {
      pl: "Specjalna degustacja podczas Winobrania 2026. Najlepsze wina ze wszystkich winnic regionu w jednym miejscu. Głosowanie na Wino Roku.",
      en: "Special tasting during Winobranie 2026. The best wines from all regional vineyards in one place. Vote for Wine of the Year.",
    },
    date: "2026-09-06",
    startTime: "12:00",
    endTime: "18:00",
    price: 60,
    maxParticipants: 100,
    currentParticipants: 34,
    coordinates: { lat: 51.9356, lng: 15.5062 },
  },
  {
    id: "tasting-equus-horse",
    vineyardId: "equus",
    title: {
      pl: "Degustacja na Koniach – Winnica Equus",
      en: "Horseback Tasting – Equus Vineyard",
    },
    description: {
      pl: "Unikalne doświadczenie: przejażdżka konna między rzędami winorośli, a potem degustacja 4 win w stadninie.",
      en: "Unique experience: horse ride between vineyard rows, followed by tasting 4 wines at the stud farm.",
    },
    date: "2026-07-19",
    startTime: "15:00",
    endTime: "18:00",
    price: 200,
    maxParticipants: 10,
    currentParticipants: 3,
    coordinates: { lat: 51.9198, lng: 15.5234 },
  },
];
