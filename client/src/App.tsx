import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "@/lib/protected-route";

// Import Pages
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import MyBoxesPage from "@/pages/my-boxes-page";
import TemplatesPage from "@/pages/templates-page";
import PublicBoxesPage from "@/pages/public-boxes-page";
import AdminSettingsPage from "@/pages/admin-settings-page"; // Vermutlich SuperAdmin
import AdminUsersPage from "@/pages/admin-users-page"; // Vermutlich SuperAdmin für globale Benutzer
import SuperAdminTenantsPage from "@/pages/super-admin-tenants-page";
import TenantUsersPage from "@/pages/tenant-users-page"; // SuperAdmin oder TenantAdmin? Annahme: SuperAdmin für diese Route
import BasicAuthPage from "@/pages/basic-auth-page";
import NotFoundPage from "@/pages/not-found";
import SharedBoxesPage from "@/pages/shared-boxes-page";
// import TenantSettingsPage from "@/pages/tenant-settings-page"; // Beispiel
// import TenantManagementUsersPage from "@/pages/tenant-management-users-page"; // Beispiel für TenantAdmin

function App() {
  // Determine if multi-tenancy is enabled (e.g., via environment variable)
  const multi_tenancy_enabled = import.meta.env.VITE_MULTI_TENANCY_ENABLED === 'true';
  const AuthComponent = multi_tenancy_enabled ? AuthPage : BasicAuthPage;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Switch>
            {/* Public Routes */}
            <Route path="/auth" component={AuthComponent} />
            <Route path="/public" component={PublicBoxesPage} />

            {/* Protected Routes (require standard login) */}
            <ProtectedRoute path="/" component={HomePage} />
            <ProtectedRoute path="/my-boxes" component={MyBoxesPage} />
            <ProtectedRoute path="/templates" component={TemplatesPage} />
            <ProtectedRoute path="/shared" component={SharedBoxesPage} />
            {/* <ProtectedRoute path="/profile/settings" component={ProfileSettingsPage} /> */}

            {/* Tenant Admin Routes (require tenant admin or super admin) */}
            {/* Beispiel: Diese Route erfordert TenantAdmin ODER SuperAdmin */}
            {/* <ProtectedRoute path="/tenant/users" component={TenantManagementUsersPage} requireTenantAdmin={true} /> */}
            {/* <ProtectedRoute path="/tenant/settings" component={TenantSettingsPage} requireTenantAdmin={true} /> */}


            {/* Super Admin Routes (require super admin ONLY) */}
            {/* Diese Routen erfordern explizit SuperAdmin */}
            <ProtectedRoute path="/admin/settings" component={AdminSettingsPage} requireSuperAdmin={true} />
            <ProtectedRoute path="/admin/users" component={AdminUsersPage} requireSuperAdmin={true} /> {/* Globale Benutzerverwaltung */}
            <ProtectedRoute path="/admin/tenants" component={SuperAdminTenantsPage} requireSuperAdmin={true} />
            <ProtectedRoute path="/admin/tenants/:tenantId/users" component={TenantUsersPage} requireSuperAdmin={true} /> {/* Benutzer eines best. Tenants durch SuperAdmin */}
            {/* <ProtectedRoute path="/admin/tenants/:tenantId/edit" component={EditTenantPage} requireSuperAdmin={true} /> */}


            {/* Redirect root handled by ProtectedRoute logic */}

            {/* 404 Not Found - Make sure this is the last route */}
            <Route>
              <NotFoundPage />
            </Route>
          </Switch>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
