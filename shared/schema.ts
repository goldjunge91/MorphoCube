import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users)
  .pick({
    username: true,
    password: true,
    email: true,
    isAdmin: true,
  });

// Parameter model
export const parameters = pgTable("parameters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  userId: integer("user_id").notNull(),
});

export const insertParameterSchema = createInsertSchema(parameters)
  .pick({
    name: true,
    color: true,
    userId: true,
  });

// Attribute model
export const attributes = pgTable("attributes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  parameterId: integer("parameter_id").notNull(),
});

export const insertAttributeSchema = createInsertSchema(attributes)
  .pick({
    name: true,
    parameterId: true,
  });

// Morphological Box model
export const morphBoxes = pgTable("morph_boxes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  userId: integer("user_id").notNull(),
  isPublic: boolean("is_public").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  // Store the box structure as JSON
  content: json("content").default({}).notNull(),
});

export const insertMorphBoxSchema = createInsertSchema(morphBoxes)
  .pick({
    title: true,
    description: true,
    userId: true,
    isPublic: true,
    content: true,
  });

// Shared Access model
export const sharedAccess = pgTable("shared_access", {
  id: serial("id").primaryKey(),
  morphBoxId: integer("morph_box_id").notNull(),
  userId: integer("user_id").notNull(),
  canEdit: boolean("can_edit").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSharedAccessSchema = createInsertSchema(sharedAccess)
  .pick({
    morphBoxId: true,
    userId: true,
    canEdit: true,
  });

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Parameter = typeof parameters.$inferSelect;
export type InsertParameter = z.infer<typeof insertParameterSchema>;

export type Attribute = typeof attributes.$inferSelect;
export type InsertAttribute = z.infer<typeof insertAttributeSchema>;

export type MorphBox = typeof morphBoxes.$inferSelect;
export type InsertMorphBox = z.infer<typeof insertMorphBoxSchema>;

export type SharedAccess = typeof sharedAccess.$inferSelect;
export type InsertSharedAccess = z.infer<typeof insertSharedAccessSchema>;

// Custom types for frontend
export type ParameterWithAttributes = Parameter & { attributes: Attribute[] };
export type MorphBoxWithParameters = MorphBox & { parameters: ParameterWithAttributes[] };
