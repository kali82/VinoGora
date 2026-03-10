import type { Reward } from "../types";

export const rewards: Reward[] = [
  {
    id: "free-tasting-basic",
    title: {
      pl: "Darmowa degustacja (3 wina)",
      en: "Free tasting (3 wines)",
    },
    description: {
      pl: "Wymień punkty na darmową degustację trzech win w dowolnej winnicy partnerskiej.",
      en: "Exchange points for a free tasting of three wines at any partner vineyard.",
    },
    pointsCost: 500,
    category: "tasting",
    active: true,
    totalClaimed: 0,
  },
  {
    id: "free-tasting-premium",
    title: {
      pl: "Degustacja Premium (6 win + sery)",
      en: "Premium Tasting (6 wines + cheese)",
    },
    description: {
      pl: "Pełna degustacja z deską serów i lokalnych przekąsek. Do wykorzystania w dowolnej winnicy.",
      en: "Full tasting with cheese board and local snacks. Redeemable at any vineyard.",
    },
    pointsCost: 1000,
    category: "tasting",
    active: true,
    totalClaimed: 0,
  },
  {
    id: "bottle-discount-10",
    vineyardId: "winnica-milosz",
    title: {
      pl: "10% zniżki na butelkę wina",
      en: "10% off a bottle of wine",
    },
    description: {
      pl: "Zniżka 10% na dowolną butelkę w Winnicy Miłosz.",
      en: "10% discount on any bottle at Miłosz Vineyard.",
    },
    pointsCost: 300,
    category: "wine",
    active: true,
    totalClaimed: 0,
  },
  {
    id: "bottle-free",
    title: {
      pl: "Darmowa butelka wina",
      en: "Free bottle of wine",
    },
    description: {
      pl: "Odbierz darmową butelkę wybranego wina lokalnego. Nagroda dla najaktywniejszych odkrywców.",
      en: "Claim a free bottle of selected local wine. Reward for the most active explorers.",
    },
    pointsCost: 2000,
    category: "wine",
    active: true,
    totalClaimed: 0,
  },
  {
    id: "vineyard-tour-private",
    title: {
      pl: "Prywatne zwiedzanie winnicy",
      en: "Private vineyard tour",
    },
    description: {
      pl: "Ekskluzywne zwiedzanie winnicy z właścicielem. Poznaj sekrety produkcji wina z pierwszej ręki.",
      en: "Exclusive vineyard tour with the owner. Learn winemaking secrets firsthand.",
    },
    pointsCost: 1500,
    category: "experience",
    active: true,
    totalClaimed: 0,
  },
  {
    id: "merchandise-glass",
    title: {
      pl: "Kieliszek VinoGóra",
      en: "VinoGóra Wine Glass",
    },
    description: {
      pl: "Elegancki kieliszek z logo VinoGóra – pamiątka z Twojej winnej przygody.",
      en: "Elegant glass with VinoGóra logo – a souvenir from your wine adventure.",
    },
    pointsCost: 400,
    category: "merchandise",
    active: true,
    totalClaimed: 0,
  },
];
