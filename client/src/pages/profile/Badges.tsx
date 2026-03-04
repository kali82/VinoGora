import { useState, useMemo } from "react";
import {
  Award,
  Camera,
  CheckCircle,
  MapPin,
  Star,
  Lock,
  Wine,
  Compass,
  Heart,
  PartyPopper,
  Map,
  LogOut,
  LogIn,
  TrendingUp,
  Grape,
  Clock,
  Trophy,
  ChevronRight,
} from "lucide-react";
import { Link } from "wouter";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "react-i18next";
import { useLocalized } from "@/hooks/use-localized";
import { badges } from "@shared/data/badges";
import { pointActions } from "@shared/data/badges";
import { vineyards } from "@shared/data/vineyards";
import { cellars } from "@shared/data/cellars";
import { useAuthContext } from "@/contexts/AuthContext";
import { useGameContext } from "@/contexts/GameContext";
import LoginModal from "@/components/auth/LoginModal";
import ReceiptUpload from "@/components/checkin/ReceiptUpload";

const iconMap: Record<string, React.ElementType> = {
  wine: Wine,
  compass: Compass,
  award: Award,
  star: Star,
  heart: Heart,
  party: PartyPopper,
  map: Map,
  camera: Camera,
};

const earnIcons = [MapPin, Camera, Star, Wine];

