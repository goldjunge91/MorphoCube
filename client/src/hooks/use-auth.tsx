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
      return (await res.json()) as UserResponse;
    },
    onSuccess: (data) => {
      console.log("useLoginMutation: Login successful, updating cache with user data");
      queryClient.setQueryData(["/api/me"], data); // Verwende ["/api/me"] für Konsistenz
      queryClient.setQueryData(["me"], data); // Behalte auch den alten Key für Kompatibilität
      queryClient.invalidateQueries({ queryKey: ["tenant"] });
    },
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
      return (await res.json()) as UserResponse;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["me"], data);
    },
  });
}

// Tenant-Registrierungsmutation
function useRegisterTenantMutation() {
  return useMutation({
    mutationFn: async (data: InsertTenant & { adminEmail: string; adminPassword: string; adminUsername: string; }) => {
      const res = await apiRequest("POST", "/api/tenants", data);
      return (await res.json()) as { tenant: Tenant; user: UserResponse; };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["me"], data.user);
      queryClient.setQueryData(["tenant", data.tenant.slug], data.tenant);
    },
  });
}

// Logout Mutation
function useLogoutMutation() {
  return useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      // Gezielteres Entfernen und Invalidieren statt clear()
      queryClient.removeQueries({ queryKey: ["me"] });
      queryClient.removeQueries({ queryKey: ["tenant"] }); // Auch Tenant-Daten entfernen
      // Optional: Weitere relevante Queries invalidieren, falls nötig
      queryClient.invalidateQueries(); // Invalidiert alle Queries, um Refetch auszulösen wo nötig
      // Setze den Benutzer im AuthContext direkt auf null
      // Dies wird indirekt durch das Entfernen der 'me'-Query und den Neurender des Providers geschehen.
    },
  });
}

export function AuthProvider({ children }: { children: ReactNode; }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);

  // Benutzerinformationen abrufen mit getQueryFn
  const { data: user, isLoading } = useQuery<UserResponse | null>({
    queryKey: ["api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }), // Verwende die generische Funktion
    staleTime: 1000 * 60 * 5, // 5 Minuten
    retry: false,
  });

  // Tenant-Informationen abrufen, wenn Benutzer eingeloggt ist
  useEffect(() => {
    let is_mounted = true; // Flag, um Zustandaktualisierungen auf unmontierten Komponenten zu verhindern

    if (user?.tenant?.slug) {
      const fetchTenant = async () => {
        try {
          if (!user.tenant?.slug) {
            console.warn("User object does not contain tenant slug. Cannot fetch tenant details.");
            if (is_mounted) setTenant(null);
            return;
          }

          // Verwende apiRequest für konsistente Fehlerbehandlung
          const res = await apiRequest("GET", `/api/tenants/${user.tenant.slug}`);
          const tenantData = await res.json();

          if (is_mounted) {
            setTenant(tenantData);
            queryClient.setQueryData(["tenant", tenantData.slug], tenantData);
          }

        } catch (error: any) { // Fange Fehler von apiRequest ab
          console.error(`Failed to fetch tenant ${user.tenant?.slug}:`, error.message);
          if (is_mounted) {
            setTenant(null);
          }
        }
      };

      fetchTenant();
    } else {
      setTenant(null);
    }

    return () => {
      is_mounted = false; // Setze Flag beim Unmounten
    };
    // Abhängigkeit von user.tenantId oder user.tenant.slug, je nachdem was verwendet wird
  }, [user?.tenant, user?.tenant?.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tenant wechseln
  const switchTenant = async (tenantSlug: string) => {
    try {
      const res = await apiRequest("POST", "/api/auth/switch-tenant", { tenantSlug });
      const userData = (await res.json()) as UserResponse; // Type assertion
      queryClient.setQueryData(["me"], userData); // Aktualisiere Benutzerdaten

      // Tenant-Daten neu abrufen oder aus Cache holen nach Switch
      if (userData.tenant?.slug) {
        // Verwende apiRequest auch hier
        const tenantRes = await apiRequest("GET", `/api/tenants/${userData.tenant.slug}`);
        const tenantData = await tenantRes.json();
        setTenant(tenantData);
        queryClient.setQueryData(["tenant", tenantData.slug], tenantData);
      } else {
        setTenant(null); // Clear tenant if new user data lacks slug
      }

    } catch (error: any) { // Fange Fehler von apiRequest ab
      console.error("Error switching tenant:", error.message);
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