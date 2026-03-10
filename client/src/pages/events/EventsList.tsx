import { Link } from "wouter";
import {
  ArrowLeft,
  Clock,
  Calendar,
  MapPin,
  Users,
  Wine,
  Ticket,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocalized } from "@/hooks/use-localized";
import { tastingEvents } from "@shared/data/tastings";
import { vineyards } from "@shared/data/vineyards";

export default function EventsList() {
  const { t: tr } = useTranslation();
  const { t } = useLocalized();

  const sortedEvents = [...tastingEvents].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("pl-PL", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  return (
    <div className="min-h-full bg-background pb-24 animate-in fade-in duration-300">
      <div className="bg-gradient-to-b from-accent/20 to-background px-5 pt-8 pb-8 pt-safe-top">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/">
            <button className="w-10 h-10 bg-card rounded-full flex items-center justify-center text-foreground shadow-sm border border-border">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold">{tr("events.title")}</h1>
            <p className="text-sm text-muted-foreground">{tr("events.subtitle")}</p>
          </div>
        </div>
      </div>

      <div className="px-5 space-y-4 -mt-2">
        {sortedEvents.map((event) => {
          const vineyard = event.vineyardId ? vineyards.find((v) => v.id === event.vineyardId) : null;
          const spotsLeft = event.maxParticipants ? event.maxParticipants - event.currentParticipants : null;
          const isFull = spotsLeft !== null && spotsLeft <= 0;

          return (
            <div
              key={event.id}
              className={`bg-card rounded-2xl border border-border p-5 shadow-sm ${isFull ? "opacity-60" : ""}`}
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center shrink-0">
                  <Wine size={24} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-display font-bold leading-tight">
                    {t(event.title)}
                  </h3>
                  {vineyard && (
                    <Link href={`/vineyards/${vineyard.id}`}>
                      <span className="text-xs text-primary font-medium hover:underline">
                        {vineyard.name}
                      </span>
                    </Link>
                  )}
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {t(event.description)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                  <Calendar size={11} />
                  {formatDate(event.date)}
                </span>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted/50 flex items-center gap-1">
                  <Clock size={11} />
                  {event.startTime} – {event.endTime}
                </span>
                {event.price && (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted/50 flex items-center gap-1">
                    <Ticket size={11} />
                    {event.price} zł
                  </span>
                )}
                {spotsLeft !== null && (
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                    isFull ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" :
                    spotsLeft <= 5 ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" :
                    "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                  }`}>
                    <Users size={11} />
                    {isFull ? tr("events.full") : tr("events.spotsLeft", { count: spotsLeft })}
                  </span>
                )}
              </div>

              {!isFull && (
                <button className="mt-4 w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform">
                  {tr("events.reserve")}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
