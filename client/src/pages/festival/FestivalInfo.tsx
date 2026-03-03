import { ArrowLeft, Calendar, MapPin, Music, Wine, Ticket } from "lucide-react";
import { Link } from "wouter";
import festivalHero from "@/assets/images/festival-hero.png";

export default function FestivalInfo() {
  return (
    <div className="min-h-full bg-background animate-in fade-in duration-300 pb-24">
      <div className="relative h-72">
        <img src={festivalHero} alt="Green Góra Festival" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-black/40" />
        
        <div className="absolute top-0 left-0 w-full p-4 z-10 flex gap-3 mt-safe">
          <Link href="/">
            <button className="w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white shrink-0 border border-white/20">
              <ArrowLeft size={20} />
            </button>
          </Link>
        </div>

        <div className="absolute bottom-6 left-5 right-5">
          <div className="bg-primary text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full w-fit mb-3 shadow-lg">
            Annual Event
          </div>
          <h1 className="text-4xl font-display font-extrabold text-foreground mb-2 leading-tight">
            Green Góra<br/>Festival
          </h1>
          <p className="text-muted-foreground font-medium">Winobranie 2026</p>
        </div>
      </div>

      <div className="px-5 space-y-8 -mt-2 relative z-10">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <div className="bg-card border border-border px-4 py-3 rounded-2xl flex-shrink-0 flex items-center gap-3 shadow-sm min-w-[140px]">
            <div className="bg-primary/10 p-2 rounded-full text-primary">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Date</p>
              <p className="text-sm font-semibold">Sep 5 - 13</p>
            </div>
          </div>
          <div className="bg-card border border-border px-4 py-3 rounded-2xl flex-shrink-0 flex items-center gap-3 shadow-sm min-w-[140px]">
            <div className="bg-secondary/10 p-2 rounded-full text-secondary">
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Location</p>
              <p className="text-sm font-semibold">City Center</p>
            </div>
          </div>
        </div>

        <section>
          <h2 className="text-xl font-display font-bold mb-4">About the Festival</h2>
          <p className="text-muted-foreground leading-relaxed text-sm">
            The Zielona Góra Wine Fest (Winobranie) is the biggest wine festival in Poland. The city turns into a large stage with concerts, outdoor markets, and most importantly, wine tasting from over 40 local vineyards in the special Wine Town around the Town Hall.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-display font-bold mb-4">Highlights</h2>
          <div className="space-y-3">
            {[
              { icon: Wine, title: "Wine Town", desc: "Taste wines from 40+ local vineyards at the main square." },
              { icon: Music, title: "Live Concerts", desc: "Free performances every evening at the main stage." },
              { icon: Ticket, title: "Wine Bus Tours", desc: "Special buses taking you directly to surrounding vineyards." }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-4 bg-card rounded-2xl border border-border shadow-sm">
                <div className="bg-accent/30 p-3 rounded-xl h-fit text-foreground">
                  <item.icon size={22} />
                </div>
                <div>
                  <h3 className="font-bold font-display">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <button className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/20">
          Get Tasting Pass
        </button>
      </div>
    </div>
  );
}