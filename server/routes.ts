import express, { type Express, Request, Response, NextFunction, Router } from "express"; // Import Router
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import {
  insertParameterSchema,
  insertAttributeSchema,
  insertMorphBoxSchema,
  insertSharedAccessSchema,
  User, // Import User type for req.user
  insertTenantSchema, // Import for validation
} from "@shared/schema";
import passport from "passport";

// --- Type Augmentation ---
interface AuthenticatedUser extends User {
}

declare global {
  namespace Express {
    interface User extends AuthenticatedUser { }
  }
}

// --- Middleware ---
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

function isTenantAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user && (req.user.isTenantAdmin || req.user.isSuperAdmin)) {
    return next();
  }
  res.status(403).json({ message: "Forbidden: Tenant Admin required" });
}

function isSuperAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user && req.user.isSuperAdmin) {
    return next();
  }
  res.status(403).json({ message: "Forbidden: Super Admin required" });
}

// --- Zod Schemas for Validation ---
const IdParamSchema = z.object({
  id: z.string().uuid("Invalid UUID format"), // Assuming UUID for users/tenants
});

const NumericIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a number").transform(Number),
});

const ParameterIdParamSchema = z.object({
  parameterId: z.string().regex(/^\d+$/, "Parameter ID must be a number").transform(Number),
});

const SlugParamSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
});

const TenantStatusUpdateSchema = z.object({
  isActive: z.boolean(),
});

// Schema for creating tenant + admin (adjust based on actual needs)
const CreateTenantWithAdminSchema = insertTenantSchema.extend({
  adminUsername: z.string().min(3),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(6),
}).omit({ id: true, createdAt: true, updatedAt: true }); // Omit generated fields


// --- Helper Function for Validation Middleware ---
const validateRequest = (schema: z.ZodSchema<any>, part: 'body' | 'params' | 'query') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors });
    }
    // Overwrite the validated part with parsed data (includes transformations)
    req[part] = result.data;
    next();
  };
};


