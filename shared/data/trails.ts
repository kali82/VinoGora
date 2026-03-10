import type { WineTrail } from "../types";

export const wineTrails: WineTrail[] = [
  {
    id: "classic-loop",
    name: {
      pl: "Klasyczna Pętla Winnic",
      en: "Classic Vineyard Loop",
    },
    description: {
      pl: "Najpopularniejszy szlak łączący trzy najstarsze winnice Zielonej Góry. Idealny na pierwszy kontakt z lubuskim winiarstwem.",
      en: "The most popular trail connecting the three oldest vineyards of Zielona Góra. Perfect for your first encounter with Lubuskie winemaking.",
    },
    difficulty: "easy",
    durationMinutes: 180,
    distanceKm: 8.5,
    stops: [
      {
        order: 1,
        type: "vineyard",
        targetId: "winnica-milosz",
        name: { pl: "Winnica Miłosz", en: "Miłosz Vineyard" },
        description: {
          pl: "Start trasy – degustacja białych win w klimatycznym otoczeniu.",
          en: "Starting point – white wine tasting in atmospheric surroundings.",
        },
        coordinates: { lat: 51.9356, lng: 15.5062 },
        durationMinutes: 45,
      },
      {
        order: 2,
        type: "vineyard",
        targetId: "winnica-julia",
        name: { pl: "Winnica Julia", en: "Julia Vineyard" },
        description: {
          pl: "Rodzinna winnica z widokiem na dolinę. Specjalność: Riesling.",
          en: "Family vineyard with valley views. Specialty: Riesling.",
        },
        coordinates: { lat: 51.9289, lng: 15.5148 },
        durationMinutes: 40,
      },
      {
        order: 3,
        type: "vineyard",
        targetId: "cantina",
        name: { pl: "Cantina", en: "Cantina" },
        description: {
          pl: "Nowoczesna winiarnia z restauracją i tarasem widokowym.",
          en: "Modern winery with restaurant and observation terrace.",
        },
        coordinates: { lat: 51.9321, lng: 15.4983 },
        durationMinutes: 50,
      },
    ],
  },
  {
    id: "cellar-heritage",
    name: {
      pl: "Dziedzictwo Piwnic Winnych",
      en: "Wine Cellar Heritage Trail",
    },
    description: {
      pl: "Podróż przez historyczne piwnice winne Zielonej Góry – niektóre pamiętają czasy średniowiecza. Szlak prowadzi podziemnymi korytarzami.",
      en: "Journey through historic wine cellars of Zielona Góra – some dating back to medieval times. The trail leads through underground corridors.",
    },
    difficulty: "easy",
    durationMinutes: 150,
    distanceKm: 3.2,
    stops: [
      {
        order: 1,
        type: "cellar",
        targetId: "muzeum-wina",
        name: { pl: "Muzeum Wina", en: "Wine Museum" },
        description: {
          pl: "Zacznij od historii – Muzeum Wina opowiada o 800 latach winiarstwa w regionie.",
          en: "Start with history – the Wine Museum tells the story of 800 years of winemaking in the region.",
        },
        coordinates: { lat: 51.9356, lng: 15.5062 },
        durationMinutes: 40,
      },
      {
        order: 2,
        type: "cellar",
        targetId: "piwnica-raetscha",
        name: { pl: "Piwnica Raetscha", en: "Raetsch Cellar" },
        description: {
          pl: "Jedna z najstarszych piwnic w mieście, z oryginalnymi sklepieniami.",
          en: "One of the oldest cellars in the city, with original vaulted ceilings.",
        },
        coordinates: { lat: 51.9367, lng: 15.5078 },
        durationMinutes: 30,
      },
      {
        order: 3,
        type: "cellar",
        targetId: "piwnica-pod-lwem",
        name: { pl: "Piwnica Pod Lwem", en: "Under the Lion Cellar" },
        description: {
          pl: "Zabytkowa piwnica z degustacjami lokalnych win.",
          en: "Historic cellar with local wine tastings.",
        },
        coordinates: { lat: 51.9345, lng: 15.5055 },
        durationMinutes: 30,
      },
    ],
  },
  {
    id: "full-day-explorer",
    name: {
      pl: "Pełny Dzień Odkrywcy",
      en: "Full Day Explorer",
    },
    description: {
      pl: "Całodniowy szlak dla prawdziwych entuzjastów. Odwiedź 5 winnic i 2 piwnice. Obejmuje przejazd Wine Busem między najbardziej oddalonymi punktami.",
      en: "Full-day trail for true enthusiasts. Visit 5 vineyards and 2 cellars. Includes Wine Bus transfer between the most distant points.",
    },
    difficulty: "hard",
    durationMinutes: 480,
    distanceKm: 22,
    stops: [
      {
        order: 1,
        type: "cellar",
        targetId: "muzeum-wina",
        name: { pl: "Muzeum Wina", en: "Wine Museum" },
        description: {
          pl: "Poranny start od ekspozycji historii wina.",
          en: "Morning start with wine history exhibition.",
        },
        coordinates: { lat: 51.9356, lng: 15.5062 },
        durationMinutes: 40,
      },
      {
        order: 2,
        type: "vineyard",
        targetId: "winnica-milosz",
        name: { pl: "Winnica Miłosz", en: "Miłosz Vineyard" },
        description: {
          pl: "Degustacja i śniadanie w winnicy.",
          en: "Tasting and breakfast at the vineyard.",
        },
        coordinates: { lat: 51.9356, lng: 15.5062 },
        durationMinutes: 60,
      },
      {
        order: 3,
        type: "vineyard",
        targetId: "winnica-julia",
        name: { pl: "Winnica Julia", en: "Julia Vineyard" },
        description: {
          pl: "Zwiedzanie winnicy z przewodnikiem.",
          en: "Guided vineyard tour.",
        },
        coordinates: { lat: 51.9289, lng: 15.5148 },
        durationMinutes: 50,
      },
      {
        order: 4,
        type: "vineyard",
        targetId: "equus",
        name: { pl: "Winnica Equus", en: "Equus Vineyard" },
        description: {
          pl: "Lunch w winnicy – lokalna kuchnia w parze z winem.",
          en: "Lunch at the vineyard – local cuisine paired with wine.",
        },
        coordinates: { lat: 51.9198, lng: 15.5234 },
        durationMinutes: 90,
      },
      {
        order: 5,
        type: "vineyard",
        targetId: "winnica-slone",
        name: { pl: "Winnica Słone", en: "Słone Vineyard" },
        description: {
          pl: "Popołudniowa degustacja ekologicznych win.",
          en: "Afternoon organic wine tasting.",
        },
        coordinates: { lat: 51.9245, lng: 15.5312 },
        durationMinutes: 45,
      },
      {
        order: 6,
        type: "cellar",
        targetId: "piwnica-raetscha",
        name: { pl: "Piwnica Raetscha", en: "Raetsch Cellar" },
        description: {
          pl: "Wieczorna wizyta w historycznej piwnicy z kieliszkiem wina.",
          en: "Evening visit to historic cellar with a glass of wine.",
        },
        coordinates: { lat: 51.9367, lng: 15.5078 },
        durationMinutes: 40,
      },
      {
        order: 7,
        type: "vineyard",
        targetId: "kregielnia",
        name: { pl: "Winnica Kręgielnia", en: "Kręgielnia Vineyard" },
        description: {
          pl: "Zakończenie dnia kolacją i winem w wyjątkowym miejscu.",
          en: "End the day with dinner and wine in a unique setting.",
        },
        coordinates: { lat: 51.9312, lng: 15.4921 },
        durationMinutes: 60,
      },
    ],
  },
  {
    id: "romantic-sunset",
    name: {
      pl: "Romantyczny Szlak Zachodu Słońca",
      en: "Romantic Sunset Trail",
    },
    description: {
      pl: "Idealny szlak na randkę. Popołudniowa trasa z degustacjami i widokami na zachód słońca nad winnicami.",
      en: "Perfect date trail. Afternoon route with tastings and sunset views over vineyards.",
    },
    difficulty: "easy",
    durationMinutes: 150,
    distanceKm: 5,
    stops: [
      {
        order: 1,
        type: "vineyard",
        targetId: "cantina",
        name: { pl: "Cantina", en: "Cantina" },
        description: {
          pl: "Aperitif na tarasie z widokiem na winnicę.",
          en: "Aperitif on the terrace overlooking the vineyard.",
        },
        coordinates: { lat: 51.9321, lng: 15.4983 },
        durationMinutes: 40,
      },
      {
        order: 2,
        type: "vineyard",
        targetId: "winnica-milosz",
        name: { pl: "Winnica Miłosz", en: "Miłosz Vineyard" },
        description: {
          pl: "Degustacja najlepszych roczników przy zachodzie słońca.",
          en: "Tasting of the finest vintages at sunset.",
        },
        coordinates: { lat: 51.9356, lng: 15.5062 },
        durationMinutes: 50,
      },
      {
        order: 3,
        type: "vineyard",
        targetId: "kregielnia",
        name: { pl: "Winnica Kręgielnia", en: "Kręgielnia Vineyard" },
        description: {
          pl: "Kolacja w winnicy na zakończenie wieczoru.",
          en: "Dinner at the vineyard to end the evening.",
        },
        coordinates: { lat: 51.9312, lng: 15.4921 },
        durationMinutes: 60,
      },
    ],
  },
];
