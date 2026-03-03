import { useMemo } from "react";
import { useRoute, Link } from "wouter";
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  Phone,
  Globe,
  Navigation,
  Heart,
  Wine,
  Leaf,
  ChevronRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocalized } from "@/hooks/use-localized";
import { vineyards } from "@shared/data/vineyards";
import { wines as allWines } from "@shared/data/wines";
import MapView, { type MapMarker } from "@/components/map/MapView";
import CommentSection from "@/components/comments/CommentSection";
import CheckInButton from "@/components/checkin/CheckInButton";
import SwipeGallery from "@/components/ui/SwipeGallery";
import { useGameContext } from "@/contexts/GameContext";
import vineyardStock from "@/assets/images/vineyard-stock.jpg";

export default function VineyardDetail() {
  const { t: tr } = useTranslation();
  const { t } = useLocalized();
  const [, params] = useRoute("/vineyards/:id");
  const { toggleFavoriteWine, isFavoriteWine } = useGameContext();

  const vineyard = useMemo(
    () => vineyards.find((v) => v.id === params?.id || v.slug === params?.id),
    [params?.id]
  );

  const vineyardWines = useMemo(
    () =>
      vineyard
        ? allWines.filter((w) => vineyard.wines.includes(w.id))
        : [],
    [vineyard]
  );

  if (!vineyard) {
    return (
      <div className="min-h-full flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">{tr("common.error")}</p>
          <Link href="/vineyards">
            <button className="mt-4 text-primary font-semibold">
              {tr("common.back")}
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const images = vineyard.galleryUrls?.length
    ? vineyard.galleryUrls
    : [vineyardStock, vineyardStock, vineyardStock];

  const marker: MapMarker = {
    id: vineyard.id,
    latitude: vineyard.coordinates.lat,
    longitude: vineyard.coordinates.lng,
    label: vineyard.name,
    type: "vineyard",
  };

  const openNavigation = () => {
    const { lat, lng } = vineyard.coordinates;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      "_blank"
    );
  };

  const wineTypeColor = (type: string) => {
    switch (type) {
      case "red":
        return "bg-red-700";
      case "rose":
        return "bg-pink-400";
      case "sparkling":
        return "bg-amber-300";
      default:
        return "bg-amber-100 border border-amber-300";
    }
  };

  return (
    <div className="min-h-full bg-background pb-24 animate-in fade-in duration-300">
      <SwipeGallery images={images} alt={vineyard.name}>
        <Link href="/vineyards">
          <button className="absolute top-4 left-4 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white z-10">
            <ArrowLeft size={20} />
          </button>
        </Link>
      </SwipeGallery>

      {/* Content */}
      <div className="px-5 -mt-6 relative z-10">
        <div className="bg-card rounded-3xl p-5 shadow-xl border border-border">
          <div className="flex justify-between items-start mb-1">
            <div className="flex-1 mr-3">
              <h1 className="text-2xl font-display font-bold">
                {vineyard.name}
              </h1>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                <MapPin size={14} />
                {t(vineyard.location)}
                {vineyard.distanceFromCenter && (
                  <span>
                    • {tr("vineyards.kmFromCenter", { km: vineyard.distanceFromCenter })}
                  </span>
                )}
              </div>
            </div>
            {vineyard.rating && (
              <div className="flex items-center gap-1 bg-accent/30 px-3 py-1.5 rounded-full shrink-0">
                <Star size={14} className="text-accent fill-accent" />
                <span className="text-sm font-bold">{vineyard.rating}</span>
                <span className="text-xs text-muted-foreground">
                  ({vineyard.reviewCount})
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-3 flex-wrap">
            {vineyard.organic && (
              <span className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                <Leaf size={12} />
                Organic
              </span>
            )}
            {vineyard.tags.map((tag) => (
              <span
                key={tag}
                className="bg-secondary/10 text-secondary text-xs px-2.5 py-1 rounded-full font-medium capitalize"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 mt-5 space-y-6">
        {/* Description */}
        <section>
          <h2 className="text-lg font-display font-bold mb-2">
            {tr("detail.about")}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t(vineyard.description)}
          </p>
        </section>

        {/* Info */}
        <section className="space-y-3">
          {vineyard.openingHours && (
            <div className="flex items-start gap-3">
              <Clock size={18} className="text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold">{tr("detail.hours")}</p>
                <p className="text-sm text-muted-foreground">
                  {t(vineyard.openingHours)}
                </p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-3">
            <MapPin size={18} className="text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold">{tr("detail.address")}</p>
              <p className="text-sm text-muted-foreground">
                {vineyard.address}
              </p>
            </div>
          </div>
          {vineyard.phone && (
            <div className="flex items-start gap-3">
              <Phone size={18} className="text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold">{tr("detail.phone")}</p>
                <a
                  href={`tel:${vineyard.phone}`}
                  className="text-sm text-primary"
                >
                  {vineyard.phone}
                </a>
              </div>
            </div>
          )}
          {vineyard.website && (
            <div className="flex items-start gap-3">
              <Globe size={18} className="text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold">{tr("detail.website")}</p>
                <a
                  href={vineyard.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary truncate block max-w-[250px]"
                >
                  {vineyard.website}
                </a>
              </div>
            </div>
          )}
        </section>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={openNavigation}
            className="flex-1 bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold flex justify-center items-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
          >
            <Navigation size={18} />
            {tr("vineyards.navigate")}
          </button>
          <CheckInButton
            targetType="vineyard"
            targetId={vineyard.id}
            targetCoordinates={vineyard.coordinates}
          />
        </div>

        {/* Mini Map */}
        <section>
          <h2 className="text-lg font-display font-bold mb-3">
            {tr("detail.location")}
          </h2>
          <div className="h-48 rounded-2xl overflow-hidden border border-border">
            <MapView
              markers={[marker]}
              selectedMarkerId={vineyard.id}
              initialViewState={{
                latitude: vineyard.coordinates.lat,
                longitude: vineyard.coordinates.lng,
                zoom: 13,
              }}
            />
          </div>
        </section>

        {/* Wines */}
        {vineyardWines.length > 0 && (
          <section>
            <h2 className="text-lg font-display font-bold mb-3 flex items-center gap-2">
              <Wine size={20} />
              {tr("detail.wines")} ({vineyardWines.length})
            </h2>
            <div className="space-y-3">
              {vineyardWines.map((wine) => {
                const fav = isFavoriteWine(wine.id);
                return (
                  <div
                    key={wine.id}
                    className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border"
                  >
                    <Link href={`/wines/${wine.id}`} className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full shrink-0 ${wineTypeColor(wine.type)}`}
                        />
                        <h3 className="font-bold text-sm font-display truncate">
                          {wine.name}
                        </h3>
                        <ChevronRight size={14} className="text-muted-foreground shrink-0" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {wine.grape}
                        {wine.year ? ` • ${wine.year}` : ""}
                      </p>
                      {wine.rating && (
                        <div className="flex items-center gap-1 mt-1.5">
                          <Star
                            size={11}
                            className="text-accent fill-accent"
                          />
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
            </div>
          </section>
        )}

        {/* Comments */}
        <CommentSection targetType="vineyard" targetId={vineyard.id} />
      </div>
    </div>
  );
}
