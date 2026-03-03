import { useState, useMemo, useCallback } from "react";
import { ArrowLeft, Clock, MapPin, Route as RouteIcon, Navigation } from "lucide-react";
import { Link } from "wouter";
import { Slider } from "@/components/ui/slider";
import { useTranslation } from "react-i18next";
import { useLocalized } from "@/hooks/use-localized";
import MapView, { type MapMarker, MAPBOX_TOKEN } from "@/components/map/MapView";
import { cellars } from "@shared/data/cellars";
import { useIsMobile } from "@/hooks/use-mobile";

async function fetchRoute(
  coordinates: [number, number][],
): Promise<Record<string, unknown> | null> {
  if (coordinates.length < 2) return null;
  const coords = coordinates.map((c) => c.join(",")).join(";");
  const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${coords}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!data.routes?.[0]) return null;
    return {
      type: "FeatureCollection" as const,
      features: [
        {
          type: "Feature" as const,
          properties: {
            distance: data.routes[0].distance,
            duration: data.routes[0].duration,
          },
          geometry: data.routes[0].geometry,
        },
      ],
    };
  } catch {
    return null;
  }
}

export default function CellarsMap() {
  const { t: tr } = useTranslation();
  const { t } = useLocalized();
  const isMobile = useIsMobile();
  const [hours, setHours] = useState([3]);
  const [routePlanned, setRoutePlanned] = useState(false);
  const [routeGeoJson, setRouteGeoJson] =
    useState<Record<string, unknown> | null>(null);
  const [routeInfo, setRouteInfo] = useState<{
    distance: number;
    duration: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const sortedCellars = useMemo(
    () => [...cellars].sort((a, b) => (a.order ?? 99) - (b.order ?? 99)),
    [],
  );

  const selectedCellars = useMemo(() => {
    const totalMinutes = hours[0] * 60;
    let accum = 0;
    const result = [];
    for (const cellar of sortedCellars) {
      const walkBetween = result.length > 0 ? 8 : 0;
      if (accum + cellar.visitDurationMinutes + walkBetween <= totalMinutes) {
        accum += cellar.visitDurationMinutes + walkBetween;
        result.push(cellar);
      }
    }
    return result;
  }, [hours, sortedCellars]);

  const markers: MapMarker[] = useMemo(
    () =>
      (routePlanned ? selectedCellars : sortedCellars).map((c) => ({
        id: c.id,
        latitude: c.coordinates.lat,
        longitude: c.coordinates.lng,
        label: c.name,
        type: "cellar" as const,
      })),
    [routePlanned, selectedCellars, sortedCellars],
  );

  const generateRoute = useCallback(async () => {
    setLoading(true);
    const coords: [number, number][] = selectedCellars.map((c) => [
      c.coordinates.lng,
      c.coordinates.lat,
    ]);
    const route = await fetchRoute(coords);
    setRouteGeoJson(route);
    const features = route?.features as Array<{ properties: { distance: number; duration: number } }> | undefined;
    if (features?.[0]?.properties) {
      setRouteInfo({
        distance: features[0].properties.distance,
        duration: features[0].properties.duration,
      });
    }
    setRoutePlanned(true);
    setLoading(false);
  }, [selectedCellars]);

  const resetRoute = useCallback(() => {
    setRoutePlanned(false);
    setRouteGeoJson(null);
    setRouteInfo(null);
  }, []);

  const startNavigation = useCallback(() => {
    if (selectedCellars.length === 0) return;
    const waypoints = selectedCellars
      .map((c) => `${c.coordinates.lat},${c.coordinates.lng}`)
      .join("/");
    const dest = selectedCellars[selectedCellars.length - 1];
    window.open(
      `https://www.google.com/maps/dir/${waypoints}/@${dest.coordinates.lat},${dest.coordinates.lng},15z/data=!4m2!4m1!3e2`,
      "_blank",
    );
  }, [selectedCellars]);

  const totalVisitMinutes = selectedCellars.reduce(
    (sum, c) => sum + c.visitDurationMinutes,
    0,
  );

  const controlPanel = (
    <div className="space-y-5">
      {!routePlanned ? (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-2xl font-display font-bold">
              {tr("cellars.planRoute")}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {tr("cellars.planDescription")}
            </p>
          </div>

          <div className="bg-muted/30 p-5 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Clock size={18} />
                {tr("cellars.availableTime")}
              </div>
              <span className="text-2xl font-display font-bold">
                {tr("cellars.hours", { count: hours[0] })}
              </span>
            </div>
            <Slider
              value={hours}
              onValueChange={setHours}
              max={8}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1h</span>
              <span>4h</span>
              <span>8h</span>
            </div>
          </div>

          <div className="text-sm text-muted-foreground text-center">
            {tr("cellars.cellarsCount", { count: selectedCellars.length })} •{" "}
            ~{totalVisitMinutes} min
          </div>

          <button
            onClick={generateRoute}
            disabled={loading || selectedCellars.length < 2}
            className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-semibold flex justify-center items-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            <RouteIcon size={20} />
            {loading ? tr("common.loading") : tr("cellars.generateRoute")}
          </button>
        </div>
      ) : (
        <div className="space-y-5 animate-in slide-in-from-bottom-8 duration-500">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-display font-bold">
                {tr("cellars.yourRoute", { hours: hours[0] })}
              </h2>
              <p className="text-sm text-muted-foreground">
                {tr("cellars.cellarsCount", { count: selectedCellars.length })}{" "}
                •{" "}
                {routeInfo
                  ? tr("cellars.totalWalking", {
                      km: (routeInfo.distance / 1000).toFixed(1),
                    })
                  : ""}
              </p>
            </div>
            <button onClick={resetRoute} className="text-sm text-primary font-semibold">
              {tr("common.edit")}
            </button>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {selectedCellars.map((cellar, i) => (
              <Link key={cellar.id} href={`/cellars/${cellar.id}`}>
                <div className="flex items-center gap-4 p-3 bg-card rounded-2xl border border-border cursor-pointer hover:bg-card/80 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{cellar.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {t(cellar.shortDescription)}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {tr("cellars.estimatedTime", { min: cellar.visitDurationMinutes })}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <button
            onClick={startNavigation}
            className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-semibold flex justify-center items-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
          >
            <Navigation size={20} />
            {tr("cellars.startNavigation")}
          </button>
        </div>
      )}
    </div>
  );

  // Tablet/Desktop: side-by-side
  if (!isMobile) {
    return (
      <div className="flex h-full bg-background animate-in fade-in duration-300">
        <div className="flex-1 relative">
          <div className="absolute top-0 left-0 p-4 z-10 pt-safe">
            <Link href="/">
              <button className="w-10 h-10 bg-background/90 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-foreground border border-border">
                <ArrowLeft size={20} />
              </button>
            </Link>
          </div>
          <MapView
            markers={markers}
            routeGeoJson={routeGeoJson}
            initialViewState={{ latitude: 51.936, longitude: 15.506, zoom: 14 }}
          />
        </div>
        <div className="w-[340px] lg:w-[400px] border-l border-border bg-background overflow-y-auto p-5">
          {controlPanel}
        </div>
      </div>
    );
  }

  // Mobile: bottom sheet
  return (
    <div className="flex flex-col h-full bg-background animate-in fade-in duration-300">
      <div className="absolute top-0 left-0 p-4 z-10 pt-safe">
        <Link href="/">
          <button className="w-10 h-10 bg-background/90 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-foreground border border-border">
            <ArrowLeft size={20} />
          </button>
        </Link>
      </div>

      <div className="flex-1 relative">
        <MapView
          markers={markers}
          routeGeoJson={routeGeoJson}
          initialViewState={{ latitude: 51.936, longitude: 15.506, zoom: 14 }}
        />
      </div>

      <div className="bg-background rounded-t-3xl -mt-6 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-5 pb-24 relative">
        <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-5" />
        {controlPanel}
      </div>
    </div>
  );
}
