// Datei: /client/src/hooks/use-auth.tsx

import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient"; // Import getQueryFn
import { InsertTenant, LoginWithTenant, Tenant, UserResponse, RegisterTenant } from "@shared/schema"; // Import RegisterTenant

interface AuthContextType {
  user: UserResponse | null;
  tenant: Tenant | null;
  isLoading: boolean;
  loginMutation: ReturnType<typeof useLoginMutation>;
  registerMutation: ReturnType<typeof useRegisterMutation>;
  registerTenantMutation: ReturnType<typeof useRegisterTenantMutation>;
  logoutMutation: ReturnType<typeof useLogoutMutation>;
  switchTenant: (tenantSlug: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Login Mutation
function useLoginMutation() {
  return useMutation({
    mutationFn: async (data: LoginWithTenant) => {
      console.log("useLoginMutation: Sending login request to /api/login", data);
      // Verwende /api/login statt /api/auth/login für Kompatibilität mit der serverseitigen Weiterleitung
      const res = await apiRequest("POST", "/api/login", data);
      // Prüfe auf Fehlerstatus, bevor versucht wird, JSON zu parsen
      if (!res.ok) {
        // Versuche, eine Fehlermeldung aus dem Body zu lesen
        let error_message = `Login failed with status ${res.status}`;
        try {
          const error_body = await res.json();
          error_message = error_body.message || error_message;
        } catch (e) {
          // Ignoriere Fehler beim Parsen des Fehler-Bodys
        }
        throw new Error(error_message);
      }
      return (await res.json()) as UserResponse;
    },
    onSuccess: (data) => {
      console.log("useLoginMutation: Login successful, updating cache with user data for key ['api/auth/me']");
      // Verwende den korrekten Query Key, der von useQuery verwendet wird
      queryClient.setQueryData(["api/auth/me"], data);
      // Entferne veraltete Cache-Updates
      // queryClient.setQueryData(["/api/me"], data); // Veraltet
      // queryClient.setQueryData(["me"], data); // Veraltet
      queryClient.invalidateQueries({ queryKey: ["tenant"] });
    },
    // Optional: onError hier hinzufügen, um Fehler globaler zu behandeln, falls gewünscht
    // onError: (error) => {
    //   console.error("useLoginMutation: Error during login:", error);
    // }
  });
}

// Registrierungsmutation
function useRegisterMutation() {
  return useMutation({
    mutationFn: async (data: {
      username: string;
      email: string;
      password: string;
      tenantId: string;
      isTenantAdmin?: boolean;
    }) => {
      const res = await apiRequest("POST", "/api/auth/register", data);
      if (!res.ok) {
        let error_message = `Registration failed with status ${res.status}`;
        try {
          const error_body = await res.json();
          error_message = error_body.message || error_message;
        } catch (e) { /* ignore */ }
        throw new Error(error_message);
      }
      return (await res.json()) as UserResponse;
    },
    onSuccess: (data) => {
      // Auch hier den korrekten Key verwenden, falls Registrierung direkt einloggt
      queryClient.setQueryData(["api/auth/me"], data);
      queryClient.invalidateQueries({ queryKey: ["tenant"] });
    },
  });
}

// Tenant-Registrierungsmutation
function useRegisterTenantMutation() {
  return useMutation({
    mutationFn: async (data: InsertTenant & { adminEmail: string; adminPassword: string; adminUsername: string; }) => {
      const res = await apiRequest("POST", "/api/admin/tenants", data); // Korrekter Endpunkt für SuperAdmin-Tenant-Erstellung
      if (!res.ok) {
        let error_message = `Tenant registration failed with status ${res.status}`;
        try {
          const error_body = await res.json();
          error_message = error_body.message || error_message;
        } catch (e) { /* ignore */ }
        throw new Error(error_message);
      }
      return (await res.json()) as { tenant: Tenant; user: UserResponse; };
    },
    onSuccess: (data) => {
      // Nach erfolgreicher Tenant-Registrierung wird der Admin-Benutzer zurückgegeben
      // und sollte den Benutzerstatus aktualisieren (als wäre er eingeloggt)
      queryClient.setQueryData(["api/auth/me"], data.user);
      queryClient.setQueryData(["tenant", data.tenant.slug], data.tenant);
      queryClient.invalidateQueries({ queryKey: ["tenant"] }); // Generell Tenant-Daten invalidieren
    },
  });
}


// Logout Mutation
function useLogoutMutation() {
  return useMutation({
    mutationFn: async () => {
      // Verwende /api/auth/logout, da dies der Standard-Endpunkt ist
      await apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      console.log("useLogoutMutation: Logout successful, removing/invalidating user and tenant data.");
      // Entferne den Benutzerstatus aus dem Cache
      queryClient.removeQueries({ queryKey: ["api/auth/me"] });
      // Invalidiere die Query, falls sie irgendwo noch aktiv ist
      queryClient.invalidateQueries({ queryKey: ["api/auth/me"] });
      // Entferne Tenant-Daten
      queryClient.removeQueries({ queryKey: ["tenant"], exact: false }); // Entferne alle Tenant-bezogenen Queries
      // Optional: Weitere relevante Queries invalidieren, falls nötig
      // queryClient.invalidateQueries(); // Zu breit, gezielter ist besser
    },
    // Optional: onError hinzufügen
    // onError: (error) => {
    //  console.error("useLogoutMutation: Error during logout:", error);
    // }
  });
}

export function AuthProvider({ children }: { children: ReactNode; }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);

  // Benutzerinformationen abrufen mit getQueryFn
  const { data: user, isLoading, error: userError } = useQuery<UserResponse | null>({
    queryKey: ["api/auth/me"], // Dieser Key wird jetzt konsistent verwendet
    queryFn: getQueryFn({ on401: "returnNull" }),
    staleTime: 1000 * 60 * 5, // 5 Minuten
    retry: 1, // Nur einen Wiederholungsversuch bei Fehler
    refetchOnWindowFocus: true, // Erneut abrufen, wenn Fenster Fokus erhält
  });

  // Log user loading state and data
  useEffect(() => {
    console.log("AuthProvider: isLoading:", isLoading, "user:", user, "userError:", userError?.message);
  }, [isLoading, user, userError]);


  // Tenant-Informationen abrufen, wenn Benutzer eingeloggt ist
  useEffect(() => {
    let is_mounted = true; // Flag, um Zustandaktualisierungen auf unmontierten Komponenten zu verhindern

    // Hole Tenant-Slug direkt aus dem User-Objekt, falls vorhanden
    const tenant_slug = user?.tenant?.slug;
    console.log("AuthProvider: useEffect[user] triggered. User:", user, "Tenant Slug:", tenant_slug);


    if (tenant_slug) {
      const fetchTenant = async () => {
        console.log(`AuthProvider: Fetching tenant data for slug: ${tenant_slug}`);
        try {
          // Prüfe, ob Tenant bereits im Cache ist
          const cached_tenant = queryClient.getQueryData<Tenant>(["tenant", tenant_slug]);
          if (cached_tenant) {
            console.log(`AuthProvider: Found tenant ${tenant_slug} in cache.`);
            if (is_mounted) setTenant(cached_tenant);
            return;
          }

          console.log(`AuthProvider: Tenant ${tenant_slug} not in cache, fetching from API.`);
          // Verwende apiRequest für konsistente Fehlerbehandlung
          const res = await apiRequest("GET", `/api/tenants/${tenant_slug}`);
          if (!res.ok) {
            throw new Error(`Failed to fetch tenant ${tenant_slug} with status ${res.status}`);
          }
          const tenantData = await res.json();

          if (is_mounted) {
            console.log(`AuthProvider: Successfully fetched tenant ${tenant_slug}, updating state and cache.`);
            setTenant(tenantData);
            queryClient.setQueryData(["tenant", tenantData.slug], tenantData);
          }

        } catch (error: any) { // Fange Fehler von apiRequest ab
          console.error(`AuthProvider: Failed to fetch tenant ${tenant_slug}:`, error.message);
          if (is_mounted) {
            setTenant(null);
          }
        }
      };

      fetchTenant();
    } else {
      console.log("AuthProvider: No tenant slug found in user object, setting tenant state to null.");
      if (is_mounted) { // Sicherstellen, dass setTenant nur auf gemounteter Komponente aufgerufen wird
        setTenant(null);
      }
    }

    return () => {
      console.log("AuthProvider: useEffect[user] cleanup.");
      is_mounted = false; // Setze Flag beim Unmounten
    };
    // Abhängigkeit von user (insbesondere user.tenant.slug)
  }, [user]); // Abhängigkeit nur von user

  // Tenant wechseln
  const switchTenant = async (tenantSlug: string) => {
    console.log(`AuthProvider: Attempting to switch tenant to ${tenantSlug}`);
    try {
      const res = await apiRequest("POST", "/api/auth/switch-tenant", { tenantSlug });
      if (!res.ok) {
        let error_message = `Tenant switch failed with status ${res.status}`;
        try {
          const error_body = await res.json();
          error_message = error_body.message || error_message;
        } catch (e) { /* ignore */ }
        throw new Error(error_message);
      }
      const userData = (await res.json()) as UserResponse; // Type assertion
      console.log("AuthProvider: Tenant switch successful, updating user data in cache.");
      queryClient.setQueryData(["api/auth/me"], userData); // Aktualisiere Benutzerdaten mit dem korrekten Key

      // Tenant-Daten neu abrufen oder aus Cache holen nach Switch
      const new_tenant_slug = userData.tenant?.slug;
      if (new_tenant_slug) {
        console.log(`AuthProvider: Fetching new tenant data for ${new_tenant_slug} after switch.`);
        // Verwende apiRequest auch hier
        const tenantRes = await apiRequest("GET", `/api/tenants/${new_tenant_slug}`);
        if (!tenantRes.ok) {
          throw new Error(`Failed to fetch new tenant ${new_tenant_slug} after switch with status ${tenantRes.status}`);
        }
        const tenantData = await tenantRes.json();
        setTenant(tenantData);
        queryClient.setQueryData(["tenant", tenantData.slug], tenantData);
        console.log(`AuthProvider: Updated tenant state and cache for ${new_tenant_slug}.`);
      } else {
        console.log("AuthProvider: New user data after switch lacks tenant slug, clearing tenant state.");
        setTenant(null); // Clear tenant if new user data lacks slug
      }

    } catch (error: any) { // Fange Fehler von apiRequest ab
      console.error("AuthProvider: Error switching tenant:", error.message);
      // Optional: Zeige eine Fehlermeldung für den Benutzer an
      throw error; // Weiterwerfen, damit aufrufende Komponente reagieren kann
    }
  };

  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const registerTenantMutation = useRegisterTenantMutation();
  const logoutMutation = useLogoutMutation();

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        tenant,
        isLoading,
        loginMutation,
        registerMutation,
        registerTenantMutation,
        logoutMutation,
        switchTenant,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}