import { useEffect, useRef, useCallback, useState } from "react";
import { vineyards } from "@shared/data/vineyards";
import { toast } from "sonner";

const PROXIMITY_RADIUS_M = 500;
const CHECK_INTERVAL_MS = 60_000;
const NOTIFIED_KEY = "vinogora_proximity_notified";

function getDistanceMeters(
  lat1: number, lng1: number, lat2: number, lng2: number,
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

function getNotified(): Set<string> {
  try {
    const data = JSON.parse(sessionStorage.getItem(NOTIFIED_KEY) || "[]");
    return new Set(data);
  } catch {
    return new Set();
  }
}

function markNotified(id: string) {
  const set = getNotified();
  set.add(id);
  sessionStorage.setItem(NOTIFIED_KEY, JSON.stringify(Array.from(set)));
}

export interface NearbyVineyard {
  id: string;
  name: string;
  distance: number;
}

export function useProximity() {
  const [nearby, setNearby] = useState<NearbyVineyard | null>(null);
  const watchId = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkPosition = useCallback((position: GeolocationPosition) => {
    const { latitude, longitude } = position.coords;
    const notified = getNotified();

    for (const v of vineyards) {
      if (notified.has(v.id)) continue;

      const dist = getDistanceMeters(
        latitude, longitude,
        v.coordinates.lat, v.coordinates.lng,
      );

      if (dist <= PROXIMITY_RADIUS_M) {
        markNotified(v.id);
        setNearby({ id: v.id, name: v.name, distance: Math.round(dist) });
        toast.info(`📍 ${v.name}`, {
          description: `${Math.round(dist)}m`,
          duration: 8000,
        });
        return;
      }
    }
  }, []);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;

    const doCheck = () => {
      navigator.geolocation.getCurrentPosition(
        checkPosition,
        () => { /* silent fail */ },
        { enableHighAccuracy: false, timeout: 5000 },
      );
    };

    doCheck();
    intervalRef.current = setInterval(doCheck, CHECK_INTERVAL_MS);

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkPosition]);

  return nearby;
}
