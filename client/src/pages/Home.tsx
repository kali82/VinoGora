import { useMemo } from "react";
import { Link } from "wouter";
import {
  MapPin,
  Route as RouteIcon,
  Award,
  Grape,
  Map,
  Star,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "react-i18next";
import { useLocalized } from "@/hooks/use-localized";
import festivalHero from "@/assets/images/festival-hero.png";
import vineyardStock from "@/assets/images/vineyard-stock.jpg";
import { vineyards } from "@shared/data/vineyards";
import { cellars } from "@shared/data/cellars";
import { useGameContext } from "@/contexts/GameContext";
import { useAuthContext } from "@/contexts/AuthContext";

export default function Home() {
  const { t: tr } = useTranslation();
  const { t } = useLocalized();
  const { state, level, progressPercent } = useGameContext();
  const { isAuthenticated } = useAuthContext();

  const featured = vineyards.slice(0, 3);

  const hasProgress =
    state.visitedVineyardIds.length > 0 ||
    state.visitedCellarIds.length > 0 ||
    state.points > 0;

  const nextToVisit = useMemo(() => {
    return vineyards.find((v) => !state.visitedVineyardIds.includes(v.id));
  }, [state.visitedVineyardIds]);

  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-500 pb-8 pt-safe">
      <header className="pt-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary">
            {tr("app.name")}
          </h1>
          <p className="text-sm font-medium text-muted-foreground">
            {tr("app.subtitle")}
          </p>
        </div>
        <Link href="/profile">
          <div className="w-12 h-12 bg-accent/30 border-2 border-accent rounded-full flex flex-col items-center justify-center text-primary shadow-sm cursor-pointer hover:bg-accent/50 transition-colors">
            <span className="text-xs font-bold leading-tight">{state.points}</span>
            <span className="text-[8px] font-bold uppercase tracking-wider opacity-70">
              {tr("home.pts")}
            </span>
          </div>
        </Link>
      </header>

      {/* User progress card */}
      {(isAuthenticated || hasProgress) && (
        <section>
          <Card className="border border-border rounded-2xl bg-card/60 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-primary" />
                  <span className="text-sm font-display font-bold">
                    {tr("profile.level", { level })}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {state.points} {tr("home.pts").toLowerCase()}
                </span>
              </div>
              <Progress value={progressPercent} className="h-2 mb-4" />

              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Grape size={14} className="text-primary" />
                    <span className="text-lg font-display font-bold">
                      {state.visitedVineyardIds.length}
                    </span>
                    <span className="text-xs text-muted-foreground">/{vineyards.length}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{tr("home.vineyardsVisited")}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Map size={14} className="text-primary" />
                    <span className="text-lg font-display font-bold">
                      {state.visitedCellarIds.length}
                    </span>
                    <span className="text-xs text-muted-foreground">/{cellars.length}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{tr("home.cellarsVisited")}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Star size={14} className="text-primary" />
                    <span className="text-lg font-display font-bold">
                      {state.unlockedBadgeIds.length}
                    </span>
                    <span className="text-xs text-muted-foreground">/8</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{tr("home.badgesEarned")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Festival banner */}
      <section>
        <Link href="/festival">
          <Card className="overflow-hidden border-0 shadow-xl shadow-primary/5 cursor-pointer hover:shadow-2xl transition-all rounded-3xl relative group">
            <div className="relative h-52">
              <img
                src={festivalHero}
                alt="Wine Harvest Festival"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <div className="bg-primary/90 text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full w-fit mb-3 backdrop-blur-sm shadow-lg">
                  {tr("home.upcomingEvent")}
                </div>
                <h2 className="text-2xl font-display font-bold mb-1">
                  {tr("home.festivalTitle")}
                </h2>
                <p className="text-sm opacity-90 font-light">
                  {tr("home.festivalSubtitle")}
                </p>
              </div>
            </div>
          </Card>
        </Link>
      </section>

      {/* Quick actions */}
      <section className="grid grid-cols-2 gap-4">
        <Link href="/vineyards">
          <Card className="cursor-pointer border border-border shadow-md bg-card/60 backdrop-blur-sm hover:bg-card transition-colors rounded-2xl h-full">
            <CardContent className="p-5 flex flex-col items-center text-center space-y-4 h-full justify-center">
              <div className="p-4 bg-secondary/10 rounded-2xl text-secondary">
                <MapPin size={32} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-semibold text-base font-display">
                  {tr("home.vineyards")}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {tr("home.vineyardsDesc")}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/cellars">
          <Card className="cursor-pointer border border-border shadow-md bg-card/60 backdrop-blur-sm hover:bg-card transition-colors rounded-2xl h-full">
            <CardContent className="p-5 flex flex-col items-center text-center space-y-4 h-full justify-center">
              <div className="p-4 bg-primary/10 rounded-2xl text-primary">
                <RouteIcon size={32} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-semibold text-base font-display">
                  {tr("home.cellarRoute")}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {tr("home.cellarRouteDesc")}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </section>

      {/* Next to visit suggestion */}
      {nextToVisit && state.visitedVineyardIds.length > 0 && (
        <section>
          <h2 className="text-lg font-display font-bold mb-3">
            {tr("home.continueExploring")}
          </h2>
          <Link href={`/vineyards/${nextToVisit.id}`}>
            <Card className="border border-border rounded-2xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 p-4">
                <img
                  src={vineyardStock}
                  alt={nextToVisit.name}
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-sm">{nextToVisit.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t(nextToVisit.shortDescription)}
                  </p>
                  <p className="text-xs text-primary font-medium mt-1">
                    {nextToVisit.distanceFromCenter} km {tr("home.fromCenter")}
                  </p>
                </div>
                <ChevronRight size={20} className="text-muted-foreground shrink-0" />
              </div>
            </Card>
          </Link>
        </section>
      )}

      {/* Featured wineries */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <h2 className="text-xl font-display font-bold">
            {tr("home.featuredWineries")}
          </h2>
          <Link href="/directory">
            <span className="text-sm text-primary font-semibold cursor-pointer">
              {tr("home.seeAll")}
            </span>
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4 snap-x">
          {featured.map((winery) => {
            const visited = state.visitedVineyardIds.includes(winery.id);
            return (
              <Link key={winery.id} href={`/vineyards/${winery.id}`}>
                <Card className="min-w-[220px] max-w-[220px] border border-border shadow-md shrink-0 overflow-hidden rounded-2xl snap-center cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="h-32 overflow-hidden relative">
                    <img
                      src={vineyardStock}
                      alt={winery.name}
                      className="w-full h-full object-cover"
                    />
                    {visited && (
                      <div className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        ✓ {tr("detail.checkedIn")}
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-md p-1.5 rounded-full">
                      <Award size={16} className="text-accent" />
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-bold text-base font-display truncate">
                      {winery.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      {t(winery.location)}, {winery.distanceFromCenter}km
                    </p>
                    {winery.rating && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/5 p-2 rounded-lg w-fit">
                        <Award size={14} /> {winery.rating} / 5
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
