import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import MyBoxesPage from "@/pages/my-boxes-page";
import TemplatesPage from "@/pages/templates-page";
import SharedPage from "@/pages/shared-page";
import AdminUsersPage from "@/pages/admin-users-page";
import AdminSettingsPage from "@/pages/admin-settings-page";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/my-boxes" component={MyBoxesPage} />
      <ProtectedRoute path="/templates" component={TemplatesPage} />
      <ProtectedRoute path="/shared" component={SharedPage} />
      <ProtectedRoute path="/admin/users" component={AdminUsersPage} />
      <ProtectedRoute path="/admin/settings" component={AdminSettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

export default App;
