import { useMemo } from "react";
import { useRoute, Link } from "wouter";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Navigation,
  Calendar,
  Landmark,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocalized } from "@/hooks/use-localized";
import { cellars } from "@shared/data/cellars";
import MapView, { type MapMarker } from "@/components/map/MapView";
import CommentSection from "@/components/comments/CommentSection";
import CheckInButton from "@/components/checkin/CheckInButton";
import SwipeGallery from "@/components/ui/SwipeGallery";
import vineyardStock from "@/assets/images/vineyard-stock.jpg";

export default function CellarDetail() {
  const { t: tr } = useTranslation();
  const { t } = useLocalized();
  const [, params] = useRoute("/cellars/:id");
  const cellar = useMemo(
    () => cellars.find((c) => c.id === params?.id || c.slug === params?.id),
    [params?.id]
  );

  if (!cellar) {
    return (
      <div className="min-h-full flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">{tr("common.error")}</p>
          <Link href="/cellars">
            <button className="mt-4 text-primary font-semibold">
              {tr("common.back")}
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const images = cellar.galleryUrls?.length
    ? cellar.galleryUrls
    : [vineyardStock, vineyardStock, vineyardStock];

  const marker: MapMarker = {
    id: cellar.id,
    latitude: cellar.coordinates.lat,
    longitude: cellar.coordinates.lng,
    label: cellar.name,
    type: "cellar",
  };

  const openNavigation = () => {
    const { lat, lng } = cellar.coordinates;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      "_blank"
    );
  };

  return (
    <div className="min-h-full bg-background pb-24 animate-in fade-in duration-300">
      <SwipeGallery images={images} alt={cellar.name}>
        <Link href="/cellars">
          <button className="absolute top-4 left-4 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white z-10">
            <ArrowLeft size={20} />
          </button>
        </Link>
      </SwipeGallery>

      {/* Content */}
      <div className="px-5 -mt-6 relative z-10">
        <div className="bg-card rounded-3xl p-5 shadow-xl border border-border">
          <h1 className="text-2xl font-display font-bold">{cellar.name}</h1>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
            <MapPin size={14} />
            {t(cellar.location)}
          </div>

          <div className="flex gap-2 mt-3 flex-wrap">
            {cellar.yearBuilt && (
              <span className="bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                <Calendar size={12} />
                {cellar.yearBuilt}
              </span>
            )}
            <span className="bg-secondary/10 text-secondary text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
              <Clock size={12} />
              ~{cellar.visitDurationMinutes} min
            </span>
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
            {t(cellar.description)}
          </p>
        </section>

        {/* Historical Significance */}
        <section>
          <h2 className="text-lg font-display font-bold mb-2 flex items-center gap-2">
            <Landmark size={18} />
            {tr("detail.history")}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t(cellar.historicalSignificance)}
          </p>
        </section>

        {/* Info */}
        <section className="space-y-3">
          {cellar.openingHours && (
            <div className="flex items-start gap-3">
              <Clock size={18} className="text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold">{tr("detail.hours")}</p>
                <p className="text-sm text-muted-foreground">
                  {t(cellar.openingHours)}
                </p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-3">
            <MapPin size={18} className="text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold">{tr("detail.address")}</p>
              <p className="text-sm text-muted-foreground">{cellar.address}</p>
            </div>
          </div>
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
            targetType="cellar"
            targetId={cellar.id}
            targetCoordinates={cellar.coordinates}
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
              selectedMarkerId={cellar.id}
              initialViewState={{
                latitude: cellar.coordinates.lat,
                longitude: cellar.coordinates.lng,
                zoom: 15,
              }}
            />
          </div>
        </section>

        {/* Comments */}
        <CommentSection targetType="cellar" targetId={cellar.id} />
      </div>
    </div>
  );
}