export default function Badges() {
  const { t: tr } = useTranslation();
  const { t } = useLocalized();
  const { user, isAuthenticated, signOut } = useAuthContext();
  const { state, level, pointsToNextLevel, progressPercent } = useGameContext();
  const [showLogin, setShowLogin] = useState(false);

  const displayName = user?.displayName || tr("profile.wineExplorer");
  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const stats = useMemo(() => ({
    vineyardsVisited: state.visitedVineyardIds.length,
    vineyardsTotal: vineyards.length,
    cellarsVisited: state.visitedCellarIds.length,
    cellarsTotal: cellars.length,
    commentsCount: state.comments.length,
    favoritesCount: state.favoriteWineIds.length,
    checkInsCount: state.checkIns.length,
    photosCount: state.checkIns.filter((c) => c.photoUrl).length,
  }), [state]);

  const recentActivity = useMemo(() => {
    const items: Array<{
      id: string;
      type: string;
      label: string;
      time: string;
      points: number;
    }> = [];

    state.checkIns.forEach((c) => {
      const target =
        c.targetType === "vineyard"
          ? vineyards.find((v) => v.id === c.targetId)?.name
          : c.targetType === "cellar"
            ? cellars.find((cl) => cl.id === c.targetId)?.name
            : "Winobranie";
      items.push({
        id: c.id,
        type: "checkin",
        label: target ?? c.targetId,
        time: c.timestamp,
        points: c.targetType === "festival" ? 75 : 50,
      });
    });

    state.comments.forEach((c) => {
      items.push({
        id: c.id,
        type: "comment",
        label: c.targetId,
        time: c.createdAt,
        points: 30,
      });
    });

    return items
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 10);
  }, [state.checkIns, state.comments]);

  const activityIcon = (type: string) => {
    switch (type) {
      case "checkin": return MapPin;
      case "comment": return Star;
      default: return Award;
    }
  };

  return (
    <div className="min-h-full bg-background pb-24">
      <div className="bg-card px-5 pt-8 pb-10 rounded-b-[40px] shadow-sm relative pt-safe-top border-b border-border">
        <div className="flex items-center gap-5">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt=""
              className="w-20 h-20 rounded-full border-2 border-accent object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-accent/30 border-2 border-accent flex items-center justify-center text-2xl font-bold text-primary">
              {initials}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-display font-bold">{displayName}</h1>
            <p className="text-sm text-muted-foreground">
              {tr("profile.wineExplorer")}
            </p>
            <div className="bg-accent/20 text-accent-foreground text-xs font-bold px-3 py-1 rounded-full mt-2 w-fit flex items-center gap-1">
              <Star size={12} className="fill-current" />
              {tr("profile.level", { level })}
            </div>
          </div>
          {isAuthenticated ? (
            <button
              onClick={() => signOut()}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground"
              title={tr("common.logout")}
            >
              <LogOut size={18} />
            </button>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"
              title={tr("common.login")}
            >
              <LogIn size={18} />
            </button>
          )}
        </div>

        <div className="mt-8 bg-background/50 p-4 rounded-2xl">
          <div className="flex justify-between items-end mb-2">
            <div className="text-3xl font-display font-bold text-primary">
              {tr("profile.pts", { pts: state.points })}
            </div>
            <div className="text-xs text-muted-foreground">
              {tr("profile.ptsToLevel", {
                pts: pointsToNextLevel,
                level: level + 1,
              })}
            </div>
          </div>
          <Progress value={progressPercent} className="h-2.5" />
        </div>
      </div>

      {/* Stats */}
      <section className="px-5 mt-6">
        <h2 className="text-xl font-display font-bold mb-3">
          {tr("profile.yourStats")}
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Grape, value: stats.vineyardsVisited, total: stats.vineyardsTotal, label: tr("profile.statVineyards") },
            { icon: Map, value: stats.cellarsVisited, total: stats.cellarsTotal, label: tr("profile.statCellars") },
            { icon: Star, value: stats.commentsCount, label: tr("profile.statReviews") },
            { icon: Heart, value: stats.favoritesCount, label: tr("profile.statFavorites") },
          ].map((s, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border p-3 text-center">
              <s.icon size={18} className="mx-auto text-primary mb-1" />
              <p className="text-lg font-display font-bold">
                {s.value}
                {s.total !== undefined && (
                  <span className="text-xs text-muted-foreground font-normal">/{s.total}</span>
                )}
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Earn Points */}
      <section className="px-5 mt-8">
        <h2 className="text-xl font-display font-bold mb-4">
          {tr("profile.earnPoints")}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {pointActions.slice(0, 4).map((action, i) => {
            const Icon = earnIcons[i] ?? MapPin;
            return (
              <div
                key={action.type}
                className="bg-card p-4 rounded-2xl border border-border text-center space-y-2"
              >
                <Icon size={24} className="mx-auto text-primary" />
                <p className="text-sm font-semibold">{t(action.label)}</p>
                <p className="text-primary font-bold">+{action.points}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Leaderboard link */}
      <section className="px-5 mt-8">
        <Link href="/leaderboard">
          <div className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border shadow-sm cursor-pointer hover:bg-card/80 transition-colors">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
              <Trophy size={22} className="text-accent-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-bold">{tr("leaderboard.viewAll")}</h3>
              <p className="text-xs text-muted-foreground">{tr("leaderboard.title")}</p>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </div>
        </Link>
      </section>

      {/* Receipt Upload */}
      <section className="px-5 mt-8">
        <h2 className="text-xl font-display font-bold mb-4">
          {tr("profile.buyWine")}
        </h2>
        <ReceiptUpload />
      </section>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <section className="px-5 mt-8">
          <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            {tr("profile.recentActivity")}
          </h2>
          <div className="space-y-2">
            {recentActivity.map((item) => {
              const Icon = activityIcon(item.type);
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border"
                >
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(item.time).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-primary shrink-0">
                    +{item.points}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Badges */}
      <section className="px-5 mt-8">
        <h2 className="text-xl font-display font-bold mb-4">
          {tr("profile.yourBadges")}
        </h2>
        <div className="space-y-3">
          {badges.map((badge) => {
            const isUnlocked = state.unlockedBadgeIds.includes(badge.id);
            const Icon = iconMap[badge.icon] || Award;
            return (
              <div
                key={badge.id}
                className={`flex items-center gap-4 p-4 rounded-2xl border ${
                  isUnlocked
                    ? "bg-card border-border"
                    : "bg-muted/20 border-border/50 opacity-60"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isUnlocked
                      ? "bg-accent/30 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon size={22} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm">{t(badge.name)}</h3>
                  <p className="text-xs text-muted-foreground">
                    {t(badge.description)}
                  </p>
                  {isUnlocked ? (
                    <p className="text-xs text-primary mt-1 flex items-center gap-1">
                      <CheckCircle size={10} />
                      {tr("profile.badgeUnlocked")}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1">
                      {t(badge.requirement)}
                    </p>
                  )}
                </div>
                {isUnlocked ? (
                  <CheckCircle size={20} className="text-primary shrink-0" />
                ) : (
                  <Lock size={20} className="text-muted-foreground shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}
