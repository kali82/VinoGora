import { Link, useLocation } from "wouter";
import { Home, Map, Heart, User, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import InstallPrompt from "@/components/pwa/InstallPrompt";

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language.startsWith("pl") ? "pl" : "en";

  const toggle = () => {
    i18n.changeLanguage(currentLang === "pl" ? "en" : "pl");
  };

  return (
    <button
      onClick={toggle}
      className="fixed top-3 right-3 z-[60] bg-card/90 backdrop-blur-md border border-border rounded-full px-2.5 py-1 text-xs font-bold shadow-md hover:bg-card transition-colors"
      aria-label="Switch language"
    >
      {currentLang === "pl" ? "EN" : "PL"}
    </button>
  );
}

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { icon: Home, label: t("nav.home"), href: "/" },
    { icon: Map, label: t("nav.maps"), href: "/vineyards" },
    { icon: List, label: t("nav.directory"), href: "/directory" },
    { icon: Heart, label: t("nav.favorites"), href: "/favorites" },
    { icon: User, label: t("nav.profile"), href: "/profile" },
  ];

  const hideLanguageSwitcher =
    location === "/vineyards" ||
    location === "/cellars" ||
    location.startsWith("/vineyards/") ||
    location.startsWith("/cellars/");

  return (
    <div className="h-[100dvh] bg-background pb-20 flex flex-col mx-auto relative overflow-hidden md:max-w-2xl lg:max-w-4xl xl:max-w-5xl md:shadow-2xl">
      {!hideLanguageSwitcher && <LanguageSwitcher />}
      <main className="flex-1 overflow-y-auto w-full min-h-0">
        {children}
      </main>

      <nav className="fixed bottom-0 w-full bg-card/80 backdrop-blur-xl border-t border-border z-50 md:max-w-2xl lg:max-w-4xl xl:max-w-5xl md:absolute pb-safe">
        <div className="flex justify-around items-center p-2">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer min-w-[56px]",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}>
                  <div className={cn(
                    "p-1.5 rounded-full transition-all duration-300",
                    isActive ? "bg-primary/10 scale-110" : "",
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

      <InstallPrompt />
    </div>
  );
}
