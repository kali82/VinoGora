import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { GameProvider } from "@/contexts/GameContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import NotFound from "@/pages/not-found";
import MobileLayout from "@/components/layout/MobileLayout";
import OfflineBanner from "@/components/pwa/OfflineBanner";
import { useProximity } from "@/hooks/useProximity";
import { useAuthContext } from "@/contexts/AuthContext";
import { useGameContext } from "@/contexts/GameContext";
import { flushQueue } from "@/lib/offlineQueue";
import { useEffect } from "react";

import "@/i18n";

import Home from "@/pages/Home";
import VineyardsMap from "@/pages/vineyards/VineyardsMap";
import VineyardDetail from "@/pages/vineyards/VineyardDetail";
import CellarsMap from "@/pages/cellars/CellarsMap";
import CellarDetail from "@/pages/cellars/CellarDetail";
import FestivalInfo from "@/pages/festival/FestivalInfo";
import WineryList from "@/pages/directory/WineryList";
import WineDetail from "@/pages/wines/WineDetail";
import MyWines from "@/pages/favorites/MyWines";
import Badges from "@/pages/profile/Badges";
import Leaderboard from "@/pages/profile/Leaderboard";

function ProximityWatcher() {
  useProximity();
  return null;
}

function ProfileSync() {
  const { user, isAuthenticated } = useAuthContext();
  const { syncProfile } = useGameContext();

  useEffect(() => {
    if (isAuthenticated && user) {
      syncProfile(
        user.uid,
        user.displayName || "User",
        user.email || undefined,
        user.photoURL || undefined
      );
      flushQueue().catch(() => {});
    }
  }, [isAuthenticated, user, syncProfile]);

  useEffect(() => {
    const handler = () => { flushQueue().catch(() => {}); };
    window.addEventListener("online", handler);
    return () => window.removeEventListener("online", handler);
  }, []);

  return null;
}

function Router() {
  return (
    <MobileLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/vineyards" component={VineyardsMap} />
        <Route path="/vineyards/:id" component={VineyardDetail} />
        <Route path="/wines/:id" component={WineDetail} />
        <Route path="/cellars" component={CellarsMap} />
        <Route path="/cellars/:id" component={CellarDetail} />
        <Route path="/festival" component={FestivalInfo} />
        <Route path="/directory" component={WineryList} />
        <Route path="/favorites" component={MyWines} />
        <Route path="/profile" component={Badges} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route component={NotFound} />
      </Switch>
    </MobileLayout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <GameProvider>
            <TooltipProvider>
              <OfflineBanner />
              <Toaster />
              <SonnerToaster position="top-center" richColors />
              <ProximityWatcher />
              <ProfileSync />
              <Router />
            </TooltipProvider>
          </GameProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
