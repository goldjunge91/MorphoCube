import {
  users,
  User,
  InsertUser,
  parameters,
  Parameter,
  InsertParameter,
  attributes,
  Attribute,
  InsertAttribute,
  morphBoxes,
  MorphBox,
  InsertMorphBox,
  sharedAccess,
  SharedAccess,
  InsertSharedAccess,
  ParameterWithAttributes,
  MorphBoxWithParameters,
  tenants, // Import tenants table
  Tenant, // Import Tenant type
  InsertTenant, // Import InsertTenant type
} from "@shared/schema";
import { IStorage } from "./storage";
import session from "express-session";
import connectPg from "connect-pg-simple";
import memorystore from "memorystore";
import { db } from "./db";
import { eq, and, desc, asc, sql, ilike } from "drizzle-orm"; // Import ilike for case-insensitive search
import { Pool } from 'pg';

// Erstelle Connect-Stores
const PostgresSessionStore = connectPg(session);
const MemoryStore = memorystore(session);

// Prüfe, ob wir uns in einer Entwicklungsumgebung befinden
const isDevelopment = process.env.NODE_ENV !== 'production';

export class DatabaseStorage implements IStorage {
  sessionStore: any; // Using any type for SessionStore to avoid TypeScript error

  constructor() {
    if (isDevelopment) {
      console.log("Verwende Memory-Session-Store für Entwicklungsumgebung");
      // Verwende Memory-Store in der Entwicklungsumgebung
      this.sessionStore = new MemoryStore({
        checkPeriod: 86400000 // Bereinige abgelaufene Einträge nach 24h
      });
    } else {
      console.log("Verwende PostgreSQL-Session-Store für Produktionsumgebung");
      // Erstelle eine separate Pool-Instanz für die Sitzungsspeicherung in Produktion
      const session_pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      });

