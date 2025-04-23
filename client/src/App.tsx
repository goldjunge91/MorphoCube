import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import SimpleHomePage from "@/pages/simple-home-page";
import SimpleMyBoxesPage from "@/pages/simple-my-boxes-page";
import SimpleTemplatesPage from "@/pages/simple-templates-page";
import AuthPage from "@/pages/auth-page";
import DragAndDropProvider from "@/lib/dnd-provider";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <DragAndDropProvider>
            <Toaster />
            <Switch>
              <Route path="/auth" component={AuthPage} />
              <ProtectedRoute path="/" component={SimpleHomePage} />
              <ProtectedRoute path="/my-boxes" component={SimpleMyBoxesPage} />
              <ProtectedRoute path="/templates" component={SimpleTemplatesPage} />
              <Route component={NotFound} />
            </Switch>
          </DragAndDropProvider>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
