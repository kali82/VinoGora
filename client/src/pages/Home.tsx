import { Link } from "wouter";
import { MapPin, Route as RouteIcon, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import festivalHero from "@/assets/images/festival-hero.png";
import vineyardStock from "@/assets/images/vineyard-stock.jpg";

export default function Home() {
  return (
    <div className="p-4 space-y-8 animate-in fade-in duration-500 pb-8">
      <header className="pt-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary" data-testid="heading-app-name">VinoGóra</h1>
          <p className="text-sm font-medium text-muted-foreground">Zielona Góra Wine Explorer</p>
        </div>
        <Link href="/profile">
          <div className="w-12 h-12 bg-accent/30 border-2 border-accent rounded-full flex flex-col items-center justify-center text-primary shadow-sm cursor-pointer hover:bg-accent/50 transition-colors">
            <span className="text-xs font-bold leading-tight">320</span>
            <span className="text-[8px] font-bold uppercase tracking-wider opacity-70">Pts</span>
          </div>
        </Link>
      </header>

      <section>
        <Link href="/festival">
          <Card className="overflow-hidden border-0 shadow-xl shadow-primary/5 cursor-pointer hover:shadow-2xl transition-all rounded-3xl relative group">
            <div className="relative h-56">
              <img src={festivalHero} alt="Wine Harvest Festival" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <div className="bg-primary/90 text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full w-fit mb-3 backdrop-blur-sm shadow-lg">
                  Upcoming Event
                </div>
                <h2 className="text-2xl font-display font-bold mb-1">Green Góra Festival</h2>
                <p className="text-sm opacity-90 font-light">Discover the magic of the annual wine harvest celebration.</p>
              </div>
            </div>
          </Card>
        </Link>
      </section>

      <section className="grid grid-cols-2 gap-4">
        <Link href="/vineyards">
          <Card className="cursor-pointer border border-border shadow-md bg-card/60 backdrop-blur-sm hover:bg-card transition-colors rounded-2xl h-full">
            <CardContent className="p-5 flex flex-col items-center text-center space-y-4 h-full justify-center">
              <div className="p-4 bg-secondary/10 rounded-2xl text-secondary">
                <MapPin size={32} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-semibold text-base font-display">Vineyards</h3>
                <p className="text-xs text-muted-foreground mt-1">Explore local estates</p>
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
                <h3 className="font-semibold text-base font-display">Cellar Route</h3>
                <p className="text-xs text-muted-foreground mt-1">Plan tasting route</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </section>

      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <h2 className="text-xl font-display font-bold">Featured Wineries</h2>
          <Link href="/directory">
            <span className="text-sm text-primary font-semibold cursor-pointer">See all</span>
          </Link>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4 snap-x">
          {[
            { name: "Winnica Miłosz", location: "Łaz, 12km", medals: 4 },
            { name: "Winnica Julia", location: "Stary Kisielin, 8km", medals: 2 },
            { name: "Winnica Cantina", location: "Mozów, 15km", medals: 5 }
          ].map((winery, i) => (
            <Card key={i} className="min-w-[220px] max-w-[220px] border border-border shadow-md shrink-0 overflow-hidden rounded-2xl snap-center">
              <div className="h-32 overflow-hidden relative">
                <img src={vineyardStock} alt="Vineyard" className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-md p-1.5 rounded-full">
                  <Award size={16} className="text-accent" />
                </div>
              </div>
              <CardContent className="p-4">
                <h4 className="font-bold text-base font-display truncate">{winery.name}</h4>
                <p className="text-xs text-muted-foreground mb-3">{winery.location}</p>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/5 p-2 rounded-lg w-fit">
                  <Award size={14} /> {winery.medals} Awards
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}