      this.sessionStore = new PostgresSessionStore({
        pool: session_pool,
        createTableIfMissing: true,
      });
    }
  }

  // --- Tenant Operations ---
  async createTenant(insertTenant: InsertTenant): Promise<Tenant> { // Use specific types
    const [tenant] = await db.insert(tenants).values(insertTenant).returning();
    return tenant;
  }

  async getTenant(id: string): Promise<Tenant | undefined> { // Added getTenant by ID
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant;
  }

  async getTenantBySlug(slug: string): Promise<Tenant | undefined> { // Use specific types
    const [tenant] = await db.select().from(tenants).where(eq(tenants.slug, slug));
    return tenant;
  }

  async getAllTenants(): Promise<Tenant[]> { // Added missing method
    return db.select().from(tenants).orderBy(asc(tenants.name));
  }

  async updateTenant(id: string, tenantData: Partial<InsertTenant>): Promise<Tenant | undefined> { // Added updateTenant
    const { id: _, createdAt: __, slug: ___, ...updateData } = tenantData; // Prevent changing id, createdAt, slug
    const [tenant] = await db
      .update(tenants)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(tenants.id, id))
      .returning();
    return tenant;
  }

  async searchTenants(searchTerm: string): Promise<Tenant[]> { // Use specific types
    return db
      .select()
      .from(tenants)
      .where(ilike(tenants.name, `%${searchTerm}%`)) // Case-insensitive search on name
      .limit(10); // Limit results
  }

  // --- User Operations ---
  async getUser(id: string): Promise<User | undefined> { // id is string (UUID)
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsernameAndTenant(username: string, tenantId: string): Promise<User | undefined> { // Added method
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.username, username), eq(users.tenantId, tenantId)));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // This might need refinement if usernames are not unique across tenants
    console.warn("getUserByUsername called without tenant context. Usernames might not be unique globally.");
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    // This might need refinement if emails are not unique across tenants
    console.warn("getUserByEmail called without tenant context. Emails might not be unique globally.");
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Ensure passwordHash is provided
    if (!insertUser.passwordHash) {
      throw new Error("Password hash is required to create a user.");
    }
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(
    id: string, // id is string (UUID)
    userData: Partial<User>,
  ): Promise<User | undefined> {
    // Ensure 'id' and 'createdAt' are not overwritten, and update 'updatedAt'
    const { id: _, createdAt: __, ...updateData } = userData;
    const [user] = await db
      .update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<boolean> { // id is string (UUID)
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getAllUsers(): Promise<User[]> {
    // Consider adding tenant filtering here if needed for specific admin views
    return db.select().from(users);
  }

  async getUsersByTenantId(tenantId: string): Promise<User[]> { // Added method
    return db.select().from(users).where(eq(users.tenantId, tenantId));
  }

  // --- Parameter Operations ---
  async createParameter(insertParameter: InsertParameter): Promise<Parameter> {
    const [parameter] = await db
      .insert(parameters)
      .values(insertParameter)
      .returning();
    return parameter;
  }

  async updateParameter(
    id: string, // ID ist jetzt string gemäß Interface
    parameterData: Partial<Parameter>,
  ): Promise<Parameter | undefined> {
    const [parameter] = await db
      .update(parameters)
      .set(parameterData)
      .where(eq(parameters.id, id))
      .returning();
    return parameter;
  }

  async getParameter(id: string): Promise<Parameter | undefined> { // ID ist jetzt string gemäß Interface
    const [parameter] = await db
      .select()
      .from(parameters)
      .where(eq(parameters.id, id));
    return parameter;
  }

  async getParametersByUserId(
    userId: string, // userId ist string (UUID)
  ): Promise<ParameterWithAttributes[]> {
    // 1. Parameter für den Benutzer abrufen
    const userParameters = await db
      .select()
      .from(parameters)
      .where(eq(parameters.userId, userId)) // Vergleiche UUID string mit string
      .orderBy(asc(parameters.name)); // Optional: Sortieren

    // 2. Für jeden Parameter die zugehörigen Attribute abrufen und kombinieren
    const parametersWithAttributes: ParameterWithAttributes[] = [];
    for (const param of userParameters) {
      const attrs = await db
        .select()
        .from(attributes)
        .where(eq(attributes.parameterId, param.id)) // param.id ist string (UUID)
        .orderBy(asc(attributes.name)); // Optional: Sortieren

      parametersWithAttributes.push({
        ...param,
        attributes: attrs,
      });
    }

    return parametersWithAttributes;
  }

  async deleteParameter(id: string): Promise<boolean> { // ID ist jetzt string gemäß Interface
    // Lösche den Parameter
    const result = await db.delete(parameters).where(eq(parameters.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // --- Attribute Operations ---
  async createAttribute(insertAttribute: InsertAttribute): Promise<Attribute> {
    const [attribute] = await db
      .insert(attributes)
      .values(insertAttribute)
      .returning();
    return attribute;
  }

  async updateAttribute(
    id: string, // ID ist jetzt string gemäß Interface
    attributeData: Partial<Attribute>,
  ): Promise<Attribute | undefined> {
    const [attribute] = await db
      .update(attributes)
      .set(attributeData)
      .where(eq(attributes.id, id))
      .returning();
    return attribute;
  }

  async getAttribute(id: string): Promise<Attribute | undefined> { // ID ist jetzt string gemäß Interface
    const [attribute] = await db
      .select()
      .from(attributes)
      .where(eq(attributes.id, id));
    return attribute;
  }

  async getAttributesByParameterId(parameterId: string): Promise<Attribute[]> { // parameterId ist jetzt string
    return db
      .select()
      .from(attributes)
      .where(eq(attributes.parameterId, parameterId));
  }

  async deleteAttribute(id: string): Promise<boolean> { // ID ist jetzt string gemäß Interface
    const result = await db.delete(attributes).where(eq(attributes.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // --- Morphological Box Operations ---
  async createMorphBox(insertMorphBox: InsertMorphBox): Promise<MorphBox> {
    const [morphBox] = await db
      .insert(morphBoxes)
      .values(insertMorphBox)
      .returning();
    return morphBox;
  }

  async updateMorphBox(
    id: string, // ID ist jetzt string gemäß Interface
    morphBoxData: Partial<MorphBox>,
  ): Promise<MorphBox | undefined> {
    const updatedData = {
      ...morphBoxData,
      updatedAt: new Date(),
    };

    const [morphBox] = await db
      .update(morphBoxes)
      .set(updatedData)
      .where(eq(morphBoxes.id, id))
      .returning();
    return morphBox;
  }

  async getMorphBox(id: string): Promise<MorphBox | undefined> { // ID ist jetzt string gemäß Interface
    const [morphBox] = await db
      .select()
      .from(morphBoxes)
      .where(eq(morphBoxes.id, id));
    return morphBox;
  }

  async getMorphBoxesByUserId(userId: string): Promise<MorphBox[]> { // userId ist string (UUID)
    return db
      .select()
      .from(morphBoxes)
      .where(eq(morphBoxes.userId, userId)) // Vergleiche UUID string mit string
      .orderBy(desc(morphBoxes.updatedAt));
  }

  async getMorphBoxWithParameters(
    id: string, // ID ist jetzt string gemäß Interface
  ): Promise<MorphBoxWithParameters | undefined> {
    const [morphBox] = await db
      .select()
      .from(morphBoxes)
      .where(eq(morphBoxes.id, id));
    if (!morphBox) return undefined;

    // Fetch parameters belonging to the box owner
    const params = await db
      .select()
      .from(parameters)
      .where(eq(parameters.userId, morphBox.userId)); // morphBox.userId ist string
    const parametersWithAttributes: ParameterWithAttributes[] = [];

    for (const param of params) {
      const attrs = await db
        .select()
        .from(attributes)
        .where(eq(attributes.parameterId, param.id)); // param.id ist string
      parametersWithAttributes.push({
        ...param,
        attributes: attrs,
      });
    }

    return {
      ...morphBox,
      parameters: parametersWithAttributes,
    };
  }

  async deleteMorphBox(id: string): Promise<boolean> { // ID ist jetzt string gemäß Interface
    // Delete associated shared access entries first due to potential FK constraints
    await db.delete(sharedAccess).where(eq(sharedAccess.morphBoxId, id));

    // Delete the morphological box
    const result = await db.delete(morphBoxes).where(eq(morphBoxes.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getPublicMorphBoxes(): Promise<MorphBox[]> {
    return db
      .select()
      .from(morphBoxes)
      .where(eq(morphBoxes.isPublic, true))
      .orderBy(desc(morphBoxes.updatedAt));
  }

  // --- Shared Access Operations ---
  async createSharedAccess(
    insertSharedAccess: InsertSharedAccess,
  ): Promise<SharedAccess> {
    const [access] = await db
      .insert(sharedAccess)
      .values(insertSharedAccess)
      .returning();
    return access;
  }

  async updateSharedAccess(
    id: string, // ID ist jetzt string gemäß Interface
    sharedAccessData: Partial<SharedAccess>,
  ): Promise<SharedAccess | undefined> {
    const [access] = await db
      .update(sharedAccess)
      .set(sharedAccessData)
      .where(eq(sharedAccess.id, id))
      .returning();
    return access;
  }

  async getSharedAccessById(id: string): Promise<SharedAccess | undefined> { // ID ist jetzt string gemäß Interface
    const [access] = await db
      .select()
      .from(sharedAccess)
      .where(eq(sharedAccess.id, id));
    return access;
  }

  async getSharedAccessByUserAndBox(
    userId: string, // userId ist string (UUID)
    morphBoxId: string, // morphBoxId ist jetzt string gemäß Interface
  ): Promise<SharedAccess | undefined> {
    const [access] = await db
      .select()
      .from(sharedAccess)
      .where(
        and(
          eq(sharedAccess.userId, userId), // Vergleiche UUID string mit string
          eq(sharedAccess.morphBoxId, morphBoxId), // Vergleiche string
        ),
      );
    return access;
  }

  async getSharedAccessesByUserId(userId: string): Promise<SharedAccess[]> { // userId ist string (UUID)
    return db
      .select()
      .from(sharedAccess)
      .where(eq(sharedAccess.userId, userId)); // Vergleiche UUID string mit string
  }

  async getMorphBoxesSharedWithUser(userId: string): Promise<MorphBox[]> { // userId ist string (UUID)
    const boxes = await db
      .select({
        box: morphBoxes,
      })
      .from(morphBoxes)
      .innerJoin(
        sharedAccess,
        and(
          eq(sharedAccess.morphBoxId, morphBoxes.id), // Vergleiche string mit string
          eq(sharedAccess.userId, userId), // Vergleiche UUID string mit string
        ),
      )
      .orderBy(desc(morphBoxes.updatedAt));

    return boxes.map((item) => item.box);
  }

  async deleteSharedAccess(id: string): Promise<boolean> { // ID ist jetzt string gemäß Interface
    const result = await db.delete(sharedAccess).where(eq(sharedAccess.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}
