import { useQuery } from "@tanstack/react-query";
import type { Vineyard, Wine, Cellar, Festival } from "@shared/types";
import { vineyards as staticVineyards } from "@shared/data/vineyards";
import { wines as staticWines } from "@shared/data/wines";
import { cellars as staticCellars } from "@shared/data/cellars";
import { festivals as staticFestivals } from "@shared/data/festivals";

async function fetchJson<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) return res.json();
  } catch {
    // offline
  }
  return fallback;
}

export function useVineyards() {
  return useQuery<Vineyard[]>({
    queryKey: ["/api/vineyards"],
    queryFn: () => fetchJson("/api/vineyards", staticVineyards),
    initialData: staticVineyards,
    staleTime: 60_000,
  });
}

export function useVineyard(id: string | undefined) {
  return useQuery<Vineyard | undefined>({
    queryKey: ["/api/vineyards", id],
    queryFn: async () => {
      if (!id) return undefined;
      try {
        const res = await fetch(`/api/vineyards/${id}`, { cache: "no-store" });
        if (res.ok) return res.json();
      } catch {
        // offline
      }
      return staticVineyards.find((v) => v.id === id || v.slug === id);
    },
    initialData: () => staticVineyards.find((v) => v.id === id || v.slug === id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useWines() {
  return useQuery<Wine[]>({
    queryKey: ["/api/wines"],
    queryFn: () => fetchJson("/api/wines", staticWines),
    initialData: staticWines,
    staleTime: 60_000,
  });
}

export function useWine(id: string | undefined) {
  return useQuery<Wine | undefined>({
    queryKey: ["/api/wines", id],
    queryFn: async () => {
      if (!id) return undefined;
      try {
        const res = await fetch(`/api/wines/${id}`, { cache: "no-store" });
        if (res.ok) return res.json();
      } catch {
        // offline
      }
      return staticWines.find((w) => w.id === id);
    },
    initialData: () => staticWines.find((w) => w.id === id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useCellars() {
  return useQuery<Cellar[]>({
    queryKey: ["/api/cellars"],
    queryFn: () => fetchJson("/api/cellars", staticCellars),
    initialData: staticCellars,
    staleTime: 60_000,
  });
}

export function useCellar(id: string | undefined) {
  return useQuery<Cellar | undefined>({
    queryKey: ["/api/cellars", id],
    queryFn: async () => {
      if (!id) return undefined;
      try {
        const res = await fetch(`/api/cellars/${id}`, { cache: "no-store" });
        if (res.ok) return res.json();
      } catch {
        // offline
      }
      return staticCellars.find((c) => c.id === id || c.slug === id);
    },
    initialData: () => staticCellars.find((c) => c.id === id || c.slug === id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useFestivals() {
  return useQuery<Festival[]>({
    queryKey: ["/api/festivals"],
    queryFn: () => fetchJson("/api/festivals", staticFestivals),
    initialData: staticFestivals,
    staleTime: 300_000,
  });
}
