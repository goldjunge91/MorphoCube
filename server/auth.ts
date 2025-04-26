import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express"; // Import Request, Response, NextFunction
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as UserType, loginWithTenantSchema } from "@shared/schema"; // Import login schema

declare global {
  namespace Express {
    interface User extends UserType { }
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Nur über HTTPS in Produktion
      maxAge: 24 * 60 * 60 * 1000, // 1 Tag
      httpOnly: true, // Verhindert Zugriff durch clientseitiges JS
      sameSite: 'lax', // Explizit setzen, wichtig für Cross-Site-Kontexte und Sicherheit
    },
    store: storage.sessionStore,
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // --- Passport Local Strategy for Tenant Login ---
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'username', // Default, explicit for clarity
        passwordField: 'password', // Default, explicit for clarity
        passReqToCallback: true // Pass request object to the callback
      },
      async (req: Request, username, password, done) => {
        // Log the received body for debugging
        console.log("LocalStrategy received body:", JSON.stringify(req.body, null, 2));

        try {
          // Validate input using Zod schema
          const parseResult = loginWithTenantSchema.safeParse(req.body);
          if (!parseResult.success) {
            // Log validation errors for debugging
            console.error("Login validation failed:", JSON.stringify(parseResult.error.errors, null, 2));
            // Provide a more specific message if possible, otherwise generic
            const firstError = parseResult.error.errors[0];
            const errorMessage = firstError?.message || "Invalid input format.";
            // Check if the error is the specific pattern mismatch
            if (firstError?.code === 'invalid_string' && firstError.validation === 'regex') {
              return done(null, false, { message: `Field '${firstError.path.join('.')}' did not match the expected pattern.` });
            }
            return done(null, false, { message: errorMessage });
          }

          // Destructure validated data
          const { tenantSlug } = parseResult.data;
          // Log validated slug
          console.log(`Validated tenantSlug: "${tenantSlug}"`);


          // 1. Find the tenant by slug
          const tenant = await storage.getTenantBySlug(tenantSlug);
          if (!tenant) {
            console.log(`Login attempt failed: Tenant not found for slug "${tenantSlug}"`);
            return done(null, false, { message: "Invalid tenant, username, or password." });
          }

          // 2. Find the user by username *within that tenant*
          // Use the username from the function arguments, not req.body directly
          const user = await storage.getUserByUsernameAndTenant(username, tenant.id);
          if (!user) {
            console.log(`Login attempt failed: User "${username}" not found in tenant "${tenantSlug}" (ID: ${tenant.id})`);
            return done(null, false, { message: "Invalid tenant, username, or password." });
          }

          // 3. Check if user is active
          if (!user.isActive) {
            console.log(`Login attempt failed: User "${username}" in tenant "${tenantSlug}" is inactive.`);
            return done(null, false, { message: "Account is inactive." });
          }

          // 4. Compare passwords
          // Use the password from the function arguments, not req.body directly
          const passwordsMatch = await comparePasswords(password, user.passwordHash);
          if (!passwordsMatch) {
            console.log(`Login attempt failed: Incorrect password for user "${username}" in tenant "${tenantSlug}"`);
            return done(null, false, { message: "Invalid tenant, username, or password." });
          }

          // 5. Success - return the user object (which includes tenantId)
          console.log(`Login successful for user "${username}" in tenant "${tenantSlug}"`);
          // Attach tenant info directly for easier access in req.user?
          // Or rely on client fetching tenant details based on user.tenantId/user.tenant.slug
          // For now, return the standard user object from DB.
          return done(null, user);

        } catch (err) {
          console.error("Error during LocalStrategy authentication:", err);
          return done(err as Error);
        }
      }
    )
  );


  passport.serializeUser((user: Express.User, done) => {
    // Store user ID and potentially the active tenant ID in the session
    // For simplicity, just storing user ID for now.
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => { // ID is string (UUID)
    try {
      // Fetch user by ID. This user object will contain the tenantId they logged in with.
      const user = await storage.getUser(id);
      if (!user) {
        return done(new Error("User not found during deserialization"));
      }
      // The user object fetched here represents the user's state in the DB.
      // It includes the tenantId they belong to.
      done(null, user);
    } catch (err) {
      done(err as Error);
    }
  });

  // --- Authentication Routes ---

  // Register route (Commented out - Use Tenant Registration via /api/tenants)
  /*
  app.post("/api/auth/register", async (req, res, next) => {
    // This needs significant changes for multi-tenancy (e.g., require tenantId, check permissions)
    // For now, rely on POST /api/tenants for initial registration.
    res.status(501).json({ message: "Global registration not implemented. Use tenant creation." });
  });
  */

  // Login route (Uses the modified LocalStrategy)
  app.post("/api/auth/login", (req, res, next) => {
    // The strategy now uses req.body directly
    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: { message?: string; } | undefined) => {
      if (err) {
        console.error("Login authentication error:", err);
        return next(err);
      }
      if (!user) {
        // Log the reason for failure if available
        console.log("Login failed:", info?.message || "No user returned from strategy");
        // Send the specific error message from the strategy
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      req.login(user, (err) => {
        if (err) {
          console.error("Error during req.login:", err);
          return next(err);
        }
        // --- LOGGING VOR RESPONSE ---
        console.log(`User ${user.username} (ID: ${user.id}) logged in successfully.`);
        console.log("Session after login:", JSON.stringify(req.session, null, 2));
        console.log("Session ID after login:", req.sessionID);
        console.log("Is authenticated after login:", req.isAuthenticated());

        // Log response headers before sending
        console.log("Response headers to be sent:", res.getHeaders());
        // --- ENDE LOGGING VOR RESPONSE ---

        // Exclude password hash before sending response
        const { passwordHash, ...safeUser } = user;
        return res.json(safeUser);
      });
    })(req, res, next);
  });

  // Logout route
  app.post("/api/auth/logout", (req, res, next) => {
    const username = req.user?.username; // Get username before logout
    req.logout((err) => {
      if (err) {
        console.error("Error during logout:", err);
        return next(err);
      }
      // Optional: Destroy session completely
      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          console.error("Error destroying session:", destroyErr);
          return next(destroyErr);
        }
        console.log(`User ${username || 'unknown'} logged out successfully.`);
        res.clearCookie('connect.sid'); // Ensure cookie is cleared
        res.sendStatus(200);
      });
    });
  });

  // Get current user route - CRITICAL FIX
  app.get("/api/auth/me", (req, res) => { // Corrected path
    if (req.isAuthenticated() && req.user) {
      // Ensure password hash is not sent
      const { passwordHash, ...safeUser } = req.user;
      console.log(`GET /api/auth/me: User ${safeUser.username} is authenticated.`);
      res.json(safeUser); // Send user data as JSON
    } else {
      console.log("GET /api/auth/me: User is not authenticated.");
      res.status(401).json({ message: "Not authenticated" }); // Send 401 with JSON
    }
  });

  // Switch Tenant Route (Example Implementation)
  app.post("/api/auth/switch-tenant", async (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { tenantSlug } = req.body;
    if (!tenantSlug || typeof tenantSlug !== 'string') {
      return res.status(400).json({ message: "Missing or invalid tenantSlug" });
    }

    try {
      const targetTenant = await storage.getTenantBySlug(tenantSlug);
      if (!targetTenant) {
        return res.status(404).json({ message: "Target tenant not found" });
      }

      // Check if the user actually belongs to the target tenant
      // This requires fetching the user record associated with the *target* tenant.
      // We use the current user's username as the identifier.
      const targetUserRecord = await storage.getUserByUsernameAndTenant(req.user.username, targetTenant.id);

      if (!targetUserRecord) {
        // Maybe the user exists globally but isn't explicitly linked to this tenant?
        // Or maybe the user *only* exists in their original tenant.
        // Access control logic needed here based on requirements.
        // For now, deny if no specific record found in the target tenant.
        return res.status(403).json({ message: "User does not belong to the target tenant" });
      }

      // If the user exists in the target tenant, log them in "as" that user record.
      // This updates the session's user object to reflect the context of the new tenant.
      req.login(targetUserRecord, (err) => {
        if (err) {
          console.error("Error during tenant switch login:", err);
          return next(err);
        }
        console.log(`User ${targetUserRecord.username} switched tenant context to ${tenantSlug}`);
        const { passwordHash, ...safeUser } = targetUserRecord;
        return res.json(safeUser); // Return the user context for the new tenant
      });

    } catch (error) {
      console.error("Error switching tenant:", error);
      next(error);
    }
  });
}