import { useState } from "react";
import { Search, MapPin, Award, Plus, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import vineyardStock from "@/assets/images/vineyard-stock.jpg";

export default function WineryList() {
  const [addedWines, setAddedWines] = useState<Record<string, boolean>>({});

  const toggleWine = (id: string) => {
    setAddedWines(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-full bg-background pb-24">
      <div className="p-5 bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-30 pt-safe-top">
        <h1 className="text-2xl font-display font-bold mb-4">Directory</h1>
        <div className="relative">
          <Input 
            placeholder="Search wineries or wines..." 
            className="w-full bg-muted/50 border-transparent rounded-full pl-11 h-12 shadow-inner"
          />
          <Search size={20} className="absolute left-4 top-3.5 text-muted-foreground" />
        </div>
      </div>

      <div className="p-5">
        <Tabs defaultValue="wineries" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-muted/50 rounded-full h-12">
            <TabsTrigger value="wineries" className="rounded-full text-sm font-semibold">Wineries</TabsTrigger>
            <TabsTrigger value="wines" className="rounded-full text-sm font-semibold">Wines</TabsTrigger>
          </TabsList>
          
          <TabsContent value="wineries" className="space-y-4 animate-in fade-in">
            {[
              { name: "Winnica Miłosz", loc: "Łaz", dist: "12km", tags: ["Organic", "Tour"] },
              { name: "Winnica Julia", loc: "Stary Kisielin", dist: "8km", tags: ["Tasting", "Shop"] },
              { name: "Winnica Cantina", loc: "Mozów", dist: "15km", tags: ["Restaurant", "Tour"] },
              { name: "Winnica Equus", loc: "Zabór", dist: "20km", tags: ["Historic", "Shop"] },
            ].map((winery, i) => (
              <div key={i} className="flex gap-4 bg-card p-3 rounded-2xl border border-border shadow-sm">
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={vineyardStock} alt={winery.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 py-1">
                  <h3 className="font-bold font-display text-lg">{winery.name}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin size={12} /> {winery.loc} • {winery.dist}
                  </p>
                  <div className="flex gap-2 mt-2">
                    {winery.tags.map((tag, j) => (
                      <span key={j} className="text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-md font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="wines" className="space-y-4 animate-in fade-in">
            {[
              { id: "w1", name: "Riesling 2024", winery: "Winnica Miłosz", type: "White", award: true },
              { id: "w2", name: "Pinot Noir", winery: "Winnica Julia", type: "White", award: false },
              { id: "w3", name: "Rondo Reserve", winery: "Winnica Cantina", type: "Red", award: true },
              { id: "w4", name: "Zweigelt", winery: "Winnica Equus", type: "Red", award: false },
            ].map((wine) => (
              <div key={wine.id} className="flex items-center justify-between bg-card p-4 rounded-2xl border border-border shadow-sm">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-12 rounded-full ${wine.type === 'Red' ? 'bg-primary' : 'bg-accent'}`}></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold font-display">{wine.name}</h3>
                      {wine.award && <Award size={14} className="text-amber-500" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{wine.winery}</p>
                  </div>
                </div>
                <button 
                  onClick={() => toggleWine(wine.id)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${addedWines[wine.id] ? 'bg-secondary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                >
                  {addedWines[wine.id] ? <Check size={18} /> : <Plus size={18} />}
                </button>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}