export async function registerRoutes(app: Express): Promise<Server> {
  // --- Authentication Routes (Mounted First) ---
  setupAuth(app); // Contains /api/auth/* routes

  // --- API Routers ---
  const apiRouter = Router();

  // --- Compatibility Routes ---
  // Diese Routen leiten Anfragen an die richtigen Auth-Endpunkte weiter
  // und stellen die Abwärtskompatibilität sicher
  apiRouter.post("/login", (req, res, next) => {
    console.log("Forwarding /api/login to /api/auth/login");

    // Prüfen, ob tenantSlug fehlt und wenn ja, Default-Tenant hinzufügen
    if (!req.body.tenantSlug) {
      console.log("tenantSlug nicht in Anfrage vorhanden, ergänze 'default'");
      req.body.tenantSlug = "default"; // Verwende den Slug des Default-Tenants
    }

    // Direkt die Login-Funktion aus dem auth-Modul aufrufen
    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: { message?: string; } | undefined) => {
      if (err) {
        console.error("Login authentication error:", err);
        return next(err);
      }
      if (!user) {
        console.log("Login failed:", info?.message || "No user returned from strategy");
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      req.login(user, (err) => {
        if (err) {
          console.error("Error during req.login:", err);
          return next(err);
        }
        console.log(`User ${user.username} (ID: ${user.id}) logged in successfully via compatibility route.`);
        console.log("Session after login:", JSON.stringify(req.session, null, 2));
        console.log("Session ID after login:", req.sessionID);
        console.log("Is authenticated after login:", req.isAuthenticated());

        // Exclude password hash before sending response
        const { passwordHash, ...safeUser } = user;
        return res.json(safeUser);
      });
    })(req, res, next);
  });

  apiRouter.get("/me", (req, res) => {
    console.log("Handling /api/me request in compatibility route");
    if (req.isAuthenticated() && req.user) {
      // Ensure password hash is not sent
      const { passwordHash, ...safeUser } = req.user;
      console.log(`GET /api/me (compat): User ${safeUser.username} is authenticated.`);
      res.json(safeUser); // Send user data as JSON
    } else {
      console.log("GET /api/me (compat): User is not authenticated.");
      res.status(401).json({ message: "Not authenticated" }); // Send 401 with JSON
    }
  });

  apiRouter.post("/logout", (req, res, next) => {
    console.log("Handling /api/logout request in compatibility route");
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

  // --- User Router ---
  const userRouter = Router();
  userRouter.use(isTenantAdmin); // All user routes require at least tenant admin

  userRouter.get("/", async (req, res) => {
    try {
      if (!req.user?.tenantId) {
        return res.status(400).json({ message: "Tenant context missing" });
      }
      const users = await storage.getUsersByTenantId(req.user.tenantId);
      const safeUsers = users.map(({ passwordHash, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Server error fetching users" });
    }
  });

  userRouter.get("/:id", validateRequest(IdParamSchema, 'params'), async (req, res) => {
    try {
      const userId = req.params.id; // Already validated as string UUID
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.tenantId !== req.user!.tenantId && !req.user!.isSuperAdmin) {
        return res.status(403).json({ message: "Forbidden: Cannot access users from other tenants" });
      }
      const { passwordHash, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error(`Error fetching user ${req.params.id}:`, error);
      res.status(500).json({ message: "Server error fetching user" });
    }
  });

  userRouter.patch("/:id", validateRequest(IdParamSchema, 'params'), async (req, res) => {
    try {
      const userId = req.params.id;
      const updateData = req.body; // TODO: Add Zod validation for body

      delete updateData.passwordHash;
      delete updateData.password;
      delete updateData.isSuperAdmin;
      delete updateData.tenantId;

      const userToUpdate = await storage.getUser(userId);
      if (!userToUpdate) {
        return res.status(404).json({ message: "User not found" });
      }
      if (userToUpdate.tenantId !== req.user!.tenantId && !req.user!.isSuperAdmin) {
        return res.status(403).json({ message: "Forbidden: Cannot modify users from other tenants" });
      }
      if (!req.user!.isSuperAdmin) {
        delete updateData.isTenantAdmin;
      }

      const updatedUser = await storage.updateUser(userId, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found during update" });
      }
      const { passwordHash, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error(`Error updating user ${req.params.id}:`, error);
      res.status(500).json({ message: "Server error updating user" });
    }
  });

  userRouter.delete("/:id", validateRequest(IdParamSchema, 'params'), async (req, res) => {
    try {
      const userId = req.params.id;
      const userToDelete = await storage.getUser(userId);
      if (!userToDelete) {
        return res.status(404).json({ message: "User not found" });
      }
      if (userToDelete.tenantId !== req.user!.tenantId && !req.user!.isSuperAdmin) {
        return res.status(403).json({ message: "Forbidden: Cannot delete users from other tenants" });
      }
      const success = await storage.deleteUser(userId);
      if (!success) {
        return res.status(404).json({ message: "User not found during deletion" });
      }
      res.status(204).send();
    } catch (error) {
      console.error(`Error deleting user ${req.params.id}:`, error);
      res.status(500).json({ message: "Server error deleting user" });
    }
  });

  apiRouter.use("/users", userRouter); // Mount user router

  // --- Parameter Router ---
  const parameterRouter = Router();
  parameterRouter.use(isAuthenticated); // All parameter routes require login

  parameterRouter.post("/", validateRequest(insertParameterSchema.omit({ userId: true }), 'body'), async (req, res) => {
    try {
      const paramData = {
        ...req.body,
        userId: req.user!.id
      };
      const parameter = await storage.createParameter(paramData);
      res.status(201).json(parameter);
    } catch (error) {
      console.error("Error creating parameter:", error);
      res.status(500).json({ message: "Server error creating parameter" });
    }
  });

  parameterRouter.get("/", async (req, res) => {
    try {
      const parameters = await storage.getParametersByUserId(req.user!.id);
      res.json(parameters);
    } catch (error) {
      console.error("Error fetching parameters:", error);
      res.status(500).json({ message: "Server error fetching parameters" });
    }
  });

  parameterRouter.get("/:id", validateRequest(NumericIdParamSchema, 'params'), async (req, res) => {
    try {
      const parameterId = req.params.id as unknown as number; // Validated and transformed
      const parameter = await storage.getParameter(parameterId);
      if (!parameter) {
        return res.status(404).json({ message: "Parameter not found" });
      }
      if (parameter.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden: Cannot access this parameter" });
      }
      res.json(parameter);
    } catch (error) {
      console.error(`Error fetching parameter ${req.params.id}:`, error);
      res.status(500).json({ message: "Server error fetching parameter" });
    }
  });

  parameterRouter.patch("/:id", validateRequest(NumericIdParamSchema, 'params'), async (req, res) => {
    try {
      const parameterId = req.params.id as unknown as number;
      const parameter = await storage.getParameter(parameterId);
      if (!parameter) {
        return res.status(404).json({ message: "Parameter not found" });
      }
      if (parameter.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden: Cannot modify this parameter" });
      }
      // TODO: Validate req.body for partial update
      const updatedParameter = await storage.updateParameter(parameterId, req.body);
      res.json(updatedParameter);
    } catch (error) {
      console.error(`Error updating parameter ${req.params.id}:`, error);
      res.status(500).json({ message: "Server error updating parameter" });
    }
  });

  parameterRouter.delete("/:id", validateRequest(NumericIdParamSchema, 'params'), async (req, res) => {
    try {
      const parameterId = req.params.id as unknown as number;
      const parameter = await storage.getParameter(parameterId);
      if (!parameter) {
        return res.status(404).json({ message: "Parameter not found" });
      }
      if (parameter.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden: Cannot delete this parameter" });
      }
      await storage.deleteParameter(parameterId);
      res.status(204).send();
    } catch (error) {
      console.error(`Error deleting parameter ${req.params.id}:`, error);
      res.status(500).json({ message: "Server error deleting parameter" });
    }
  });

  // Nested Attribute routes within Parameter router
  parameterRouter.get("/:parameterId/attributes", validateRequest(ParameterIdParamSchema, 'params'), async (req, res) => {
    try {
      const parameterId = req.params.parameterId as unknown as number;
      const parameter = await storage.getParameter(parameterId);
      if (!parameter) {
        return res.status(404).json({ message: "Parameter not found" });
      }
      if (parameter.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden: Cannot view attributes for parameters you don't own" });
      }
      const attributes = await storage.getAttributesByParameterId(parameterId);
      res.json(attributes);
    } catch (error) {
      console.error(`Error fetching attributes for parameter ${req.params.parameterId}:`, error);
      res.status(500).json({ message: "Server error fetching attributes" });
    }
  });

  apiRouter.use("/parameters", parameterRouter); // Mount parameter router

  // --- Attribute Router (Standalone for POST, PATCH, DELETE by attribute ID) ---
  const attributeRouter = Router();
  attributeRouter.use(isAuthenticated);

  attributeRouter.post("/", validateRequest(insertAttributeSchema, 'body'), async (req, res) => {
    try {
      const attributeData = req.body;
      const parameter = await storage.getParameter(attributeData.parameterId);
      if (!parameter) {
        return res.status(404).json({ message: "Parameter not found" });
      }
      if (parameter.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden: Cannot add attributes to parameters you don't own" });
      }
      const attribute = await storage.createAttribute(attributeData);
      res.status(201).json(attribute);
    } catch (error) {
      console.error("Error creating attribute:", error);
      res.status(500).json({ message: "Server error creating attribute" });
    }
  });

  attributeRouter.patch("/:id", validateRequest(NumericIdParamSchema, 'params'), async (req, res) => {
    try {
      const attributeId = req.params.id as unknown as number;
      const attribute = await storage.getAttribute(attributeId);
      if (!attribute) {
        return res.status(404).json({ message: "Attribute not found" });
      }
      const parameter = await storage.getParameter(attribute.parameterId);
      if (!parameter) {
        return res.status(500).json({ message: "Internal error: Parent parameter not found" });
      }
      if (parameter.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden: Cannot modify attributes for parameters you don't own" });
      }
      // TODO: Validate req.body for partial update
      const updatedAttribute = await storage.updateAttribute(attributeId, req.body);
      res.json(updatedAttribute);
    } catch (error) {
      console.error(`Error updating attribute ${req.params.id}:`, error);
      res.status(500).json({ message: "Server error updating attribute" });
    }
  });

  attributeRouter.delete("/:id", validateRequest(NumericIdParamSchema, 'params'), async (req, res) => {
    try {
      const attributeId = req.params.id as unknown as number;
      const attribute = await storage.getAttribute(attributeId);
      if (!attribute) {
        return res.status(404).json({ message: "Attribute not found" });
      }
      const parameter = await storage.getParameter(attribute.parameterId);
      if (!parameter) {
        return res.status(500).json({ message: "Internal error: Parent parameter not found" });
      }
      if (parameter.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden: Cannot delete attributes for parameters you don't own" });
      }
      await storage.deleteAttribute(attributeId);
      res.status(204).send();
    } catch (error) {
      console.error(`Error deleting attribute ${req.params.id}:`, error);
      res.status(500).json({ message: "Server error deleting attribute" });
    }
  });

  apiRouter.use("/attributes", attributeRouter); // Mount attribute router

  // --- MorphBox Router ---
  const morphBoxRouter = Router();
  morphBoxRouter.use(isAuthenticated); // All box routes require login

  morphBoxRouter.post("/", validateRequest(insertMorphBoxSchema.omit({ userId: true, tenantId: true }), 'body'), async (req, res) => {
    try {
      const morphBoxData = {
        ...req.body,
        userId: req.user!.id,
        tenantId: req.user!.tenantId
      };
      if (!morphBoxData.tenantId) {
        return res.status(400).json({ message: "User must belong to a tenant to create a MorphBox." });
      }
      const morphBox = await storage.createMorphBox(morphBoxData);
      res.status(201).json(morphBox);
    } catch (error) {
      console.error("Error creating morphbox:", error);
      res.status(500).json({ message: "Server error creating morphbox" });
    }
  });

  morphBoxRouter.get("/", async (req, res) => {
    try {
      if (!req.user?.tenantId) {
        return res.status(400).json({ message: "Tenant context missing" });
      }
      const ownedBoxes = await storage.getMorphBoxesByUserId(req.user!.id);
      const sharedBoxes = await storage.getMorphBoxesSharedWithUser(req.user!.id);
      const allBoxesMap = new Map();
      ownedBoxes.forEach(box => allBoxesMap.set(box.id, box));
      sharedBoxes.forEach(box => allBoxesMap.set(box.id, box));
      res.json(Array.from(allBoxesMap.values()));
    } catch (error) {
      console.error("Error fetching morphboxes:", error);
      res.status(500).json({ message: "Server error fetching morphboxes" });
    }
  });

  morphBoxRouter.get("/shared", async (req, res) => {
    try {
      const sharedMorphBoxes = await storage.getMorphBoxesSharedWithUser(req.user!.id);
      res.json(sharedMorphBoxes);
    } catch (error) {
      console.error("Error fetching shared morphboxes:", error);
      res.status(500).json({ message: "Server error fetching shared morphboxes" });
    }
  });

  // Public boxes route - outside the authenticated router? Or keep here?
  // Moved outside isAuthenticated middleware for now
  // morphBoxRouter.get("/public", ...);

  morphBoxRouter.get("/:id", validateRequest(NumericIdParamSchema, 'params'), async (req, res) => {
    try {
      const morphBoxId = req.params.id as unknown as number;
      const morphBox = await storage.getMorphBox(morphBoxId);
      if (!morphBox) {
        return res.status(404).json({ message: "Morphological Box not found" });
      }
      if (!morphBox.isPublic && morphBox.tenantId !== req.user!.tenantId && !req.user!.isSuperAdmin) {
        return res.status(403).json({ message: "Forbidden: Box belongs to another tenant." });
      }
      const isOwner = morphBox.userId === req.user!.id;
      const isPublic = morphBox.isPublic;
      const sharedAccess = await storage.getSharedAccessByUserAndBox(req.user!.id, morphBoxId);
      if (!isOwner && !isPublic && !sharedAccess && !req.user!.isSuperAdmin) {
        return res.status(403).json({ message: "Forbidden: No access rights to this box." });
      }
      const fullMorphBox = await storage.getMorphBoxWithParameters(morphBoxId);
      res.json(fullMorphBox);
    } catch (error) {
      console.error(`Error fetching morphbox ${req.params.id}:`, error);
      res.status(500).json({ message: "Server error fetching morphbox" });
    }
  });

  morphBoxRouter.patch("/:id", validateRequest(NumericIdParamSchema, 'params'), async (req, res) => {
    try {
      const morphBoxId = req.params.id as unknown as number;
      const morphBox = await storage.getMorphBox(morphBoxId);
      if (!morphBox) {
        return res.status(404).json({ message: "Morphological Box not found" });
      }
      if (morphBox.tenantId !== req.user!.tenantId && !req.user!.isSuperAdmin) {
        return res.status(403).json({ message: "Forbidden: Box belongs to another tenant." });
      }
      const isOwner = morphBox.userId === req.user!.id;
      const sharedAccess = await storage.getSharedAccessByUserAndBox(req.user!.id, morphBoxId);
      const canEditShared = sharedAccess?.canEdit ?? false;
      if (!isOwner && !canEditShared && !req.user!.isSuperAdmin) {
        return res.status(403).json({ message: "Forbidden: Insufficient permissions to edit this box." });
      }
      const updateData = req.body; // TODO: Validate partial update
      delete updateData.userId;
      delete updateData.tenantId;
      const updatedMorphBox = await storage.updateMorphBox(morphBoxId, updateData);
      res.json(updatedMorphBox);
    } catch (error) {
      console.error(`Error updating morphbox ${req.params.id}:`, error);
      res.status(500).json({ message: "Server error updating morphbox" });
    }
  });

  morphBoxRouter.delete("/:id", validateRequest(NumericIdParamSchema, 'params'), async (req, res) => {
    try {
      const morphBoxId = req.params.id as unknown as number;
      const morphBox = await storage.getMorphBox(morphBoxId);
      if (!morphBox) {
        return res.status(404).json({ message: "Morphological Box not found" });
      }
      if (morphBox.tenantId !== req.user!.tenantId && !req.user!.isSuperAdmin) {
        return res.status(403).json({ message: "Forbidden: Box belongs to another tenant." });
      }
      if (morphBox.userId !== req.user!.id && !req.user!.isSuperAdmin) {
        return res.status(403).json({ message: "Forbidden: Only the owner can delete this box." });
      }
      await storage.deleteMorphBox(morphBoxId);
      res.status(204).send();
    } catch (error) {
      console.error(`Error deleting morphbox ${req.params.id}:`, error);
      res.status(500).json({ message: "Server error deleting morphbox" });
    }
  });

  apiRouter.use("/morphboxes", morphBoxRouter); // Mount morphbox router

  // Public boxes route (no authentication needed)
  apiRouter.get("/morphboxes/public", async (_req, res) => {
    try {
      const publicMorphBoxes = await storage.getPublicMorphBoxes();
      res.json(publicMorphBoxes);
    } catch (error) {
      console.error("Error fetching public morphboxes:", error);
      res.status(500).json({ message: "Server error fetching public morphboxes" });
    }
  });

  // --- Shared Access Router ---
  const sharedAccessRouter = Router();
  sharedAccessRouter.use(isAuthenticated);

  sharedAccessRouter.post("/", validateRequest(insertSharedAccessSchema, 'body'), async (req, res) => {
    try {
      const sharedData = req.body; // Already validated
      const morphBox = await storage.getMorphBox(sharedData.morphBoxId);
      if (!morphBox) {
        return res.status(404).json({ message: "Morphological Box not found" });
      }
      if (morphBox.tenantId !== req.user!.tenantId && !req.user!.isSuperAdmin) {
        return res.status(403).json({ message: "Forbidden: Box belongs to another tenant." });
      }
      if (morphBox.userId !== req.user!.id && !req.user!.isSuperAdmin) {
        return res.status(403).json({ message: "Forbidden: Only the owner can share this box." });
      }
      const targetUser = await storage.getUser(sharedData.userId);
      if (!targetUser) {
        return res.status(404).json({ message: "Target user not found" });
      }
      if (targetUser.tenantId !== req.user!.tenantId) {
        return res.status(403).json({ message: "Forbidden: Cannot share boxes outside your tenant." });
      }
      if (targetUser.id === req.user!.id) {
        return res.status(400).json({ message: "Cannot share a box with yourself." });
      }
      const existingShare = await storage.getSharedAccessByUserAndBox(sharedData.userId, sharedData.morphBoxId);
      if (existingShare) {
        return res.status(409).json({ message: "This box is already shared with this user." });
      }
      const sharedAccess = await storage.createSharedAccess(sharedData);
      res.status(201).json(sharedAccess);
    } catch (error) {
      console.error("Error creating shared access:", error);
      res.status(500).json({ message: "Server error creating shared access" });
    }
  });

  sharedAccessRouter.delete("/:id", validateRequest(NumericIdParamSchema, 'params'), async (req, res) => {
    try {
      const sharedId = req.params.id as unknown as number;
      const sharedAccess = await storage.getSharedAccessById(sharedId);
      if (!sharedAccess) {
        return res.status(404).json({ message: "Shared access entry not found" });
      }
      const morphBox = await storage.getMorphBox(sharedAccess.morphBoxId);
      if (!morphBox) {
        return res.status(404).json({ message: "Associated Morphological Box not found" });
      }
      if (morphBox.tenantId !== req.user!.tenantId && !req.user!.isSuperAdmin) {
        return res.status(403).json({ message: "Forbidden: Box belongs to another tenant." });
      }
      if (morphBox.userId !== req.user!.id && !req.user!.isSuperAdmin) {
        return res.status(403).json({ message: "Forbidden: Only the box owner can remove sharing permissions." });
      }
      await storage.deleteSharedAccess(sharedId);
      res.status(204).send();
    } catch (error) {
      console.error(`Error deleting shared access ${req.params.id}:`, error);
      res.status(500).json({ message: "Server error deleting shared access" });
    }
  });

  apiRouter.use("/shared", sharedAccessRouter); // Mount shared access router

  // --- Admin Router (Super Admin Only) ---
  const adminRouter = Router();
  adminRouter.use(isSuperAdmin); // All routes here require super admin

  adminRouter.get("/tenants", async (_req, res) => {
    try {
      const allTenants = await storage.getAllTenants();
      res.json(allTenants);
    } catch (error) {
      console.error("Error fetching all tenants:", error);
      res.status(500).json({ message: "Server error fetching tenants" });
    }
  });

  adminRouter.post("/tenants", validateRequest(CreateTenantWithAdminSchema, 'body'), async (req, res) => {
    try {
      const { adminUsername, adminEmail, adminPassword, ...tenantData } = req.body; // Validated data

      const existingTenant = await storage.getTenantBySlug(tenantData.slug);
      if (existingTenant) {
        return res.status(409).json({ message: "Tenant slug already exists." });
      }

      const newTenant = await storage.createTenant(tenantData);
      const { hashPassword } = await import("./auth");
      const passwordHash = await hashPassword(adminPassword);
      const adminUser = await storage.createUser({
        username: adminUsername,
        email: adminEmail,
        passwordHash: passwordHash,
        tenantId: newTenant.id,
        isTenantAdmin: true,
        isSuperAdmin: false,
        isActive: true,
      });
      const { passwordHash: _, ...safeAdminUser } = adminUser;
      res.status(201).json({ tenant: newTenant, user: safeAdminUser });
    } catch (error) {
      console.error("Error creating tenant:", error);
      res.status(500).json({ message: "Server error creating tenant" });
    }
  });

  adminRouter.patch("/tenants/:id/status", validateRequest(IdParamSchema, 'params'), validateRequest(TenantStatusUpdateSchema, 'body'), async (req, res) => {
    try {
      const tenantId = req.params.id; // Validated UUID string
      const { isActive } = req.body; // Validated boolean
      const updatedTenant = await storage.updateTenant(tenantId, { isActive });
      if (!updatedTenant) {
        return res.status(404).json({ message: "Tenant not found." });
      }
      res.json(updatedTenant);
    } catch (error) {
      console.error(`Error updating tenant status ${req.params.id}:`, error);
      res.status(500).json({ message: "Server error updating tenant status" });
    }
  });

  apiRouter.use("/admin", adminRouter); // Mount admin router

  // --- Tenant Router (Publicly accessible info) ---
  const tenantRouter = Router();

  tenantRouter.get("/search", async (req, res) => {
    try {
      const searchTerm = req.query.q as string;
      if (!searchTerm || searchTerm.length < 2) {
        return res.status(400).json({ message: "Search term must be at least 2 characters long." });
      }
      const tenants = await storage.searchTenants(searchTerm);
      res.json(tenants);
    } catch (error) {
      console.error("Error searching tenants:", error);
      res.status(500).json({ message: "Server error searching tenants" });
    }
  });

  tenantRouter.get("/:slug", validateRequest(SlugParamSchema, 'params'), async (req, res) => {
    try {
      const slug = req.params.slug; // Validated string
      const tenant = await storage.getTenantBySlug(slug);
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }
      // Return only public info if needed
      res.json(tenant);
    } catch (error) {
      console.error(`Error fetching tenant ${req.params.slug}:`, error);
      res.status(500).json({ message: "Server error fetching tenant" });
    }
  });

  apiRouter.use("/tenants", tenantRouter); // Mount tenant router

  // --- Mount Main API Router ---
  app.use("/api", apiRouter);

  // --- Server Creation ---
  const httpServer = createServer(app);
  return httpServer;
}
