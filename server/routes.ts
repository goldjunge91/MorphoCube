import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { 
  insertParameterSchema, 
  insertAttributeSchema, 
  insertMorphBoxSchema,
  insertSharedAccessSchema
} from "@shared/schema";

// Authentication middleware
function isAuthenticated(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).send("Unauthorized");
}

// Admin middleware
function isAdmin(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated() && req.user!.isAdmin) {
    return next();
  }
  res.status(403).send("Forbidden");
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // User routes
  app.get("/api/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove passwords before sending
      const safeUsers = users.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      res.status(500).send("Server error");
    }
  });

  app.get("/api/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).send("User not found");
      }
      
      // Remove password before sending
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).send("Server error");
    }
  });

  app.patch("/api/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updateData = req.body;
      
      // Don't allow password updates through this endpoint
      delete updateData.password;
      
      const updatedUser = await storage.updateUser(userId, updateData);
      
      if (!updatedUser) {
        return res.status(404).send("User not found");
      }
      
      // Remove password before sending
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).send("Server error");
    }
  });

  app.delete("/api/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const success = await storage.deleteUser(userId);
      
      if (!success) {
        return res.status(404).send("User not found");
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).send("Server error");
    }
  });

  // Parameter routes
  app.post("/api/parameters", isAuthenticated, async (req, res) => {
    try {
      const paramData = insertParameterSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      const parameter = await storage.createParameter(paramData);
      res.status(201).json(parameter);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).send("Server error");
    }
  });

  app.get("/api/parameters", isAuthenticated, async (req, res) => {
    try {
      const parameters = await storage.getParametersByUserId(req.user!.id);
      res.json(parameters);
    } catch (error) {
      res.status(500).send("Server error");
    }
  });

  app.get("/api/parameters/:id", isAuthenticated, async (req, res) => {
    try {
      const parameterId = parseInt(req.params.id);
      const parameter = await storage.getParameter(parameterId);
      
      if (!parameter) {
        return res.status(404).send("Parameter not found");
      }
      
      // Check if user has access to this parameter
      if (parameter.userId !== req.user!.id && !req.user!.isAdmin) {
        return res.status(403).send("Forbidden");
      }
      
      res.json(parameter);
    } catch (error) {
      res.status(500).send("Server error");
    }
  });

  app.patch("/api/parameters/:id", isAuthenticated, async (req, res) => {
    try {
      const parameterId = parseInt(req.params.id);
      const parameter = await storage.getParameter(parameterId);
      
      if (!parameter) {
        return res.status(404).send("Parameter not found");
      }
      
      // Check if user has access to update this parameter
      if (parameter.userId !== req.user!.id && !req.user!.isAdmin) {
        return res.status(403).send("Forbidden");
      }
      
      const updatedParameter = await storage.updateParameter(parameterId, req.body);
      res.json(updatedParameter);
    } catch (error) {
      res.status(500).send("Server error");
    }
  });

  app.delete("/api/parameters/:id", isAuthenticated, async (req, res) => {
    try {
      const parameterId = parseInt(req.params.id);
      const parameter = await storage.getParameter(parameterId);
      
      if (!parameter) {
        return res.status(404).send("Parameter not found");
      }
      
      // Check if user has access to delete this parameter
      if (parameter.userId !== req.user!.id && !req.user!.isAdmin) {
        return res.status(403).send("Forbidden");
      }
      
      await storage.deleteParameter(parameterId);
      res.status(204).send();
    } catch (error) {
      res.status(500).send("Server error");
    }
  });

  // Attribute routes
  app.post("/api/attributes", isAuthenticated, async (req, res) => {
    try {
      const attributeData = insertAttributeSchema.parse(req.body);
      
      // Verify user has access to the parameter
      const parameter = await storage.getParameter(attributeData.parameterId);
      if (!parameter) {
        return res.status(404).send("Parameter not found");
      }
      
      if (parameter.userId !== req.user!.id && !req.user!.isAdmin) {
        return res.status(403).send("Forbidden");
      }
      
      const attribute = await storage.createAttribute(attributeData);
      res.status(201).json(attribute);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).send("Server error");
    }
  });

  app.get("/api/parameters/:parameterId/attributes", isAuthenticated, async (req, res) => {
    try {
      const parameterId = parseInt(req.params.parameterId);
      
      // Verify parameter exists and user has access
      const parameter = await storage.getParameter(parameterId);
      if (!parameter) {
        return res.status(404).send("Parameter not found");
      }
      
      if (parameter.userId !== req.user!.id && !req.user!.isAdmin) {
        return res.status(403).send("Forbidden");
      }
      
      const attributes = await storage.getAttributesByParameterId(parameterId);
      res.json(attributes);
    } catch (error) {
      res.status(500).send("Server error");
    }
  });

  app.patch("/api/attributes/:id", isAuthenticated, async (req, res) => {
    try {
      const attributeId = parseInt(req.params.id);
      const attribute = await storage.getAttribute(attributeId);
      
      if (!attribute) {
        return res.status(404).send("Attribute not found");
      }
      
      // Verify user has access to the parameter
      const parameter = await storage.getParameter(attribute.parameterId);
      if (!parameter) {
        return res.status(404).send("Parameter not found");
      }
      
      if (parameter.userId !== req.user!.id && !req.user!.isAdmin) {
        return res.status(403).send("Forbidden");
      }
      
      const updatedAttribute = await storage.updateAttribute(attributeId, req.body);
      res.json(updatedAttribute);
    } catch (error) {
      res.status(500).send("Server error");
    }
  });

  app.delete("/api/attributes/:id", isAuthenticated, async (req, res) => {
    try {
      const attributeId = parseInt(req.params.id);
      const attribute = await storage.getAttribute(attributeId);
      
      if (!attribute) {
        return res.status(404).send("Attribute not found");
      }
      
      // Verify user has access to the parameter
      const parameter = await storage.getParameter(attribute.parameterId);
      if (!parameter) {
        return res.status(404).send("Parameter not found");
      }
      
      if (parameter.userId !== req.user!.id && !req.user!.isAdmin) {
        return res.status(403).send("Forbidden");
      }
      
      await storage.deleteAttribute(attributeId);
      res.status(204).send();
    } catch (error) {
      res.status(500).send("Server error");
    }
  });

  // Morphological Box routes
  app.post("/api/morphboxes", isAuthenticated, async (req, res) => {
    try {
      const morphBoxData = insertMorphBoxSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      const morphBox = await storage.createMorphBox(morphBoxData);
      res.status(201).json(morphBox);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).send("Server error");
    }
  });

  app.get("/api/morphboxes", isAuthenticated, async (req, res) => {
    try {
      const morphBoxes = await storage.getMorphBoxesByUserId(req.user!.id);
      res.json(morphBoxes);
    } catch (error) {
      res.status(500).send("Server error");
    }
  });

  app.get("/api/morphboxes/shared", isAuthenticated, async (req, res) => {
    try {
      const sharedMorphBoxes = await storage.getMorphBoxesSharedWithUser(req.user!.id);
      res.json(sharedMorphBoxes);
    } catch (error) {
      res.status(500).send("Server error");
    }
  });

  app.get("/api/morphboxes/public", async (req, res) => {
    try {
      const publicMorphBoxes = await storage.getPublicMorphBoxes();
      res.json(publicMorphBoxes);
    } catch (error) {
      res.status(500).send("Server error");
    }
  });

  app.get("/api/morphboxes/:id", isAuthenticated, async (req, res) => {
    try {
      const morphBoxId = parseInt(req.params.id);
      const morphBox = await storage.getMorphBox(morphBoxId);
      
      if (!morphBox) {
        return res.status(404).send("Morphological Box not found");
      }
      
      // Check if user has access to this box
      const isOwner = morphBox.userId === req.user!.id;
      const isPublic = morphBox.isPublic;
      const sharedAccess = await storage.getSharedAccessByUserAndBox(req.user!.id, morphBoxId);
      
      if (!isOwner && !isPublic && !sharedAccess && !req.user!.isAdmin) {
        return res.status(403).send("Forbidden");
      }
      
      const fullMorphBox = await storage.getMorphBoxWithParameters(morphBoxId);
      res.json(fullMorphBox);
    } catch (error) {
      res.status(500).send("Server error");
    }
  });

  app.patch("/api/morphboxes/:id", isAuthenticated, async (req, res) => {
    try {
      const morphBoxId = parseInt(req.params.id);
      const morphBox = await storage.getMorphBox(morphBoxId);
      
      if (!morphBox) {
        return res.status(404).send("Morphological Box not found");
      }
      
      // Check if user has edit access to this box
      const isOwner = morphBox.userId === req.user!.id;
      const sharedAccess = await storage.getSharedAccessByUserAndBox(req.user!.id, morphBoxId);
      const canEdit = sharedAccess && sharedAccess.canEdit;
      
      if (!isOwner && !canEdit && !req.user!.isAdmin) {
        return res.status(403).send("Forbidden");
      }
      
      const updatedMorphBox = await storage.updateMorphBox(morphBoxId, req.body);
      res.json(updatedMorphBox);
    } catch (error) {
      res.status(500).send("Server error");
    }
  });

  app.delete("/api/morphboxes/:id", isAuthenticated, async (req, res) => {
    try {
      const morphBoxId = parseInt(req.params.id);
      const morphBox = await storage.getMorphBox(morphBoxId);
      
      if (!morphBox) {
        return res.status(404).send("Morphological Box not found");
      }
      
      // Check if user has delete access to this box (only owner or admin)
      if (morphBox.userId !== req.user!.id && !req.user!.isAdmin) {
        return res.status(403).send("Forbidden");
      }
      
      await storage.deleteMorphBox(morphBoxId);
      res.status(204).send();
    } catch (error) {
      res.status(500).send("Server error");
    }
  });

  // Shared Access routes
  app.post("/api/shared", isAuthenticated, async (req, res) => {
    try {
      const sharedData = insertSharedAccessSchema.parse(req.body);
      
      // Verify the morphbox exists and user has access to share it
      const morphBox = await storage.getMorphBox(sharedData.morphBoxId);
      if (!morphBox) {
        return res.status(404).send("Morphological Box not found");
      }
      
      if (morphBox.userId !== req.user!.id && !req.user!.isAdmin) {
        return res.status(403).send("Forbidden");
      }
      
      // Check if the target user exists
      const targetUser = await storage.getUser(sharedData.userId);
      if (!targetUser) {
        return res.status(404).send("Target user not found");
      }
      
      const sharedAccess = await storage.createSharedAccess(sharedData);
      res.status(201).json(sharedAccess);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).send("Server error");
    }
  });

  app.delete("/api/shared/:id", isAuthenticated, async (req, res) => {
    try {
      const sharedId = parseInt(req.params.id);
      
      // First get the shared access
      const sharedAccess = await storage.getSharedAccessById(sharedId);
      if (!sharedAccess) {
        return res.status(404).send("Shared access not found");
      }
      
      // Verify the user has rights to remove this access
      const morphBox = await storage.getMorphBox(sharedAccess.morphBoxId);
      if (!morphBox) {
        return res.status(404).send("Morphological Box not found");
      }
      
      if (morphBox.userId !== req.user!.id && !req.user!.isAdmin) {
        return res.status(403).send("Forbidden");
      }
      
      await storage.deleteSharedAccess(sharedId);
      res.status(204).send();
    } catch (error) {
      res.status(500).send("Server error");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
