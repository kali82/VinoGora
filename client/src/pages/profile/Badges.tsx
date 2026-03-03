import { Award, Camera, CheckCircle, MapPin, Share2, Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Badges() {
  return (
    <div className="min-h-full bg-background pb-24">
      <div className="bg-card px-5 pt-8 pb-10 rounded-b-[40px] shadow-sm relative pt-safe-top border-b border-border">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center text-3xl font-display font-bold text-primary shadow-inner border-4 border-background">
            JS
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-display font-bold">Jan Kowalski</h1>
            <p className="text-muted-foreground text-sm mb-2">Wine Explorer</p>
            <div className="flex gap-2">
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Star size={12} fill="currentColor" /> Level 3
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-background/50 p-4 rounded-2xl">
          <div className="flex justify-between items-end mb-2">
            <div className="text-3xl font-display font-bold text-primary">
              320 <span className="text-sm font-medium text-muted-foreground">pts</span>
            </div>
            <div className="text-xs font-medium text-muted-foreground">
              80 pts to Level 4
            </div>
          </div>
          <Progress value={80} className="h-2.5 bg-muted" indicatorClassName="bg-primary" />
        </div>
      </div>

      <div className="p-5 mt-4 space-y-8">
        <section>
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-xl font-display font-bold">Earn Points</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: MapPin, title: "Visit Cellar", pts: "+50" },
              { icon: Camera, title: "Add Photo", pts: "+20" },
              { icon: Star, title: "Leave Review", pts: "+30" },
              { icon: Award, title: "Buy Wine", pts: "+100" },
            ].map((action, i) => (
              <div key={i} className="bg-card p-4 rounded-2xl border border-border shadow-sm flex flex-col items-center text-center gap-2">
                <div className="bg-secondary/10 text-secondary p-2 rounded-full">
                  <action.icon size={20} />
                </div>
                <div>
                  <div className="text-xs font-semibold">{action.title}</div>
                  <div className="text-sm font-bold text-primary">{action.pts}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-display font-bold mb-4">Your Badges</h2>
          <div className="space-y-3">
            {[
              { title: "First Sip", desc: "Visited your first wine cellar", date: "Aug 12, 2026", unlocked: true },
              { title: "Festival Goer", desc: "Attended Green Góra Festival", date: "Sep 5, 2026", unlocked: true },
              { title: "Connoisseur", desc: "Reviewed 10 different wines", date: "-", unlocked: false },
            ].map((badge, i) => (
              <div key={i} className={`flex gap-4 p-4 rounded-2xl border transition-all ${badge.unlocked ? 'bg-card border-border shadow-sm' : 'bg-muted/30 border-dashed border-border/60 opacity-60'}`}>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${badge.unlocked ? 'bg-gradient-to-br from-accent to-amber-300 text-primary shadow-inner' : 'bg-muted text-muted-foreground'}`}>
                  <Award size={28} />
                </div>
                <div className="flex-1 py-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold font-display">{badge.title}</h3>
                    {badge.unlocked && <CheckCircle size={16} className="text-secondary" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{badge.desc}</p>
                  {badge.unlocked && <p className="text-[10px] text-muted-foreground mt-2 font-medium">Unlocked on {badge.date}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}