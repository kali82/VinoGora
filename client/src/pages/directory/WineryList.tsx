import { useMemo } from "react";
import { Search, MapPin, Star, Heart, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import { useLocalized } from "@/hooks/use-localized";
import { Link } from "wouter";
import vineyardStock from "@/assets/images/vineyard-stock.jpg";
import { vineyards } from "@shared/data/vineyards";
import { wines } from "@shared/data/wines";
import { useGameContext } from "@/contexts/GameContext";
import { useState } from "react";

export default function WineryList() {
  const { t: tr } = useTranslation();
  const { t } = useLocalized();
  const [search, setSearch] = useState("");
  const { toggleFavoriteWine, isFavoriteWine } = useGameContext();

  const filteredVineyards = useMemo(() => {
    if (!search.trim()) return vineyards;
    const q = search.toLowerCase();
    return vineyards.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        t(v.location).toLowerCase().includes(q)
    );
  }, [search, t]);

  const filteredWines = useMemo(() => {
    if (!search.trim()) return wines;
    const q = search.toLowerCase();
    return wines.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        w.grape.toLowerCase().includes(q)
    );
  }, [search]);

  const getVineyardName = (vineyardId: string) =>
    vineyards.find((v) => v.id === vineyardId)?.name ?? "";

  return (
    <div className="min-h-full bg-background pb-24">
      <div className="p-5 bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-30 pt-safe-top">
        <h1 className="text-3xl font-display font-bold mb-4">
          {tr("directory.title")}
        </h1>
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-2.5 text-muted-foreground"
          />
          <Input
            placeholder={tr("directory.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-muted/50 border-border rounded-xl"
          />
        </div>
      </div>

      <Tabs defaultValue="wineries" className="px-5 pt-4">
        <TabsList className="w-full bg-muted/30 p-1 rounded-xl">
          <TabsTrigger value="wineries" className="flex-1 rounded-lg text-sm">
            {tr("directory.wineries")}
          </TabsTrigger>
          <TabsTrigger value="wines" className="flex-1 rounded-lg text-sm">
            {tr("directory.wines")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wineries" className="mt-4 space-y-3">
          {filteredVineyards.map((winery) => (
            <Link key={winery.id} href={`/vineyards/${winery.id}`}>
              <div className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border shadow-sm cursor-pointer hover:bg-card/80 transition-colors">
                <img
                  src={vineyardStock}
                  alt={winery.name}
                  className="w-20 h-20 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base font-display truncate">
                    {winery.name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <MapPin size={12} />
                    {t(winery.location)} • {winery.distanceFromCenter}km
                  </div>
                  {winery.rating && (
                    <div className="flex items-center gap-1 mt-2">
                      <Star size={12} className="text-accent fill-accent" />
                      <span className="text-xs font-semibold">
                        {winery.rating}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({winery.reviewCount})
                      </span>
                    </div>
                  )}
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {winery.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-secondary/10 text-secondary text-[10px] px-2 py-0.5 rounded-full font-medium capitalize"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <ChevronRight size={18} className="text-muted-foreground shrink-0" />
              </div>
            </Link>
          ))}
        </TabsContent>

        <TabsContent value="wines" className="mt-4 space-y-3">
          {filteredWines.map((wine) => {
            const fav = isFavoriteWine(wine.id);
            return (
              <div
                key={wine.id}
                className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border shadow-sm"
              >
                <Link href={`/wines/${wine.id}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        wine.type === "red"
                          ? "bg-red-700"
                          : wine.type === "rose"
                            ? "bg-pink-400"
                            : wine.type === "sparkling"
                              ? "bg-amber-300"
                              : "bg-amber-100 border border-amber-300"
                      }`}
                    />
                    <h3 className="font-bold text-sm font-display truncate">
                      {wine.name}
                    </h3>
                    <ChevronRight size={14} className="text-muted-foreground shrink-0" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getVineyardName(wine.vineyardId)} • {wine.grape}
                  </p>
                  {wine.rating && (
                    <div className="flex items-center gap-1 mt-1.5">
                      <Star size={11} className="text-accent fill-accent" />
                      <span className="text-xs font-semibold">
                        {wine.rating}
                      </span>
                    </div>
                  )}
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavoriteWine(wine.id);
                  }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    fav
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Heart size={16} fill={fav ? "currentColor" : "none"} />
                </button>
              </div>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
