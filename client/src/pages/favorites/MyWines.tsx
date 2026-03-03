import { Wine, Award, Star, StarHalf } from "lucide-react";
import { Link } from "wouter";

export default function MyWines() {
  return (
    <div className="min-h-full bg-background pb-24">
      <div className="p-5 pt-safe-top">
        <h1 className="text-3xl font-display font-bold mb-2">My List</h1>
        <p className="text-muted-foreground text-sm">Wines you've tasted and loved</p>
      </div>

      <div className="px-5 space-y-4">
        {[
          { name: "Riesling 2024", winery: "Winnica Miłosz", rating: 5, notes: "Crisp, fruity notes of green apple. Perfect for summer." },
          { name: "Rondo Reserve", winery: "Winnica Cantina", rating: 4.5, notes: "Deep ruby color, strong cherry aroma. Bought 2 bottles." },
        ].map((wine, i) => (
          <div key={i} className="bg-card p-5 rounded-3xl border border-border shadow-md">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold font-display text-xl">{wine.name}</h3>
                <p className="text-sm text-primary font-medium">{wine.winery}</p>
              </div>
              <div className="bg-accent/30 p-2 rounded-xl text-amber-600 flex gap-0.5">
                <Star size={14} fill="currentColor" />
                <Star size={14} fill="currentColor" />
                <Star size={14} fill="currentColor" />
                <Star size={14} fill="currentColor" />
                {wine.rating === 5 ? <Star size={14} fill="currentColor" /> : <StarHalf size={14} fill="currentColor" />}
              </div>
            </div>
            
            <div className="bg-muted/30 p-3 rounded-xl text-sm text-muted-foreground italic border-l-2 border-border">
              "{wine.notes}"
            </div>
            
            <div className="mt-4 flex gap-2">
              <button className="text-xs font-semibold px-4 py-2 bg-background border border-border rounded-full hover:bg-muted transition-colors">
                Edit Notes
              </button>
            </div>
          </div>
        ))}

        <Link href="/directory">
          <div className="border-2 border-dashed border-border rounded-3xl p-8 flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:bg-muted/20 hover:border-primary/50 transition-colors group">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <Wine size={24} />
            </div>
            <p className="font-medium">Add more wines</p>
            <p className="text-xs mt-1">Browse directory to add favorites</p>
          </div>
        </Link>
      </div>
    </div>
  );
}