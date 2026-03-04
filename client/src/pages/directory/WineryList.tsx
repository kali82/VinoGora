import { useMemo, useState } from "react";
import {
  Search,
  MapPin,
  Star,
  Heart,
  ChevronRight,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import { useLocalized } from "@/hooks/use-localized";
import { Link } from "wouter";
import vineyardStock from "@/assets/images/vineyard-stock.jpg";
import { vineyards } from "@shared/data/vineyards";
import { wines } from "@shared/data/wines";
import { useGameContext } from "@/contexts/GameContext";

type WineType = "all" | "red" | "white" | "rose" | "sparkling";
type SortKey = "name" | "rating" | "price";

const wineTypeColors: Record<string, string> = {
  red: "bg-red-700",
  rose: "bg-pink-400",
  sparkling: "bg-amber-300",
  white: "bg-amber-100 border border-amber-300",
};

export default function WineryList() {
  const { t: tr } = useTranslation();
  const { t } = useLocalized();
  const [search, setSearch] = useState("");
  const { toggleFavoriteWine, isFavoriteWine } = useGameContext();

  const [showFilters, setShowFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState<WineType>("all");
  const [organicOnly, setOrganicOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>("name");

  const hasActiveFilters = typeFilter !== "all" || organicOnly || sortBy !== "name";

  const filteredVineyards = useMemo(() => {
    let result = vineyards;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          t(v.location).toLowerCase().includes(q)
      );
    }
    if (organicOnly) {
      result = result.filter((v) => v.organic);
    }
    if (sortBy === "rating") {
      result = [...result].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    }
    return result;
  }, [search, t, organicOnly, sortBy]);

  const filteredWines = useMemo(() => {
    let result = [...wines];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.grape.toLowerCase().includes(q)
      );
    }
    if (typeFilter !== "all") {
      result = result.filter((w) => w.type === typeFilter);
    }
    if (sortBy === "rating") {
      result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else if (sortBy === "price") {
      result.sort((a, b) => (a.price?.min ?? 0) - (b.price?.min ?? 0));
    } else {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }
    return result;
  }, [search, typeFilter, sortBy]);

  const getVineyardName = (vineyardId: string) =>
    vineyards.find((v) => v.id === vineyardId)?.name ?? "";

  const resetFilters = () => {
    setTypeFilter("all");
    setOrganicOnly(false);
    setSortBy("name");
    setShowFilters(false);
  };

  const wineTypes: { key: WineType; label: string }[] = [
    { key: "all", label: tr("filters.all") },
    { key: "red", label: tr("filters.red") },
    { key: "white", label: tr("filters.white") },
    { key: "rose", label: tr("filters.rose") },
    { key: "sparkling", label: tr("filters.sparkling") },
  ];

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "name", label: tr("filters.sortName") },
    { key: "rating", label: tr("filters.sortRating") },
    { key: "price", label: tr("filters.sortPrice") },
  ];

  return (
    <div className="min-h-full bg-background pb-24">
      <div className="p-5 bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-30 pt-safe-top">
        <h1 className="text-3xl font-display font-bold mb-4">
          {tr("directory.title")}
        </h1>
        <div className="flex gap-2">
          <div className="relative flex-1">
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
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 transition-colors ${
              hasActiveFilters
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-muted-foreground"
            }`}
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>

        {showFilters && (
          <div className="mt-3 bg-card rounded-2xl border border-border p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-sm">{tr("filters.title")}</h3>
              <button onClick={() => setShowFilters(false)}>
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">{tr("filters.wineType")}</p>
              <div className="flex flex-wrap gap-1.5">
                {wineTypes.map((wt) => (
                  <button
                    key={wt.key}
                    onClick={() => setTypeFilter(wt.key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      typeFilter === wt.key
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    {wt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">{tr("filters.sortBy")}</p>
              <div className="flex flex-wrap gap-1.5">
                {sortOptions.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setSortBy(s.key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      sortBy === s.key
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={organicOnly}
                onChange={(e) => setOrganicOnly(e.target.checked)}
                className="rounded border-border"
              />
              <span className="text-xs font-medium">{tr("filters.organic")}</span>
            </label>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="w-full text-sm text-destructive font-semibold py-2"
              >
                {tr("filters.reset")}
              </button>
            )}
          </div>
        )}
      </div>

      <Tabs defaultValue="wineries" className="px-5 pt-4">
        <TabsList className="w-full bg-muted/30 p-1 rounded-xl">
          <TabsTrigger value="wineries" className="flex-1 rounded-lg text-sm">
            {tr("directory.wineries")}
          </TabsTrigger>
          <TabsTrigger value="wines" className="flex-1 rounded-lg text-sm">
            {tr("directory.wines")}
            {hasActiveFilters && (
              <span className="ml-1.5 w-2 h-2 bg-primary rounded-full inline-block" />
            )}
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
          <p className="text-xs text-muted-foreground">
            {tr("filters.results", { count: filteredWines.length })}
          </p>
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
                      className={`w-3 h-3 rounded-full ${wineTypeColors[wine.type] ?? wineTypeColors.white}`}
                    />
                    <h3 className="font-bold text-sm font-display truncate">
                      {wine.name}
                    </h3>
                    <ChevronRight size={14} className="text-muted-foreground shrink-0" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getVineyardName(wine.vineyardId)} • {wine.grape}
                    {wine.price && (
                      <span className="text-primary font-medium">
                        {" "}• {wine.price.min}–{wine.price.max} zł
                      </span>
                    )}
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
