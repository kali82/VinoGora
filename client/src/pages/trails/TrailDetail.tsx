import { Link, useRoute } from "wouter";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Footprints,
  Mountain,
  Grape,
  Warehouse,
  Navigation,
  CheckCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocalized } from "@/hooks/use-localized";
import { wineTrails } from "@shared/data/trails";
import { useGameContext } from "@/contexts/GameContext";

const difficultyConfig = {
  easy: { label: { pl: "Łatwy", en: "Easy" }, color: "text-green-600 dark:text-green-400" },
  medium: { label: { pl: "Średni", en: "Medium" }, color: "text-amber-600 dark:text-amber-400" },
  hard: { label: { pl: "Trudny", en: "Hard" }, color: "text-red-600 dark:text-red-400" },
};

export default function TrailDetail() {
  const { t: tr } = useTranslation();
  const { t } = useLocalized();
  const [, params] = useRoute("/trails/:id");
  const { state } = useGameContext();

  const trail = wineTrails.find((t) => t.id === params?.id);

  if (!trail) {
    return (
      <div className="min-h-full flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">{tr("common.error")}</p>
          <Link href="/trails">
            <button className="mt-4 text-primary font-semibold">{tr("common.back")}</button>
          </Link>
        </div>
      </div>
    );
  }

  const diff = difficultyConfig[trail.difficulty];

  const isStopVisited = (stop: typeof trail.stops[0]) => {
    if (stop.type === "vineyard") return state.visitedVineyardIds.includes(stop.targetId);
    if (stop.type === "cellar") return state.visitedCellarIds.includes(stop.targetId);
    return false;
  };

  const visitedCount = trail.stops.filter(isStopVisited).length;
  const progressPercent = (visitedCount / trail.stops.length) * 100;

  return (
    <div className="min-h-full bg-background pb-24 animate-in fade-in duration-300">
      <div className="bg-gradient-to-b from-primary/20 to-background px-5 pt-8 pb-8 pt-safe-top">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/trails">
            <button className="w-10 h-10 bg-card rounded-full flex items-center justify-center text-foreground shadow-sm border border-border">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <h1 className="text-xl font-display font-bold flex-1">{t(trail.name)}</h1>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-5">
          {t(trail.description)}
        </p>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl p-3 text-center border border-border">
            <Clock size={18} className="mx-auto text-primary mb-1" />
            <p className="text-sm font-bold">{Math.round(trail.durationMinutes / 60)}h {trail.durationMinutes % 60 > 0 ? `${trail.durationMinutes % 60}m` : ""}</p>
            <p className="text-[10px] text-muted-foreground">{tr("trails.duration")}</p>
          </div>
          <div className="bg-card rounded-xl p-3 text-center border border-border">
            <Footprints size={18} className="mx-auto text-primary mb-1" />
            <p className="text-sm font-bold">{trail.distanceKm} km</p>
            <p className="text-[10px] text-muted-foreground">{tr("trails.distance")}</p>
          </div>
          <div className="bg-card rounded-xl p-3 text-center border border-border">
            <Mountain size={18} className={`mx-auto mb-1 ${diff.color}`} />
            <p className="text-sm font-bold">{t(diff.label)}</p>
            <p className="text-[10px] text-muted-foreground">{tr("trails.difficulty")}</p>
          </div>
        </div>

        {visitedCount > 0 && (
          <div className="mt-4 bg-card rounded-xl p-3 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold">{tr("trails.progress")}</span>
              <span className="text-xs text-muted-foreground">{visitedCount}/{trail.stops.length}</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        )}
      </div>

      <div className="px-5 space-y-1">
        <h2 className="text-lg font-display font-bold mb-4">{tr("trails.stopsTitle")}</h2>
        {trail.stops.map((stop, idx) => {
          const visited = isStopVisited(stop);
          const StopIcon = stop.type === "vineyard" ? Grape : stop.type === "cellar" ? Warehouse : MapPin;
          const detailUrl = stop.type === "vineyard" ? `/vineyards/${stop.targetId}` : stop.type === "cellar" ? `/cellars/${stop.targetId}` : null;

          return (
            <div key={idx} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 ${
                  visited ? "bg-primary/20 border-primary text-primary" : "bg-card border-border text-muted-foreground"
                }`}>
                  {visited ? <CheckCircle size={18} /> : <StopIcon size={18} />}
                </div>
                {idx < trail.stops.length - 1 && (
                  <div className="w-0.5 flex-1 bg-border my-1 min-h-[20px]" />
                )}
              </div>

              <div className="flex-1 pb-5">
                <div className={`bg-card rounded-2xl p-4 border ${visited ? "border-primary/30" : "border-border"}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                          #{stop.order}
                        </span>
                        <h3 className="font-bold text-sm">{t(stop.name)}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {t(stop.description)}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock size={10} /> ~{stop.durationMinutes} min
                        </span>
                      </div>
                    </div>
                  </div>

                  {detailUrl && (
                    <Link href={detailUrl}>
                      <button className="mt-3 w-full py-2 text-xs font-semibold text-primary bg-primary/5 rounded-xl hover:bg-primary/10 transition-colors flex items-center justify-center gap-1">
                        <Navigation size={12} />
                        {tr("trails.viewDetails")}
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
