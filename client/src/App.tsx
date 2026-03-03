import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { GameProvider } from "@/contexts/GameContext";
import NotFound from "@/pages/not-found";
import MobileLayout from "@/components/layout/MobileLayout";
import OfflineBanner from "@/components/pwa/OfflineBanner";
import { useProximity } from "@/hooks/useProximity";

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

function ProximityWatcher() {
  useProximity();
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
        <Route component={NotFound} />
      </Switch>
    </MobileLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GameProvider>
          <TooltipProvider>
            <OfflineBanner />
            <Toaster />
            <SonnerToaster position="top-center" richColors />
            <ProximityWatcher />
            <Router />
          </TooltipProvider>
        </GameProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
