import React, { useState } from "react"; // Removed useEffect
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
// Removed Label import
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
// Import correct schemas and types
import { loginWithTenantSchema, registerTenantSchema, Tenant, RegisterTenant } from "@shared/schema"; // Keep RegisterTenant for type checking if needed elsewhere, but not for mapped_data
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast"; // Import useToast
import { apiRequest } from "@/lib/queryClient"; // Import apiRequest

// Schema für das Login-Formular
type LoginFormValues = z.infer<typeof loginWithTenantSchema>;

// Schema für das Tenant-Registrierungsformular
type RegisterTenantFormValues = z.infer<typeof registerTenantSchema>;

// Custom-Hook für Tenant-Suche
function UseTenantsSearch(search_term: string) {
  return useQuery<Tenant[]>({ // Add type annotation for query data
    queryKey: ["tenants", "search", search_term],
    queryFn: async () => {
      if (!search_term || search_term.length < 2) return [];

      try {
        // Verwende apiRequest für konsistente Fehlerbehandlung
        const res = await apiRequest("GET", `/api/tenants/search?q=${encodeURIComponent(search_term)}`);
        return await res.json();
      } catch (error: any) {
        // Fehler von apiRequest abfangen
        console.error("Tenant search failed:", error.message);
        // Wirf den Fehler weiter, damit useQuery ihn behandeln kann
        throw new Error(`Fehler beim Suchen von Tenants: ${error.message}`);
      }
    },
    enabled: search_term.length >= 2,
    staleTime: 5 * 60 * 1000, // Cache results for 5 minutes
    retry: false, // Optional: Keine Wiederholungsversuche bei Suche
  });
}

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast(); // Initialize toast
  const [active_tab, setActiveTab] = useState<string>("login");
  const [tenant_search_term, setTenantSearchTerm] = useState("");
  const { user, loginMutation, registerTenantMutation } = useAuth();
  const { data: tenants = [], isLoading: is_searching, error: search_error } = UseTenantsSearch(tenant_search_term);

  // Redirect wenn bereits eingeloggt
  React.useEffect(() => {
    if (user) {
      console.log("AuthPage: User detected, navigating to /");
      navigate("/");
    }
  }, [user, navigate]);

  // Login Form
  const login_form = useForm<LoginFormValues>({
    resolver: zodResolver(loginWithTenantSchema),
    defaultValues: {
      tenantSlug: "", // Use camelCase to match schema
      username: "",
      password: "",
    },
  });

  // Explicitly type the handler
  const OnLoginSubmit: SubmitHandler<LoginFormValues> = (data) => {
    console.log("AuthPage: Attempting login with data:", data); // Log input data
    loginMutation.mutate(data, {
      onSuccess: (receivedUserData) => {
        // --- NEUES LOGGING ---
        console.log("AuthPage: Login mutation onSuccess triggered.");
        console.log("AuthPage: Received user data:", receivedUserData);
        // --- ENDE NEUES LOGGING ---
        toast({
          title: "Login erfolgreich",
          description: "Sie werden weitergeleitet...",
        });
        // Die Navigation wird durch das useEffect oben ausgelöst, wenn sich `user` ändert.
        // navigate("/"); // Direkte Weiterleitung hier kann zu Race Conditions führen
      },
      onError: (error: any) => { // Type error as any for broader capture
        // --- NEUES LOGGING ---
        console.error("AuthPage: Login mutation onError triggered.");
        console.error("AuthPage: Error object:", error);
        // Versuche, eine spezifischere Fehlermeldung zu extrahieren
        let error_message = "Unbekannter Fehler beim Login.";
        if (error instanceof Error) {
          error_message = error.message;
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
          // Falls der Fehler ein Objekt mit einer 'message'-Eigenschaft ist (z.B. von fetch)
          error_message = String(error.message);
        } else if (typeof error === 'string') {
          error_message = error;
        }
        console.error("AuthPage: Extracted error message:", error_message);
        // --- ENDE NEUES LOGGING ---

        // Zeige den Toast mit der extrahierten Nachricht an
        toast({
          title: "Login fehlgeschlagen",
          description: error_message, // Verwende die extrahierte Nachricht
          variant: "destructive",
        });
      }
    });
  };

  // Tenant-Registrierungsformular
  const register_tenant_form = useForm<RegisterTenantFormValues>({
    resolver: zodResolver(registerTenantSchema),
    defaultValues: {
      name: "",
      slug: "",
      plan: "free",
      admin_username: "",
      admin_email: "",
      admin_password: "",
      confirm_password: "",
    },
  });

  // Explicitly type the handler
  const OnRegisterTenantSubmit: SubmitHandler<RegisterTenantFormValues> = (data) => {
    console.log("AuthPage: Attempting tenant registration with data:", data); // Log input data
    const api_payload = {
      name: data.name,
      slug: data.slug,
      plan: data.plan,
      adminUsername: data.admin_username,
      adminEmail: data.admin_email,
      adminPassword: data.admin_password,
    };
    registerTenantMutation.mutate(api_payload, {
      onSuccess: (createdTenantData) => {
        // --- NEUES LOGGING ---
        console.log("AuthPage: Tenant registration mutation onSuccess triggered.");
        console.log("AuthPage: Received tenant/user data:", createdTenantData);
        // --- ENDE NEUES LOGGING ---
        toast({
          title: "Registrierung erfolgreich",
          description: "Ihr Arbeitsbereich wurde erstellt. Sie werden weitergeleitet...",
        });
        // Die Navigation wird durch das useEffect oben ausgelöst, wenn sich `user` ändert.
        // navigate("/"); // Direkte Weiterleitung hier kann zu Race Conditions führen
      },
      onError: (error: any) => { // Type error as any
        // --- NEUES LOGGING ---
        console.error("AuthPage: Tenant registration mutation onError triggered.");
        console.error("AuthPage: Error object:", error);
        let error_message = "Unbekannter Fehler bei der Registrierung.";
        if (error instanceof Error) {
          error_message = error.message;
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
          error_message = String(error.message);
        } else if (typeof error === 'string') {
          error_message = error;
        }
        console.error("AuthPage: Extracted error message:", error_message);
        // --- ENDE NEUES LOGGING ---
        toast({
          title: "Registrierung fehlgeschlagen",
          description: error_message, // Verwende die extrahierte Nachricht
          variant: "destructive",
        });
      }
    });
  };

  // Helfer für Slug-Generierung
  const GenerateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim() // Remove leading/trailing whitespace
      .replace(/[\s_]+/g, "-") // Replace spaces and underscores with hyphens
      .replace(/[^a-z0-9-]+/g, "") // Remove non-alphanumeric except hyphens
      .replace(/--+/g, "-") // Replace multiple hyphens with single
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
  };
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Form Section */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground">Morphological Box Tool</h1>
            <p className="text-muted-foreground mt-2">
              Bei Ihrem Konto anmelden oder einen neuen Arbeitsbereich erstellen
            </p>
          </div>

          <Tabs value={active_tab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Arbeitsbereich erstellen</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Login</CardTitle>
                  <CardDescription>
                    Geben Sie Ihre Zugangsdaten ein, um auf Ihren Arbeitsbereich zuzugreifen
                  </CardDescription>
                </CardHeader>
                {/* Pass the correct form type */}
                <Form {...login_form}>
                  {/* Use the correctly typed handler */}
                  <form onSubmit={login_form.handleSubmit(OnLoginSubmit)}>
                    <CardContent className="space-y-4">
                      <FormField
                        control={login_form.control}
                        name="tenantSlug" // Use camelCase
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Arbeitsbereich (Slug)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="mein-arbeitsbereich"
                                  {...field}
                                  onChange={(e) => {
                                    const slug_value = GenerateSlug(e.target.value); // Ensure slug format
                                    field.onChange(slug_value); // Update form with formatted slug
                                    setTenantSearchTerm(e.target.value); // Keep original search term
                                  }}
                                  autoComplete="off"
                                />
                                {is_searching && (
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                  </div>
                                )}

                                {/* Tenant-Suchergebnisse Dropdown */}
                                {tenant_search_term.length >= 2 && !is_searching && (tenants.length > 0 || search_error) && (
                                  <div className="absolute z-10 mt-1 w-full bg-popover border rounded-md shadow-lg max-h-60 overflow-y-auto">
                                    {search_error && <div className="p-2 text-sm text-destructive">Fehler: {search_error.message}</div>}
                                    {!search_error && tenants.length === 0 && <div className="p-2 text-sm text-muted-foreground">Keine Arbeitsbereiche gefunden.</div>}
                                    {!search_error && tenants.map((tenant: Tenant) => ( // Add explicit type Tenant
                                      <div
                                        key={tenant.id}
                                        className="p-2 hover:bg-muted cursor-pointer flex items-center gap-2 text-sm"
                                        onClick={() => {
                                          login_form.setValue("tenantSlug", tenant.slug); // Use camelCase
                                          setTenantSearchTerm(""); // Clear search term
                                          // Optionally clear the dropdown:
                                          // setTenants([]); // If you manage tenants state locally
                                        }}
                                      >
                                        {tenant.logoUrl && (
                                          <img
                                            src={tenant.logoUrl}
                                            alt={tenant.name}
                                            className="w-5 h-5 mr-2 rounded-sm object-contain flex-shrink-0"
                                          />
                                        )}
                                        {!tenant.logoUrl && <div className="w-5 h-5 mr-2 rounded-sm bg-muted flex-shrink-0"></div>}
                                        <div className="flex-grow overflow-hidden">
                                          <div className="font-medium truncate">{tenant.name}</div>
                                          <div className="text-xs text-muted-foreground">
                                            {tenant.slug}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={login_form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Benutzername</FormLabel>
                            <FormControl>
                              <Input placeholder="benutzername" {...field} autoComplete="username" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={login_form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Passwort</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="******" {...field} autoComplete="current-password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                    <CardFooter className="flex flex-col items-stretch gap-2">
                      {/* Zeige Fehler vom Mutation-Hook an */}
                      {loginMutation.isError && (
                        <p className="text-sm text-destructive text-center mb-2">
                          Fehler beim Anmelden: {loginMutation.error?.message || 'Ungültige Anmeldedaten oder Serverfehler.'}
                        </p>
                      )}
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Anmelden...
                          </>
                        ) : (
                          "Anmelden"
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </Form>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Neuen Arbeitsbereich erstellen</CardTitle>
                  <CardDescription>
                    Erstellen Sie Ihren eigenen Arbeitsbereich und laden Sie Teammitglieder ein
                  </CardDescription>
                </CardHeader>
                {/* Pass the correct form type */}
                <Form {...register_tenant_form}>
                  {/* Use the correctly typed handler */}
                  <form onSubmit={register_tenant_form.handleSubmit(OnRegisterTenantSubmit)}>
                    <CardContent className="space-y-6"> {/* Increased spacing */}
                      <div className="space-y-4">
                        <h3 className="font-medium text-foreground">Arbeitsbereich-Details</h3>
                        <FormField
                          control={register_tenant_form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name des Arbeitsbereichs</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Mein Unternehmen GmbH"
                                  {...field}
                                  onChange={(e) => {
                                    const name_value = e.target.value;
                                    field.onChange(name_value);
                                    // Automatisch Slug aus dem Namen generieren
                                    const slug = GenerateSlug(name_value);
                                    register_tenant_form.setValue("slug", slug, { shouldValidate: true }); // Validate slug too
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={register_tenant_form.control}
                          name="slug"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>URL-Slug</FormLabel>
                              <FormControl>
                                <div className="flex items-center space-x-1">
                                  <span className="text-sm text-muted-foreground whitespace-nowrap">morphocube.app/</span>
                                  <Input
                                    placeholder="mein-unternehmen"
                                    {...field}
                                    onChange={(e) => {
                                      // Slug-Generierung beim Tippen
                                      const value = GenerateSlug(e.target.value);
                                      field.onChange(value);
                                    }}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={register_tenant_form.control}
                          name="plan"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Plan</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Plan auswählen" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="free">Kostenlos</SelectItem>
                                  <SelectItem value="basic">Basic</SelectItem>
                                  <SelectItem value="premium">Premium</SelectItem>
                                  <SelectItem value="enterprise">Enterprise</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-4 pt-6 border-t"> {/* Increased padding */}
                        <h3 className="font-medium text-foreground">Admin-Konto</h3>
                        <FormField
                          control={register_tenant_form.control}
                          name="admin_username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Admin-Benutzername</FormLabel>
                              <FormControl>
                                <Input placeholder="admin" {...field} autoComplete="username" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={register_tenant_form.control}
                          name="admin_email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Admin-E-Mail</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="admin@mein-unternehmen.de" {...field} autoComplete="email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={register_tenant_form.control}
                          name="admin_password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Admin-Passwort</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="******" {...field} autoComplete="new-password" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={register_tenant_form.control}
                          name="confirm_password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Passwort bestätigen</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="******" {...field} autoComplete="new-password" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col items-stretch gap-2">
                      {/* Zeige Fehler vom Mutation-Hook an */}
                      {registerTenantMutation.isError && (
                        <p className="text-sm text-destructive text-center mb-2">
                          Fehler bei der Registrierung: {registerTenantMutation.error?.message || 'Registrierung fehlgeschlagen. Überprüfen Sie die Eingaben.'}
                        </p>
                      )}
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={registerTenantMutation.isPending}
                      >
                        {registerTenantMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Arbeitsbereich wird erstellt...
                          </>
                        ) : (
                          "Arbeitsbereich erstellen"
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </Form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Hero Section - Consider making colors configurable or using CSS variables */}
      <div className="flex-1 bg-gradient-to-br from-blue-600 to-indigo-800 text-primary-foreground p-12 hidden md:flex md:flex-col md:justify-center">
        <div className="max-w-md mx-auto">
          <h2 className="text-4xl font-bold mb-6">Morphological Box Tool</h2>
          <p className="text-xl text-blue-100 mb-8">
            Ein leistungsstarkes Tool für systematische Problemlösung und Innovation durch morphologische Analyse
          </p>
          <div className="space-y-4">
            {/* Feature Item */}
            <div className="flex items-start space-x-3">
              <div className="bg-blue-500 p-2 rounded-full mt-1 flex-shrink-0">
                {/* Replace SVG with a relevant icon from lucide-react or similar */}
                <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 11L3.5 7L4.5 6L7.5 9L10.5 6L11.5 7L7.5 11Z" fill="currentColor" /></svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Drag & Drop Interface</h3>
                <p className="text-blue-200">Erstellen und verwalten Sie morphologische Kästen mit intuitiven Steuerungen</p>
              </div>
            </div>
            {/* Feature Item */}
            <div className="flex items-start space-x-3">
              <div className="bg-blue-500 p-2 rounded-full mt-1 flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H3.5C3.22386 4 3 3.77614 3 3.5ZM1 6.5C1 5.67157 1.67157 5 2.5 5H12.5C13.3284 5 14 5.67157 14 6.5V11.5C14 12.3284 13.3284 13 12.5 13H2.5C1.67157 13 1 12.3284 1 11.5V6.5ZM2.5 6C2.22386 6 2 6.22386 2 6.5V11.5C2 11.7761 2.22386 12 2.5 12H12.5C12.7761 12 13 11.7761 13 11.5V6.5C13 6.22386 12.7761 6 12.5 6H2.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" /></svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Kollaborationsfunktionen</h3>
                <p className="text-blue-200">Arbeiten Sie mit Ihrem Team in Echtzeit an komplexen Problemen</p>
              </div>
            </div>
            {/* Feature Item */}
            <div className="flex items-start space-x-3">
              <div className="bg-blue-500 p-2 rounded-full mt-1 flex-shrink-0">;
                <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.5 2C3.22386 2 3 2.22386 3 2.5V12.5C3 12.7761 3.22386 13 3.5 13H11.5C11.7761 13 12 12.7761 12 12.5V6.5C12 6.22386 11.7761 6 11.5 6H10V4.5C10 4.22386 9.77614 4 9.5 4H8V2.5C8 2.22386 7.77614 2 7.5 2H3.5ZM4 3H7V5.5C7 5.77614 7.22386 6 7.5 6H9V12H4V3ZM8 5H9V4H8V5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" /></svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Export-Optionen</h3>
                <p className="text-blue-200">Exportieren Sie Ihre Arbeit in verschiedene Formate für Präsentationen und Berichte</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}