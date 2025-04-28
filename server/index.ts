import "dotenv/config"; // Load environment variables first
import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initialize, storage } from "./storage"; // Import initialize

async function main() {
  const app = express();
  const port = process.env.PORT || 3000;

  // --- Initialisiere Storage und Session-Store ---
  await initialize(); // Initialisiere die Storage-Implementierung

  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true, // Erlaube das Senden von Cookies
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Erlaubte Methoden
      allowedHeaders: ["Content-Type", "Authorization"], // Erlaubte Header
    })
  );

  // Logging
  app.use(morgan("dev", { stream: { write: (msg: string) => console.log(`[express] ${msg.trim()}`) } }));

  // Body Parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // --- Logging Middleware ---
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }

        log(logLine);
      }
    });

    next();
  });

  // --- Initialize App Data ---
  async function initializeAppData() {
    const { storage } = await import('./storage');
    const { hashPassword } = await import('./auth');

    try {
      console.log('Starting database initialization check...');

      // 1. Prüfe, ob Tenants existieren
      const tenants = await storage.getAllTenants();
      console.log(`Found ${tenants.length} tenants in database`);

      let default_tenant_id: string | null = null;
      let default_tenant_slug = 'default';

      // Suche nach einem existierenden default Tenant
      const existing_default = tenants.find(t => t.slug === default_tenant_slug);

      if (existing_default) {
        console.log(`Found existing default tenant: ${existing_default.name} (ID: ${existing_default.id}, Slug: ${existing_default.slug})`);
        default_tenant_id = existing_default.id;
      } else if (tenants.length === 0) {
        console.log('No tenants found. Creating default tenant...');
        const default_tenant = await storage.createTenant({
          name: 'Default Tenant',
          slug: default_tenant_slug,
          plan: 'free',
          isActive: true,
        });
        default_tenant_id = default_tenant.id;
        console.log(`Default tenant created successfully with ID: ${default_tenant_id} and slug: ${default_tenant_slug}`);
      } else {
        // Wähle den ersten Tenant als Standard
        default_tenant_id = tenants[0].id;
        default_tenant_slug = tenants[0].slug;
        console.log(`Using first tenant as default: ${tenants[0].name} (ID: ${default_tenant_id}, Slug: ${default_tenant_slug})`);
      }

      // 2. Prüfe, ob Benutzer existieren, insbesondere der Admin-Benutzer
      if (default_tenant_id) {
        const users = await storage.getAllUsers();
        console.log(`Found ${users.length} users in database`);

        // Prüfe, ob Admin existiert und mit dem richtigen Tenant verknüpft ist
        const admin_username = 'admin';
        const admin_user = await storage.getUserByUsernameAndTenant(admin_username, default_tenant_id);

        if (admin_user) {
          console.log(`Admin user exists with ID: ${admin_user.id}, linked to tenant: ${default_tenant_id}`);
          console.log(`Admin details: isTenantAdmin=${admin_user.isTenantAdmin}, isSuperAdmin=${admin_user.isSuperAdmin}, isActive=${admin_user.isActive}`);
        } else {
          console.log(`Admin user doesn't exist for tenant ${default_tenant_id} (${default_tenant_slug}). Creating...`);

          // Erstelle Admin-Benutzer für diesen Tenant
          const admin = await storage.createUser({
            username: admin_username,
            email: 'admin@example.com',
            passwordHash: await hashPassword('password'),
            tenantId: default_tenant_id,
            isTenantAdmin: true,
            isSuperAdmin: true,
            isActive: true,
          });

          console.log(`Admin user created successfully with ID: ${admin.id}`);

          // Erstelle auch einen normalen Benutzer für Tests
          const regular_user = await storage.createUser({
            username: 'user',
            email: 'user@example.com',
            passwordHash: await hashPassword('password'),
            tenantId: default_tenant_id,
            isTenantAdmin: false,
            isSuperAdmin: false,
            isActive: true,
          });

          console.log(`Regular user created successfully with ID: ${regular_user.id}`);
        }

        // Ausgabe wichtiger Informationen für Debugging
        console.log('\n=== AUTHENTICATION INFORMATION ===');
        console.log(`Default tenant slug: "${default_tenant_slug}"`);
        console.log(`Default tenant ID: "${default_tenant_id}"`);
        console.log('Admin credentials: username="admin", password="password"');
        console.log('User credentials: username="user", password="password"');
        console.log('===================================\n');
      } else {
        console.warn('Cannot create initial users because no tenant exists or could be determined.');
      }

    } catch (error) {
      console.error('Error initializing app data:', error);
    }
  }

  // --- Routen registrieren (inkl. Auth) ---
  const server = await registerRoutes(app);

  // Initialize sample data (can be done after routes are registered)
  // Immer initializeAppData ausführen, um sicherzustellen, dass die Benutzer korrekt erstellt werden
  await initializeAppData();

  // --- Error Handling Middleware (Should be after routes) ---
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log the error server-side
    console.error(`Error Middleware Caught: Status ${status} - ${message}`, err.stack);

    // Avoid sending HTML for API errors if possible
    if (_req.path.startsWith('/api/')) {
      res.status(status).json({ message });
    } else {
      // For non-API routes, you might still want an HTML error page,
      // but ensure it doesn't interfere with API JSON responses.
      // For simplicity, sending JSON for now. Adjust as needed.
      res.status(status).json({ message });
    }
    // Removed throw err; as it can terminate the process unexpectedly in some setups
  });

  // --- Vite/Static Middleware (LAST, after API routes and error handling) ---
  if (process.env.NODE_ENV === "development") { // Use NODE_ENV
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // --- Server starten ---
  server.listen(port, () => {
    console.log(`[express] Server läuft auf http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error("Fehler beim Starten des Servers:", err);
  process.exit(1);
});
