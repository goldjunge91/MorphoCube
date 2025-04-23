import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import SimpleHomePage from "@/pages/simple-home-page";
import SimpleMyBoxesPage from "@/pages/simple-my-boxes-page";
import TemplatesPage from "@/pages/templates-page";
import DragAndDropProvider from "@/lib/dnd-provider";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

// Simplified App without authentication for now
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DragAndDropProvider>
          <Toaster />
          <Switch>
            <Route path="/" component={SimpleHomePage} />
            <Route path="/my-boxes" component={SimpleMyBoxesPage} />
            <Route path="/templates" component={TemplatesPage} />
            <Route component={NotFound} />
          </Switch>
        </DragAndDropProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
