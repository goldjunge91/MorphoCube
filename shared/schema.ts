import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  json,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// --- Compatibility matrix types (Moved from inside shared_access definition) ---
export type CompatibilityLevel = -2 | -1 | 0 | 1 | 2; // -2: Impossible, -1: Difficult, 0: Neutral, 1: Good, 2: Excellent

export interface AttributeCompatibility {
  attribute1Id: number;
  attribute2Id: number;
  level: CompatibilityLevel;
  reason?: string;
}

export interface CombinationConstraint {
  id: number;
  attributeId: number;
  requiredAttributeIds?: number[];
  excludedAttributeIds?: number[];
  minScore?: number;
  maxScore?: number;
}

export interface TRIZPrinciple {
  id: number;
  name: string;
  description: string;
  applicableToAttributeIds: number[];
}

export interface CombinationScore {
  technicalScore: number;
  innovationScore: number;
  compatibilityScore: number;
  trizScore: number;
  constraintsSatisfied: boolean;
}
// --- End of moved types ---

// Tenant (Kunde) Tabelle
export const tenants = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  plan: varchar("plan", { length: 50 }).notNull().default("free"),
  maxUsers: integer("max_users").notNull().default(5),
  isActive: boolean("is_active").notNull().default(true),
  logoUrl: text("logo_url"),
  primaryColor: varchar("primary_color", { length: 20 }),
  secondaryColor: varchar("secondary_color", { length: 20 }),
  domain: varchar("domain", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  boxes: many(morphBoxes),
}));

// Erweiterte Benutzertabelle mit Tenant-Beziehung
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  username: varchar("username", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  isTenantAdmin: boolean("is_tenant_admin").notNull().default(false),
  isSuperAdmin: boolean("is_super_admin").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
  parameters: many(parameters),
  ownedMorphBoxes: many(morphBoxes),
  sharedAccessEntries: many(sharedAccess),
  // Weitere Relationen...
}));

// Tenant-Einladungen
export const tenantInvitations = pgTable("tenant_invitations", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  role: varchar("role", { length: 50 }).notNull().default("user"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User model
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email("Ungültige E-Mail-Adresse"),
  username: z.string().min(3, "Benutzername muss mindestens 3 Zeichen haben"),
  passwordHash: z.string(),
}).pick({
  username: true,
  passwordHash: true,
  email: true,
  isAdmin: true,
  isTenantAdmin: true,
  isSuperAdmin: true,
  tenantId: true,
  isActive: true,
});

// Parameter model
export const parameters = pgTable("parameters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
});

export const parametersRelations = relations(parameters, ({ one }) => ({
  user: one(users, {
    fields: [parameters.userId],
    references: [users.id],
  }),
}));

export const insertParameterSchema = createInsertSchema(parameters).pick({
  name: true,
  color: true,
  userId: true,
});

// Attribute model
export const attributes = pgTable("attributes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  parameterId: integer("parameter_id")
    .notNull()
    .references(() => parameters.id, { onDelete: "cascade" }),
});

export const insertAttributeSchema = createInsertSchema(attributes).pick({
  name: true,
  parameterId: true,
});

// Morphological Box model
export const morphBoxes = pgTable("morph_boxes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  isPublic: boolean("is_public").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  content: json("content").default({}).notNull(),
});

export const morphBoxesRelations = relations(morphBoxes, ({ one, many }) => ({
  user: one(users, {
    fields: [morphBoxes.userId],
    references: [users.id],
  }),
  tenant: one(tenants, {
    fields: [morphBoxes.tenantId],
    references: [tenants.id],
  }),
  sharedAccessEntries: many(sharedAccess),
}));

export const insertMorphBoxSchema = createInsertSchema(morphBoxes).pick({
  title: true,
  description: true,
  userId: true,
  tenantId: true,
  isPublic: true,
  content: true,
});

// Shared Access model
export const sharedAccess = pgTable("shared_access", {
  id: serial("id").primaryKey(),
  morphBoxId: integer("morph_box_id").references(() => morphBoxes.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  canEdit: boolean("can_edit").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),

  // Note: The TypeScript type definitions previously here were moved to the top of the file
  // as they caused a syntax error inside the pgTable definition.
});

export const sharedAccessRelations = relations(sharedAccess, ({ one }) => ({
  morphBox: one(morphBoxes, {
    fields: [sharedAccess.morphBoxId],
    references: [morphBoxes.id],
  }),
  user: one(users, {
    fields: [sharedAccess.userId],
    references: [users.id],
  }),
}));

export const insertSharedAccessSchema = createInsertSchema(sharedAccess).pick({
  morphBoxId: true,
  userId: true,
  canEdit: true,
});

// Zod Schemas
export const insertTenantSchema = createInsertSchema(tenants, {
  name: z.string().min(2, "Name muss mindestens 2 Zeichen haben"),
  slug: z.string().min(2, "Slug muss mindestens 2 Zeichen haben")
    .regex(/^[a-z0-9-]+$/, "Slug darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten"),
  plan: z.enum(["free", "basic", "premium", "enterprise"]),
  maxUsers: z.number().min(1, "Mindestens 1 Benutzer muss erlaubt sein"),
});

// Schema for Tenant Registration Form (includes admin user creation)
export const registerTenantSchema = z.object({
  name: z.string().min(2, "Name muss mindestens 2 Zeichen haben"),
  slug: z.string().min(2, "Slug muss mindestens 2 Zeichen haben")
    .regex(/^[a-z0-9-]+$/, "Slug darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten"),
  plan: z.enum(["free", "basic", "premium", "enterprise"]),
  admin_username: z.string().min(3, "Admin-Benutzername muss mindestens 3 Zeichen haben"),
  admin_email: z.string().email("Ungültige Admin-E-Mail-Adresse"),
  admin_password: z.string().min(6, "Admin-Passwort muss mindestens 6 Zeichen haben"),
  confirm_password: z.string().min(6, "Passwortbestätigung erforderlich"),
}).refine(data => data.admin_password === data.confirm_password, {
  message: "Passwörter stimmen nicht überein",
  path: ["confirm_password"],
});

// Neue Schemas für Login mit Tenant
export const loginWithTenantSchema = z.object({
  tenantSlug: z.string().min(1, "Tenant ist erforderlich"),
  username: z.string().min(3, "Benutzername muss mindestens 3 Zeichen haben"),
  password: z.string().min(6, "Passwort muss mindestens 6 Zeichen haben"),
});

// Erweiterte Benutzer-Schemas
export const userResponseSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  isAdmin: z.boolean(),
  isTenantAdmin: z.boolean(),
  isSuperAdmin: z.boolean(),
  tenant: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    plan: z.string(),
  }),
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

export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = typeof tenants.$inferInsert;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type LoginWithTenant = z.infer<typeof loginWithTenantSchema>;
export type RegisterTenant = z.infer<typeof registerTenantSchema>;

// Custom types for frontend
export type ParameterWithAttributes = Parameter & { attributes: Attribute[]; };
export type MorphBoxWithParameters = MorphBox & {
  parameters: ParameterWithAttributes[];
};
