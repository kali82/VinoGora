import { useMemo } from "react";
import { useRoute, Link } from "wouter";
import {
  ArrowLeft,
  Star,
  StarHalf,
  Heart,
  Wine,
  Grape,
  Droplets,
  Calendar,
  Award,
  UtensilsCrossed,
  Scroll,
  ExternalLink,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocalized } from "@/hooks/use-localized";
import { vineyards } from "@shared/data/vineyards";
import { useWine } from "@/hooks/useApiData";
import CommentSection from "@/components/comments/CommentSection";
import { useGameContext } from "@/contexts/GameContext";
import { useRating } from "@/hooks/useRating";

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(
        <Star key={i} size={size} className="text-accent fill-accent" />
      );
    } else if (i - 0.5 <= rating) {
      stars.push(
        <StarHalf key={i} size={size} className="text-accent fill-accent" />
      );
    } else {
      stars.push(
        <Star key={i} size={size} className="text-muted-foreground/30" />
      );
    }
  }
  return <div className="flex gap-0.5">{stars}</div>;
}

const wineTypeConfig = {
  red: {
    bg: "bg-red-700",
    text: "text-red-700",
    bgLight: "bg-red-50 dark:bg-red-950/30",
    gradient: "from-red-900/90 via-red-800/60 to-red-900/90",
    label: { pl: "Czerwone", en: "Red" },
  },
  white: {
    bg: "bg-amber-100 border border-amber-300",
    text: "text-amber-700",
    bgLight: "bg-amber-50 dark:bg-amber-950/30",
    gradient: "from-amber-800/90 via-amber-700/60 to-amber-800/90",
    label: { pl: "Białe", en: "White" },
  },
  rose: {
    bg: "bg-pink-400",
    text: "text-pink-500",
    bgLight: "bg-pink-50 dark:bg-pink-950/30",
    gradient: "from-pink-800/90 via-pink-700/60 to-pink-800/90",
    label: { pl: "Różowe", en: "Rosé" },
  },
  sparkling: {
    bg: "bg-amber-300",
    text: "text-amber-500",
    bgLight: "bg-amber-50 dark:bg-amber-950/30",
    gradient: "from-amber-700/90 via-amber-600/60 to-amber-700/90",
    label: { pl: "Musujące", en: "Sparkling" },
  },
};

