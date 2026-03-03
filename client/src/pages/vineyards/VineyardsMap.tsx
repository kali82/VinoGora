import { useState, useMemo, useCallback } from "react";
import { ArrowLeft, Navigation, ListFilter, Star, X } from "lucide-react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { useLocalized } from "@/hooks/use-localized";
import MapView, { type MapMarker } from "@/components/map/MapView";
import { vineyards } from "@shared/data/vineyards";
import { useIsMobile } from "@/hooks/use-mobile";

export default function VineyardsMap() {
  const { t: tr } = useTranslation();
  const { t } = useLocalized();
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return vineyards;
    const q = search.toLowerCase();
    return vineyards.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        t(v.location).toLowerCase().includes(q) ||
        v.tags.some((tag) => tag.includes(q)),
    );
  }, [search, t]);

  const markers: MapMarker[] = useMemo(
    () =>
      filtered.map((v) => ({
        id: v.id,
        latitude: v.coordinates.lat,
        longitude: v.coordinates.lng,
        label: v.name,
        type: "vineyard" as const,
      })),
    [filtered],
  );

  const selected = useMemo(
    () => vineyards.find((v) => v.id === selectedId),
    [selectedId],
  );

  const handleMarkerClick = useCallback((marker: MapMarker) => {
    setSelectedId(marker.id);
  }, []);

  const openNavigation = useCallback(() => {
    if (!selected) return;
    const { lat, lng } = selected.coordinates;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      "_blank",
    );
  }, [selected]);

  const sidePanel = (
    <div className="flex flex-col h-full bg-background border-l border-border">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-display font-bold mb-3">
          {tr("vineyards.title")}
        </h2>
        <Input
          placeholder={tr("vineyards.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-full h-10 text-sm"
        />
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered.map((v) => (
          <div
            key={v.id}
            onClick={() => setSelectedId(v.id)}
            className={`p-3 rounded-xl border cursor-pointer transition-colors ${
              selectedId === v.id
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:bg-card/80"
            }`}
          >
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-sm font-display">{v.name}</h3>
              {v.rating && (
                <div className="flex items-center gap-1 text-xs shrink-0">
                  <Star size={12} className="text-accent fill-accent" />
                  {v.rating}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t(v.shortDescription)}
            </p>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {v.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full capitalize"
                >
                  {tag}
                </span>
              ))}
            </div>
            {selectedId === v.id && (
              <div className="flex gap-2 mt-3 animate-in slide-in-from-top-1 duration-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openNavigation();
                  }}
                  className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg text-xs font-semibold flex justify-center items-center gap-1"
                >
                  <Navigation size={14} />
                  {tr("vineyards.navigate")}
                </button>
                <Link href={`/vineyards/${v.id}`}>
                  <button className="px-4 py-2 bg-secondary/10 text-secondary rounded-lg text-xs font-semibold">
                    {tr("vineyards.details")}
                  </button>
                </Link>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            {tr("vineyards.noResults")}
          </p>
        )}
      </div>
    </div>
  );

  // Tablet/Desktop: split view
  if (!isMobile) {
    return (
      <div className="flex h-full bg-background animate-in fade-in duration-300">
        <div className="flex-1 relative">
          <MapView
            markers={markers}
            selectedMarkerId={selectedId}
            onMarkerClick={handleMarkerClick}
          />
        </div>
        <div className="w-[340px] lg:w-[400px]">{sidePanel}</div>
      </div>
    );
  }

  // Mobile: map with bottom sheet
  return (
    <div className="flex flex-col h-full bg-background animate-in fade-in duration-300">
      <div className="absolute top-0 left-0 w-full p-4 z-10 flex gap-3 pt-safe">
        <Link href="/">
          <button className="w-10 h-10 bg-background/90 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-foreground shrink-0 border border-border">
            <ArrowLeft size={20} />
          </button>
        </Link>
        <div className="relative flex-1">
          <Input
            placeholder={tr("vineyards.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background/90 backdrop-blur-md border-border shadow-lg rounded-full pl-4 pr-10 h-10 text-sm"
          />
          {search ? (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-2.5 text-muted-foreground"
            >
              <X size={18} />
            </button>
          ) : (
            <ListFilter
              size={18}
              className="absolute right-3 top-2.5 text-muted-foreground"
            />
          )}
        </div>
      </div>

      <div className="flex-1 relative">
        <MapView
          markers={markers}
          selectedMarkerId={selectedId}
          onMarkerClick={handleMarkerClick}
        />
      </div>

      {selected && (
        <div className="bg-background rounded-t-3xl -mt-6 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-5 pb-24 relative animate-in slide-in-from-bottom-4 duration-300">
          <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-5" />
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 mr-3">
              <h2 className="text-2xl font-display font-bold">{selected.name}</h2>
              <p className="text-sm text-muted-foreground">
                {tr("vineyards.kmFromCenter", { km: selected.distanceFromCenter })}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {selected.rating && (
                <div className="flex items-center gap-1 text-sm font-semibold">
                  <Star size={14} className="text-accent fill-accent" />
                  {selected.rating}
                </div>
              )}
              <button
                onClick={() => setSelectedId(null)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {selected.tags.length > 0 && (
            <div className="flex gap-2 mb-3 flex-wrap">
              {selected.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-secondary/10 text-secondary text-xs px-2.5 py-1 rounded-full font-medium capitalize"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <p className="text-sm text-muted-foreground line-clamp-2 mb-5">
            {t(selected.shortDescription)}
          </p>

          <div className="flex gap-3">
            <button
              onClick={openNavigation}
              className="flex-1 bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold flex justify-center items-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
            >
              <Navigation size={18} />
              {tr("vineyards.navigate")}
            </button>
            <Link href={`/vineyards/${selected.id}`}>
              <button className="px-6 py-3.5 bg-secondary/10 text-secondary rounded-xl font-semibold active:scale-[0.98] transition-transform">
                {tr("vineyards.details")}
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
