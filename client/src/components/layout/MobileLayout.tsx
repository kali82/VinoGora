import { Link, useLocation } from "wouter";
import { Home, Map, Heart, User, List } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Map, label: "Maps", href: "/vineyards" },
    { icon: List, label: "Directory", href: "/directory" },
    { icon: Heart, label: "Favorites", href: "/favorites" },
    { icon: User, label: "Profile", href: "/profile" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 flex flex-col mx-auto relative overflow-hidden md:max-w-md md:shadow-2xl md:h-[100dvh]">
      <main className="flex-1 overflow-y-auto w-full">
        {children}
      </main>
      
      <nav className="fixed bottom-0 w-full bg-card/80 backdrop-blur-xl border-t border-border z-50 md:max-w-md md:absolute pb-safe">
        <div className="flex justify-around items-center p-2">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer min-w-[64px]",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}>
                  <div className={cn(
                    "p-1.5 rounded-full transition-all duration-300",
                    isActive ? "bg-primary/10 scale-110" : ""
                  )}>
                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className="text-[10px] font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}