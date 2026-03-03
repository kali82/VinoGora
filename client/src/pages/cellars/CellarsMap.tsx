import { useState } from "react";
import { ArrowLeft, Clock, MapPin, Route as RouteIcon } from "lucide-react";
import { Link } from "wouter";
import { Slider } from "@/components/ui/slider";
import mapCellars from "@/assets/images/map-cellars.png";
import cellarStock from "@/assets/images/cellar-stock.jpg";

export default function CellarsMap() {
  const [hours, setHours] = useState([3]);
  const [routePlanned, setRoutePlanned] = useState(false);

  return (
    <div className="flex flex-col h-full bg-background animate-in slide-in-from-right-4 duration-300">
      <div className="absolute top-0 left-0 w-full p-4 z-20 flex gap-3 mt-safe">
        <Link href="/">
          <button className="w-10 h-10 bg-background/90 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-foreground shrink-0 border border-border">
            <ArrowLeft size={20} />
          </button>
        </Link>
      </div>

      <div className="flex-1 relative bg-accent/10">
        <img 
          src={mapCellars} 
          alt="Map of cellars" 
          className={`w-full h-full object-cover transition-all duration-700 ${routePlanned ? 'opacity-100 scale-105' : 'opacity-60 grayscale-[0.5]'}`}
        />
        
        {!routePlanned && (
          <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] z-10"></div>
        )}
      </div>

      <div className="bg-background rounded-t-3xl -mt-6 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-5 pb-8 relative">
        <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-6"></div>
        
        {!routePlanned ? (
          <div className="space-y-6 animate-in fade-in">
            <div className="space-y-2">
              <h2 className="text-2xl font-display font-bold">Plan Your Route</h2>
              <p className="text-sm text-muted-foreground">Discover historic wine cellars based on your available time.</p>
            </div>
            
            <div className="space-y-6 p-5 bg-card border border-border rounded-2xl shadow-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-primary font-medium">
                  <Clock size={18} />
                  <span>Available Time</span>
                </div>
                <span className="text-2xl font-display font-bold">{hours[0]} <span className="text-sm font-normal text-muted-foreground">hours</span></span>
              </div>
              
              <Slider
                defaultValue={[3]}
                max={8}
                min={1}
                step={1}
                value={hours}
                onValueChange={setHours}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground font-medium px-1">
                <span>1h</span>
                <span>4h</span>
                <span>8h</span>
              </div>
            </div>
            
            <button 
              onClick={() => setRoutePlanned(true)}
              className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold flex justify-center items-center gap-2 shadow-xl shadow-primary/20 text-lg hover:scale-[1.02] transition-transform"
            >
              <RouteIcon size={20} />
              Generate Route
            </button>
          </div>
        ) : (
          <div className="space-y-5 animate-in slide-in-from-bottom-8 duration-500">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-display font-bold text-primary">Your {hours[0]}-Hour Route</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin size={14} /> 3 Cellars • 2.4 km total walking
                </p>
              </div>
              <button 
                onClick={() => setRoutePlanned(false)}
                className="text-xs bg-muted text-muted-foreground px-3 py-1.5 rounded-full font-medium"
              >
                Reset
              </button>
            </div>
            
            <div className="space-y-4 max-h-[35vh] overflow-y-auto pr-2 pb-4 scrollbar-hide">
              {[
                { name: "Piwnica Winiarska", time: "45 min", type: "Tasting & Tour" },
                { name: "Złoty Zakat", time: "60 min", type: "Premium Tasting" },
                { name: "Stara Winiarnia", time: "30 min", type: "Quick Visit" }
              ].map((cellar, i) => (
                <div key={i} className="flex gap-4 items-center bg-card p-3 rounded-2xl border border-border shadow-sm">
                  <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden relative">
                    <img src={cellarStock} alt={cellar.name} className="w-full h-full object-cover" />
                    <div className="absolute top-0 left-0 w-full h-full bg-black/20 flex items-center justify-center">
                      <span className="text-white font-display font-bold text-lg">{i+1}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold font-display">{cellar.name}</h4>
                    <p className="text-xs text-muted-foreground">{cellar.type}</p>
                  </div>
                  <div className="text-xs font-medium bg-secondary/10 text-secondary px-2 py-1 rounded-md whitespace-nowrap">
                    {cellar.time}
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg shadow-primary/20">
              Start Navigation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}