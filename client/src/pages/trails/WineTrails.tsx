import { Link } from "wouter";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Route as RouteIcon,
  ChevronRight,
  Mountain,
  Footprints,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocalized } from "@/hooks/use-localized";
import { wineTrails } from "@shared/data/trails";

const difficultyConfig = {
  easy: { label: { pl: "Łatwy", en: "Easy" }, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  medium: { label: { pl: "Średni", en: "Medium" }, color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  hard: { label: { pl: "Trudny", en: "Hard" }, color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

export default function WineTrails() {
  const { t: tr } = useTranslation();
  const { t } = useLocalized();

  return (
    <div className="min-h-full bg-background pb-24 animate-in fade-in duration-300">
      <div className="bg-gradient-to-b from-primary/20 to-background px-5 pt-8 pb-12 pt-safe-top">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/">
            <button className="w-10 h-10 bg-card rounded-full flex items-center justify-center text-foreground shadow-sm border border-border">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold">{tr("trails.title")}</h1>
            <p className="text-sm text-muted-foreground">{tr("trails.subtitle")}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-card/80 backdrop-blur-sm p-4 rounded-2xl border border-border">
          <RouteIcon size={24} className="text-primary shrink-0" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            {tr("trails.intro")}
          </p>
        </div>
      </div>

      <div className="px-5 -mt-4 space-y-4">
        {wineTrails.map((trail) => {
          const diff = difficultyConfig[trail.difficulty];
          return (
            <Link key={trail.id} href={`/trails/${trail.id}`}>
              <div className="bg-card rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-display font-bold leading-tight">
                      {t(trail.name)}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {t(trail.description)}
                    </p>
                  </div>
                  <ChevronRight size={20} className="text-muted-foreground shrink-0 mt-1 ml-2" />
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${diff.color}`}>
                    <Mountain size={11} className="inline mr-1" />
                    {t(diff.label)}
                  </span>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted/50">
                    <Clock size={11} className="inline mr-1" />
                    {Math.round(trail.durationMinutes / 60)}h {trail.durationMinutes % 60 > 0 ? `${trail.durationMinutes % 60}min` : ""}
                  </span>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted/50">
                    <Footprints size={11} className="inline mr-1" />
                    {trail.distanceKm} km
                  </span>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted/50">
                    <MapPin size={11} className="inline mr-1" />
                    {trail.stops.length} {tr("trails.stops")}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-1.5">
                  {trail.stops.map((stop, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${
                        stop.type === "vineyard" ? "bg-green-500" :
                        stop.type === "cellar" ? "bg-amber-500" : "bg-blue-500"
                      }`} />
                      {i < trail.stops.length - 1 && (
                        <div className="w-4 h-px bg-border" />
                      )}
                    </div>
                  ))}
                  <span className="text-[10px] text-muted-foreground ml-2">
                    {trail.stops.map((s) => t(s.name)).join(" → ")}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