export default function WineDetail() {
  const { t: tr } = useTranslation();
  const { t } = useLocalized();
  const [, params] = useRoute("/wines/:id");
  const { toggleFavoriteWine, isFavoriteWine } = useGameContext();

  const { data: wine } = useWine(params?.id);

  const vineyard = useMemo(
    () => (wine ? vineyards.find((v) => v.id === wine.vineyardId) : undefined),
    [wine]
  );

  if (!wine) {
    return (
      <div className="min-h-full flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">{tr("common.error")}</p>
          <Link href="/directory">
            <button className="mt-4 text-primary font-semibold">
              {tr("common.back")}
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const config = wineTypeConfig[wine.type];
  const fav = isFavoriteWine(wine.id);
  const dynamicRating = useRating("wine", wine.id, wine.rating, wine.reviewCount);

  return (
    <div className="min-h-full bg-background pb-24 animate-in fade-in duration-300">
      {/* Hero header */}
      <div
        className={`relative h-64 bg-gradient-to-b ${config.gradient} flex items-end`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,rgba(0,0,0,0.3)_100%)]" />

        <Link href="/directory">
          <button className="absolute top-4 left-4 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white z-10">
            <ArrowLeft size={20} />
          </button>
        </Link>

        <button
          onClick={() => toggleFavoriteWine(wine.id)}
          className={`absolute top-4 right-4 w-10 h-10 backdrop-blur-md rounded-full flex items-center justify-center z-10 transition-colors ${
            fav ? "bg-primary text-primary-foreground" : "bg-black/40 text-white"
          }`}
        >
          <Heart size={20} fill={fav ? "currentColor" : "none"} />
        </button>

        <div className="relative z-10 flex items-end gap-5 px-5 pb-6 w-full">
          <div className="w-20 h-28 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 flex items-center justify-center shrink-0 overflow-hidden">
            {wine.imageUrl ? (
              <img src={wine.imageUrl} alt={wine.name} className="w-full h-full object-cover" />
            ) : (
              <Wine size={36} className="text-white/80" />
            )}
          </div>
          <div className="flex-1 min-w-0 pb-1">
            <span
              className={`text-xs font-semibold uppercase tracking-wider text-white/70`}
            >
              {t(config.label)}
            </span>
            <h1 className="text-2xl font-display font-bold text-white leading-tight truncate">
              {wine.name}
            </h1>
            {vineyard && (
              <Link href={`/vineyards/${vineyard.id}`}>
                <span className="text-sm text-white/80 hover:text-white transition-colors flex items-center gap-1 mt-0.5">
                  {vineyard.name}
                  <ExternalLink size={12} />
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Content card */}
      <div className="px-5 -mt-4 relative z-10">
        <div className="bg-card rounded-3xl p-5 shadow-xl border border-border">
          {/* Rating + Quick stats */}
          <div className="flex items-center justify-between">
            {(dynamicRating.average > 0 || wine.rating) && (
              <div className="flex items-center gap-2.5">
                <StarRating rating={dynamicRating.average || wine.rating || 0} />
                <span className="text-lg font-bold">
                  {dynamicRating.average || wine.rating}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({dynamicRating.count || wine.reviewCount || 0} {tr("wine.reviews")})
                </span>
              </div>
            )}
          </div>

          {/* Quick info pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full text-xs font-medium">
              <Grape size={13} className="text-primary" />
              {wine.grape}
            </div>
            {wine.year && (
              <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full text-xs font-medium">
                <Calendar size={13} className="text-primary" />
                {wine.year}
              </div>
            )}
            {wine.abv && (
              <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full text-xs font-medium">
                <Droplets size={13} className="text-primary" />
                {wine.abv}% vol
              </div>
            )}
            {wine.volume && (
              <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full text-xs font-medium">
                <Wine size={13} className="text-primary" />
                {wine.volume} ml
              </div>
            )}
          </div>

          {/* Price */}
          {wine.price && (
            <div className="mt-4 flex items-center justify-between bg-primary/5 px-4 py-3 rounded-2xl">
              <span className="text-sm font-medium text-muted-foreground">
                {tr("wine.priceRange")}
              </span>
              <span className="text-lg font-bold text-primary">
                {wine.price.min}–{wine.price.max} zł
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 mt-5 space-y-6">
        {/* Description */}
        <section>
          <h2 className="text-lg font-display font-bold mb-2">
            {tr("detail.about")}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t(wine.description)}
          </p>
        </section>

        {/* Tasting Notes */}
        {wine.tastingNotes && (
          <section>
            <h2 className="text-lg font-display font-bold mb-3 flex items-center gap-2">
              <Scroll size={18} />
              {tr("wine.tastingNotes")}
            </h2>
            <div className={`${config.bgLight} rounded-2xl p-4 border border-border`}>
              <p className="text-sm leading-relaxed">
                {t(wine.tastingNotes)}
              </p>
            </div>
          </section>
        )}

        {/* Food Pairing */}
        {wine.foodPairing && (
          <section>
            <h2 className="text-lg font-display font-bold mb-3 flex items-center gap-2">
              <UtensilsCrossed size={18} />
              {tr("wine.foodPairing")}
            </h2>
            <div className="bg-card rounded-2xl p-4 border border-border">
              <div className="flex flex-wrap gap-2">
                {t(wine.foodPairing)
                  .split(",")
                  .map((item, i) => (
                    <span
                      key={i}
                      className="bg-secondary/10 text-secondary text-xs px-3 py-1.5 rounded-full font-medium"
                    >
                      {item.trim()}
                    </span>
                  ))}
              </div>
            </div>
          </section>
        )}

        {/* Awards */}
        {wine.awards && wine.awards.length > 0 && (
          <section>
            <h2 className="text-lg font-display font-bold mb-3 flex items-center gap-2">
              <Award size={18} />
              {tr("wine.awards")}
            </h2>
            <div className="space-y-2">
              {wine.awards.map((award, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-accent/10 rounded-2xl px-4 py-3 border border-accent/20"
                >
                  <Award size={16} className="text-accent shrink-0" />
                  <span className="text-sm font-medium">{t(award)}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Vineyard link */}
        {vineyard && (
          <section>
            <h2 className="text-lg font-display font-bold mb-3">
              {tr("wine.fromVineyard")}
            </h2>
            <Link href={`/vineyards/${vineyard.id}`}>
              <div className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border shadow-sm cursor-pointer hover:bg-card/80 transition-colors">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Grape size={24} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base font-display">
                    {vineyard.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t(vineyard.location)}
                  </p>
                  {vineyard.rating && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={11} className="text-accent fill-accent" />
                      <span className="text-xs font-semibold">
                        {vineyard.rating}
                      </span>
                    </div>
                  )}
                </div>
                <ExternalLink
                  size={16}
                  className="text-muted-foreground shrink-0"
                />
              </div>
            </Link>
          </section>
        )}

        {/* Favorite CTA */}
        <button
          onClick={() => toggleFavoriteWine(wine.id)}
          className={`w-full py-3.5 rounded-xl font-semibold flex justify-center items-center gap-2 shadow-lg transition-all active:scale-[0.98] ${
            fav
              ? "bg-primary text-primary-foreground shadow-primary/20"
              : "bg-muted text-foreground border border-border"
          }`}
        >
          <Heart size={18} fill={fav ? "currentColor" : "none"} />
          {fav ? tr("wine.removeFromFavorites") : tr("wine.addToFavorites")}
        </button>

        {/* Reviews / Comments */}
        <CommentSection targetType="wine" targetId={wine.id} />
      </div>
    </div>
  );
}
