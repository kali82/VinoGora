import { useState, useMemo } from "react";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Music,
  Wine,
  Ticket,
  Clock,
  Filter,
} from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useLocalized } from "@/hooks/use-localized";
import festivalHero from "@/assets/images/festival-hero.png";
import { festivals } from "@shared/data/festivals";
import CheckInButton from "@/components/checkin/CheckInButton";
import MapView, { type MapMarker } from "@/components/map/MapView";

const CATEGORY_COLORS: Record<string, string> = {
  concert: "bg-primary/10 text-primary",
  tasting: "bg-secondary/10 text-secondary",
  workshop: "bg-blue-100 text-blue-700",
  parade: "bg-accent/30 text-accent-foreground",
  other: "bg-muted text-muted-foreground",
};

export default function FestivalInfo() {
  const { t: tr } = useTranslation();
  const { t } = useLocalized();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [showMap, setShowMap] = useState(false);

  const festival = festivals[0];

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(festival.events.map((e) => e.category)))],
    [festival.events],
  );

  const filteredEvents = useMemo(
    () =>
      activeFilter === "all"
        ? festival.events
        : festival.events.filter((e) => e.category === activeFilter),
    [activeFilter, festival.events],
  );

  const eventMarkers: MapMarker[] = useMemo(
    () =>
      festival.events
        .filter((e) => e.coordinates)
        .map((e) => ({
          id: e.id,
          latitude: e.coordinates!.lat,
          longitude: e.coordinates!.lng,
          label: t(e.name),
          type: "cellar" as const,
        })),
    [festival.events, t],
  );

  return (
    <div className="min-h-full bg-background animate-in fade-in duration-300 pb-24">
      <div className="relative h-72">
        <img
          src={festivalHero}
          alt={t(festival.name)}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <Link href="/">
          <button className="absolute top-4 left-4 w-10 h-10 bg-background/80 backdrop-blur-md rounded-full shadow-md flex items-center justify-center text-foreground border border-border mt-safe">
            <ArrowLeft size={20} />
          </button>
        </Link>
        <div className="absolute bottom-6 left-5 right-5">
          <div className="bg-primary text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full w-fit mb-3 shadow-lg">
            {tr("festival.annualEvent")}
          </div>
          <h1 className="text-4xl font-display font-extrabold text-foreground mb-2 leading-tight">
            {tr("home.festivalTitle")}
          </h1>
          <p className="text-muted-foreground font-medium">
            Winobranie 2026
          </p>
        </div>
      </div>

      <div className="px-5 -mt-2 space-y-6">
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-card px-4 py-2.5 rounded-xl border border-border text-sm">
            <Calendar size={16} className="text-primary" />
            <span className="font-medium">
              {festival.startDate.slice(5)} – {festival.endDate.slice(5)}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-card px-4 py-2.5 rounded-xl border border-border text-sm">
            <MapPin size={16} className="text-primary" />
            <span className="font-medium">{t(festival.location)}</span>
          </div>
        </div>

        {/* Check-in */}
        <div className="flex gap-3 items-center">
          <CheckInButton
            targetType="festival"
            targetId={festival.id}
            targetCoordinates={festival.coordinates}
            radiusMeters={500}
            showQR={false}
          />
        </div>

        <section>
          <h2 className="text-xl font-display font-bold mb-3">
            {tr("festival.aboutTitle")}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t(festival.description)}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-display font-bold mb-4">
            {tr("festival.highlights")}
          </h2>
          <div className="space-y-3">
            {[
              {
                icon: Wine,
                title: tr("festival.wineTown"),
                desc: tr("festival.wineTownDesc"),
                color: "bg-primary/10 text-primary",
              },
              {
                icon: Music,
                title: tr("festival.concerts"),
                desc: tr("festival.concertsDesc"),
                color: "bg-secondary/10 text-secondary",
              },
              {
                icon: MapPin,
                title: tr("festival.busTours"),
                desc: tr("festival.busToursDesc"),
                color: "bg-accent/30 text-accent-foreground",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 bg-card rounded-2xl border border-border"
              >
                <div className={`p-3 rounded-xl shrink-0 ${item.color}`}>
                  <item.icon size={22} />
                </div>
                <div>
                  <h3 className="font-semibold font-display">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Event Map */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-display font-bold">
              {tr("detail.location")}
            </h2>
            <button
              onClick={() => setShowMap(!showMap)}
              className="text-sm text-primary font-semibold"
            >
              {showMap ? tr("common.close") : tr("festival.showMap")}
            </button>
          </div>
          {showMap && (
            <div className="h-56 rounded-2xl overflow-hidden border border-border mb-4 animate-in slide-in-from-top-2 duration-300">
              <MapView
                markers={eventMarkers}
                initialViewState={{
                  latitude: festival.coordinates.lat,
                  longitude: festival.coordinates.lng,
                  zoom: 14,
                }}
              />
            </div>
          )}
        </section>

        {/* Program with filters */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Filter size={18} className="text-muted-foreground" />
            <h2 className="text-xl font-display font-bold">
              {tr("festival.program")}
            </h2>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`whitespace-nowrap text-xs font-bold px-4 py-2 rounded-full transition-colors shrink-0 ${
                  activeFilter === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground"
                }`}
              >
                {cat === "all"
                  ? tr("festival.allEvents")
                  : tr(`festival.${cat}`)}
              </button>
            ))}
          </div>

          <div className="space-y-3 mt-4">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="p-4 bg-card rounded-2xl border border-border"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                      CATEGORY_COLORS[event.category] ?? CATEGORY_COLORS.other
                    }`}
                  >
                    {tr(`festival.${event.category}`)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {event.date.slice(5)}
                  </span>
                </div>
                <h3 className="font-semibold font-display text-sm">
                  {t(event.name)}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {t(event.description)}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {event.startTime} – {event.endTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={12} />
                    {t(event.location)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <a
          href="https://winobranie.zgora.pl"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-semibold flex justify-center items-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
        >
          <Ticket size={20} />
          {tr("festival.getTastingPass")}
        </a>
      </div>
    </div>
  );
}
