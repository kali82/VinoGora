import { useState } from "react";
import { ArrowLeft, Navigation, ListFilter, Star } from "lucide-react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import mapVineyards from "@/assets/images/map-vineyards.png";

export default function VineyardsMap() {
  return (
    <div className="flex flex-col h-full bg-background animate-in slide-in-from-right-4 duration-300">
      <div className="absolute top-0 left-0 w-full p-4 z-10 flex gap-3 mt-safe">
        <Link href="/">
          <button className="w-10 h-10 bg-background/90 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-foreground shrink-0 border border-border">
            <ArrowLeft size={20} />
          </button>
        </Link>
        <div className="relative flex-1">
          <Input 
            placeholder="Search vineyards..." 
            className="w-full bg-background/90 backdrop-blur-md border-border shadow-lg rounded-full pl-4 pr-10 h-10 text-sm"
          />
          <ListFilter size={18} className="absolute right-3 top-2.5 text-muted-foreground" />
        </div>
      </div>

      <div className="flex-1 relative bg-accent/20">
        <img 
          src={mapVineyards} 
          alt="Map of vineyards" 
          className="w-full h-full object-cover opacity-90"
        />
        
        {/* Mock Map Markers */}
        <div className="absolute top-1/3 left-1/4 animate-bounce hover:scale-110 transition-transform cursor-pointer">
          <div className="bg-primary text-primary-foreground p-2 rounded-full shadow-xl shadow-primary/30 relative">
            <Star size={16} fill="currentColor" />
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rotate-45"></div>
          </div>
        </div>
        
        <div className="absolute top-1/2 left-2/3 hover:scale-110 transition-transform cursor-pointer">
          <div className="bg-secondary text-secondary-foreground p-2 rounded-full shadow-xl shadow-secondary/30 relative">
            <Star size={16} />
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-secondary rotate-45"></div>
          </div>
        </div>
      </div>

      <div className="bg-background rounded-t-3xl -mt-6 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-5 pb-8 relative">
        <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-5"></div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-display font-bold">Winnica Miłosz</h2>
            <p className="text-sm text-muted-foreground">12 km from current location</p>
          </div>
          <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-bold">
            Open
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-5">
          One of the oldest vineyards in the region, featuring traditional Polish grape varieties and a beautiful tasting room overlooking the valley.
        </p>
        
        <div className="flex gap-3">
          <button className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-semibold flex justify-center items-center gap-2 shadow-lg shadow-primary/20">
            <Navigation size={18} />
            Navigate
          </button>
          <Link href="/directory">
            <button className="px-6 py-3 bg-secondary/10 text-secondary rounded-xl font-semibold">
              Details
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}