import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import MyBoxesPage from "@/pages/my-boxes-page";
import TemplatesPage from "@/pages/templates-page";
import SharedPage from "@/pages/shared-page";
import AdminUsersPage from "@/pages/admin-users-page";
import AdminSettingsPage from "@/pages/admin-settings-page";
import AuthLayout from "@/components/auth-layout";
import AppLayout from "@/components/app-layout";

function App() {
  return (
    <Switch>
      {/* Public route - no auth needed */}
      <Route path="/auth">
        <AuthLayout>
          <AuthPage />
        </AuthLayout>
      </Route>
      
      {/* Protected routes - require authentication */}
      <Route path="/">
        <AppLayout requireAuth>
          <HomePage />
        </AppLayout>
      </Route>
      
      <Route path="/my-boxes">
        <AppLayout requireAuth>
          <MyBoxesPage />
        </AppLayout>
      </Route>
      
      <Route path="/templates">
        <AppLayout requireAuth>
          <TemplatesPage />
        </AppLayout>
      </Route>
      
      <Route path="/shared">
        <AppLayout requireAuth>
          <SharedPage />
        </AppLayout>
      </Route>
      
      {/* Admin routes - require admin rights */}
      <Route path="/admin/users">
        <AppLayout requireAuth requireAdmin>
          <AdminUsersPage />
        </AppLayout>
      </Route>
      
      <Route path="/admin/settings">
        <AppLayout requireAuth requireAdmin>
          <AdminSettingsPage />
        </AppLayout>
      </Route>
      
      {/* 404 Not Found */}
      <Route>
        <AuthLayout>
          <NotFound />
        </AuthLayout>
      </Route>
    </Switch>
  );
}

export default App;