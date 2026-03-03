import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import MobileLayout from "@/components/layout/MobileLayout";

import Home from "@/pages/Home";
import VineyardsMap from "@/pages/vineyards/VineyardsMap";
import CellarsMap from "@/pages/cellars/CellarsMap";
import FestivalInfo from "@/pages/festival/FestivalInfo";
import WineryList from "@/pages/directory/WineryList";
import MyWines from "@/pages/favorites/MyWines";
import Badges from "@/pages/profile/Badges";

function Router() {
  return (
    <MobileLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/vineyards" component={VineyardsMap} />
        <Route path="/cellars" component={CellarsMap} />
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
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
