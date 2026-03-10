import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  Users,
  Star,
  MessageSquare,
  MapPin,
  TrendingUp,
  Wine,
  BarChart3,
  Eye,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { VineyardStats } from "@shared/types";
import { vineyards } from "@shared/data/vineyards";

export default function WineryDashboard() {
  const { t: tr } = useTranslation();
  const [selectedVineyard, setSelectedVineyard] = useState(vineyards[0]?.id ?? "");
  const [stats, setStats] = useState<VineyardStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedVineyard) return;
    setLoading(true);
    fetch(`/api/winery/stats/${selectedVineyard}`)
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [selectedVineyard]);

  const vineyard = vineyards.find((v) => v.id === selectedVineyard);

  return (
    <div className="min-h-full bg-background pb-24 animate-in fade-in duration-300">
      <div className="bg-gradient-to-b from-primary/20 to-background px-5 pt-8 pb-8 pt-safe-top">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/">
            <button className="w-10 h-10 bg-card rounded-full flex items-center justify-center text-foreground shadow-sm border border-border">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold">{tr("winery.dashboardTitle")}</h1>
            <p className="text-sm text-muted-foreground">{tr("winery.dashboardSubtitle")}</p>
          </div>
        </div>

        <select
          value={selectedVineyard}
          onChange={(e) => setSelectedVineyard(e.target.value)}
          className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm font-medium appearance-none"
        >
          {vineyards.map((v) => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="px-5 mt-4 text-center text-muted-foreground">{tr("common.loading")}</div>
      )}

      {stats && !loading && (
        <div className="px-5 space-y-6 -mt-2">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card rounded-2xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={16} className="text-primary" />
                <span className="text-xs text-muted-foreground">{tr("winery.totalCheckins")}</span>
              </div>
              <p className="text-2xl font-display font-bold">{stats.totalCheckIns}</p>
            </div>
            <div className="bg-card rounded-2xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Users size={16} className="text-primary" />
                <span className="text-xs text-muted-foreground">{tr("winery.uniqueVisitors")}</span>
              </div>
              <p className="text-2xl font-display font-bold">{stats.uniqueVisitors}</p>
            </div>
            <div className="bg-card rounded-2xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Star size={16} className="text-accent" />
                <span className="text-xs text-muted-foreground">{tr("winery.avgRating")}</span>
              </div>
              <p className="text-2xl font-display font-bold">
                {stats.averageRating > 0 ? stats.averageRating : "—"}
                {stats.averageRating > 0 && <span className="text-sm font-normal text-muted-foreground"> /5</span>}
              </p>
            </div>
            <div className="bg-card rounded-2xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare size={16} className="text-primary" />
                <span className="text-xs text-muted-foreground">{tr("winery.totalComments")}</span>
              </div>
              <p className="text-2xl font-display font-bold">{stats.totalComments}</p>
            </div>
          </div>

          {/* Wine rankings */}
          {stats.popularWines.length > 0 && (
            <section>
              <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
                <Wine size={18} />
                {tr("winery.wineRankings")}
              </h2>
              <div className="space-y-2">
                {stats.popularWines.map((wine, idx) => (
                  <Link key={wine.wineId} href={`/wines/${wine.wineId}`}>
                    <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border cursor-pointer hover:bg-card/80 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        #{idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{wine.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {wine.reviewCount} {tr("wine.reviews")}
                        </p>
                      </div>
                      {wine.rating > 0 && (
                        <div className="flex items-center gap-1 shrink-0">
                          <Star size={12} className="text-accent fill-accent" />
                          <span className="text-sm font-bold">{wine.rating}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Info banner */}
          <section>
            <div className="bg-primary/5 rounded-2xl p-5 border border-primary/20">
              <div className="flex items-start gap-3">
                <BarChart3 size={24} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-display font-bold text-sm">{tr("winery.moreFeatures")}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {tr("winery.moreFeaturesDesc")}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
