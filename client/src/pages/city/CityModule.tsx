import { Link } from "wouter";
import {
  ArrowLeft,
  Grape,
  Landmark,
  MapPin,
  CalendarDays,
  Users,
  ChevronRight,
  Star,
  History,
  Wine,
  Route as RouteIcon,
  Trophy,
  Globe,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function CityModule() {
  const { t: tr } = useTranslation();

  const highlights = [
    {
      icon: History,
      title: tr("city.history"),
      desc: tr("city.historyDesc"),
    },
    {
      icon: Grape,
      title: tr("city.vineyards"),
      desc: tr("city.vineyardsDesc"),
    },
    {
      icon: Landmark,
      title: tr("city.cellars"),
      desc: tr("city.cellarsDesc"),
    },
    {
      icon: CalendarDays,
      title: tr("city.winobranie"),
      desc: tr("city.winobranieDesc"),
    },
  ];

  const quickLinks = [
    { icon: MapPin, label: tr("city.exploreVineyards"), href: "/vineyards" },
    { icon: RouteIcon, label: tr("city.wineTrails"), href: "/trails" },
    { icon: Wine, label: tr("city.tastings"), href: "/events" },
    { icon: Trophy, label: tr("city.festival"), href: "/festival" },
  ];

  return (
    <div className="min-h-full bg-background pb-24 animate-in fade-in duration-300">
      {/* Hero */}
      <div className="relative h-64 bg-gradient-to-b from-green-900/90 via-green-800/70 to-green-900/90 flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,rgba(0,0,0,0.3)_100%)]" />

        <Link href="/">
          <button className="absolute top-4 left-4 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white z-10">
            <ArrowLeft size={20} />
          </button>
        </Link>

        <div className="relative z-10 px-5 pb-6 w-full">
          <div className="bg-green-500/80 text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full w-fit mb-3 backdrop-blur-sm text-white">
            {tr("city.partner")}
          </div>
          <h1 className="text-3xl font-display font-bold text-white leading-tight">
            {tr("city.title")}
          </h1>
          <p className="text-sm text-white/80 mt-1">{tr("city.subtitle")}</p>
        </div>
      </div>

      {/* About card */}
      <div className="px-5 -mt-4 relative z-10">
        <div className="bg-card rounded-3xl p-5 shadow-xl border border-border">
          <div className="flex items-center gap-2 mb-3">
            <Globe size={18} className="text-primary" />
            <h2 className="text-lg font-display font-bold">{tr("city.aboutTitle")}</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {tr("city.aboutText")}
          </p>
        </div>
      </div>

      <div className="px-5 mt-6 space-y-6">
        {/* Highlights */}
        <section>
          <h2 className="text-xl font-display font-bold mb-4">
            {tr("city.highlights")}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {highlights.map((h, i) => (
              <div key={i} className="bg-card rounded-2xl p-4 border border-border">
                <h.icon size={24} className="text-primary mb-2" />
                <h3 className="text-sm font-display font-bold">{h.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {h.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats preview */}
        <section>
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-5 border border-border">
            <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
              <Star size={18} className="text-primary" />
              {tr("city.inNumbers")}
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-2xl font-display font-bold text-primary">6</p>
                <p className="text-[10px] text-muted-foreground">{tr("city.statVineyards")}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-display font-bold text-primary">6</p>
                <p className="text-[10px] text-muted-foreground">{tr("city.statCellars")}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-display font-bold text-primary">800+</p>
                <p className="text-[10px] text-muted-foreground">{tr("city.statYears")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick links */}
        <section>
          <h2 className="text-xl font-display font-bold mb-4">
            {tr("city.explore")}
          </h2>
          <div className="space-y-2">
            {quickLinks.map((link, i) => (
              <Link key={i} href={link.href}>
                <div className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border cursor-pointer hover:bg-card/80 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <link.icon size={18} className="text-primary" />
                  </div>
                  <span className="flex-1 text-sm font-semibold">{link.label}</span>
                  <ChevronRight size={16} className="text-muted-foreground shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-4">
          <div className="bg-card rounded-2xl p-6 border border-border">
            <Users size={28} className="mx-auto text-primary mb-3" />
            <h3 className="text-lg font-display font-bold">{tr("city.ctaTitle")}</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">{tr("city.ctaText")}</p>
            <Link href="/vineyards">
              <button className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform">
                {tr("city.ctaButton")}
              </button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
