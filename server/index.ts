import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

// Function to initialize the app with sample data
async function initializeAppData() {
  const { storage } = await import('./storage');
  const { hashPassword } = await import('./auth');

  try {
    // Create an admin user if there are no users
    const users = await storage.getAllUsers();
    if (users.length === 0) {
      console.log('Creating initial admin user');
      await storage.createUser({
        username: 'admin',
        email: 'admin@example.com',
        password: await hashPassword('password'),
        isAdmin: true
      });
      
      // Create a regular test user
      await storage.createUser({
        username: 'user',
        email: 'user@example.com',
        password: await hashPassword('password'),
        isAdmin: false
      });
      
      console.log('Sample users created successfully');
    }
  } catch (error) {
    console.error('Error initializing app data:', error);
  }
}

(async () => {
  const server = await registerRoutes(app);
  
  // Initialize sample data
  await initializeAppData();

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
