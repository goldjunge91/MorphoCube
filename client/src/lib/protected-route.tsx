import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, RouteProps } from "wouter"; // Import RouteProps

// Erweitere RouteProps, um unsere benutzerdefinierten Props einzuschließen
interface ProtectedRouteProps extends Omit<RouteProps, 'component'> { // Omit component to redefine it
  component: React.ComponentType<any>; // Erlaube Komponenten
  requireTenantAdmin?: boolean;
  requireSuperAdmin?: boolean;
  requireActiveTenant?: boolean;
}

export function ProtectedRoute({
  path,
  component: Component,
  requireTenantAdmin = false,
  requireSuperAdmin = false,
  requireActiveTenant = true, // Standardmäßig aktiven Tenant erfordern
  ...rest // Sammle restliche RouteProps
}: ProtectedRouteProps) {
  const { user, tenant, isLoading } = useAuth();

  const renderRoute = (props: any) => { // props von wouter Route erhalten
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      );
    }

    if (!user) {
      return <Redirect to="/auth" />; // Einfache Weiterleitung für jetzt
    }

    // Prüfe auf aktiven Tenant, falls erforderlich (und der Benutzer nicht SuperAdmin ist)
    // SuperAdmins können möglicherweise auch inaktive Tenants verwalten
    if (requireActiveTenant && !user.isSuperAdmin && (!tenant || !tenant.isActive)) {
      console.warn("Access denied: Tenant is inactive or not loaded.");
      return <Redirect to="/" />; // Oder eine Fehlerseite anzeigen
    }

    // Prüfe auf SuperAdmin-Rechte
    if (requireSuperAdmin && !user.isSuperAdmin) {
      console.warn("Access denied: Super Admin required.");
      return <Redirect to="/" />; // Oder eine "Zugriff verweigert"-Seite
    }

    // Prüfe auf TenantAdmin-Rechte (SuperAdmins haben implizit diese Rechte)
    if (requireTenantAdmin && !user.isTenantAdmin && !user.isSuperAdmin) {
      console.warn("Access denied: Tenant Admin required.");
      return <Redirect to="/" />; // Oder eine "Zugriff verweigert"-Seite
    }

    // Wenn alle Prüfungen bestanden sind, rendere die Komponente
    return <Component {...props} />;
  };

  // Verwende die render-Prop von wouter's Route
  return <Route path={path} {...rest}>{(props) => renderRoute(props)}</Route>;
}