import {
  users, User, InsertUser,
  parameters, Parameter, InsertParameter,
  attributes, Attribute, InsertAttribute, 
  morphBoxes, MorphBox, InsertMorphBox,
  sharedAccess, SharedAccess, InsertSharedAccess,
  ParameterWithAttributes, MorphBoxWithParameters
} from "@shared/schema";
import { IStorage } from "./storage";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool, db } from "./db";
import { eq, and, desc, asc, sql } from "drizzle-orm";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: any; // Using any type for SessionStore to avoid TypeScript error

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true,
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount > 0;
  }
  
  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }
  
  // Parameter operations
  async createParameter(insertParameter: InsertParameter): Promise<Parameter> {
    const [parameter] = await db.insert(parameters).values(insertParameter).returning();
    return parameter;
  }
  
  async updateParameter(id: number, parameterData: Partial<Parameter>): Promise<Parameter | undefined> {
    const [parameter] = await db.update(parameters)
      .set(parameterData)
      .where(eq(parameters.id, id))
      .returning();
    return parameter;
  }
  
  async getParameter(id: number): Promise<Parameter | undefined> {
    const [parameter] = await db.select().from(parameters).where(eq(parameters.id, id));
    return parameter;
  }
  
  async getParametersByUserId(userId: number): Promise<Parameter[]> {
    return db.select().from(parameters).where(eq(parameters.userId, userId));
  }
  
  async deleteParameter(id: number): Promise<boolean> {
    // Delete associated attributes
    await db.delete(attributes).where(eq(attributes.parameterId, id));
    
    // Delete the parameter
    const result = await db.delete(parameters).where(eq(parameters.id, id));
    return result.rowCount > 0;
  }
  
  // Attribute operations
  async createAttribute(insertAttribute: InsertAttribute): Promise<Attribute> {
    const [attribute] = await db.insert(attributes).values(insertAttribute).returning();
    return attribute;
  }
  
  async updateAttribute(id: number, attributeData: Partial<Attribute>): Promise<Attribute | undefined> {
    const [attribute] = await db.update(attributes)
      .set(attributeData)
      .where(eq(attributes.id, id))
      .returning();
    return attribute;
  }
  
  async getAttribute(id: number): Promise<Attribute | undefined> {
    const [attribute] = await db.select().from(attributes).where(eq(attributes.id, id));
    return attribute;
  }
  
  async getAttributesByParameterId(parameterId: number): Promise<Attribute[]> {
    return db.select().from(attributes).where(eq(attributes.parameterId, parameterId));
  }
  
  async deleteAttribute(id: number): Promise<boolean> {
    const result = await db.delete(attributes).where(eq(attributes.id, id));
    return result.rowCount > 0;
  }
  
  // Morphological Box operations
  async createMorphBox(insertMorphBox: InsertMorphBox): Promise<MorphBox> {
    const [morphBox] = await db.insert(morphBoxes).values(insertMorphBox).returning();
    return morphBox;
  }
  
  async updateMorphBox(id: number, morphBoxData: Partial<MorphBox>): Promise<MorphBox | undefined> {
    const updatedData = {
      ...morphBoxData,
      updatedAt: new Date()
    };
    
    const [morphBox] = await db.update(morphBoxes)
      .set(updatedData)
      .where(eq(morphBoxes.id, id))
      .returning();
    return morphBox;
  }
  
  async getMorphBox(id: number): Promise<MorphBox | undefined> {
    const [morphBox] = await db.select().from(morphBoxes).where(eq(morphBoxes.id, id));
    return morphBox;
  }
  
  async getMorphBoxesByUserId(userId: number): Promise<MorphBox[]> {
    return db.select()
      .from(morphBoxes)
      .where(eq(morphBoxes.userId, userId))
      .orderBy(desc(morphBoxes.updatedAt));
  }
  
  async getMorphBoxWithParameters(id: number): Promise<MorphBoxWithParameters | undefined> {
    const [morphBox] = await db.select().from(morphBoxes).where(eq(morphBoxes.id, id));
    if (!morphBox) return undefined;
    
    const params = await db.select().from(parameters).where(eq(parameters.userId, morphBox.userId));
    const parametersWithAttributes: ParameterWithAttributes[] = [];
    
    for (const param of params) {
      const attrs = await db.select().from(attributes).where(eq(attributes.parameterId, param.id));
      parametersWithAttributes.push({
        ...param,
        attributes: attrs
      });
    }
    
    return {
      ...morphBox,
      parameters: parametersWithAttributes
    };
  }
  
  async deleteMorphBox(id: number): Promise<boolean> {
    // Delete associated shared access entries
    await db.delete(sharedAccess).where(eq(sharedAccess.morphBoxId, id));
    
    // Delete the morphological box
    const result = await db.delete(morphBoxes).where(eq(morphBoxes.id, id));
    return result.rowCount > 0;
  }
  
  async getPublicMorphBoxes(): Promise<MorphBox[]> {
    return db.select()
      .from(morphBoxes)
      .where(eq(morphBoxes.isPublic, true))
      .orderBy(desc(morphBoxes.updatedAt));
  }
  
  // Shared Access operations
  async createSharedAccess(insertSharedAccess: InsertSharedAccess): Promise<SharedAccess> {
    const [access] = await db.insert(sharedAccess).values(insertSharedAccess).returning();
    return access;
  }
  
  async updateSharedAccess(id: number, sharedAccessData: Partial<SharedAccess>): Promise<SharedAccess | undefined> {
    const [access] = await db.update(sharedAccess)
      .set(sharedAccessData)
      .where(eq(sharedAccess.id, id))
      .returning();
    return access;
  }
  
  async getSharedAccessByUserAndBox(userId: number, morphBoxId: number): Promise<SharedAccess | undefined> {
    const [access] = await db.select()
      .from(sharedAccess)
      .where(and(
        eq(sharedAccess.userId, userId),
        eq(sharedAccess.morphBoxId, morphBoxId)
      ));
    return access;
  }
  
  async getSharedAccessesByUserId(userId: number): Promise<SharedAccess[]> {
    return db.select()
      .from(sharedAccess)
      .where(eq(sharedAccess.userId, userId));
  }
  
  async getMorphBoxesSharedWithUser(userId: number): Promise<MorphBox[]> {
    const boxes = await db
      .select({
        box: morphBoxes
      })
      .from(morphBoxes)
      .innerJoin(
        sharedAccess,
        and(
          eq(sharedAccess.morphBoxId, morphBoxes.id),
          eq(sharedAccess.userId, userId)
        )
      )
      .orderBy(desc(morphBoxes.updatedAt));
    
    return boxes.map(item => item.box);
  }
  
  async deleteSharedAccess(id: number): Promise<boolean> {
    const result = await db.delete(sharedAccess).where(eq(sharedAccess.id, id));
    return result.rowCount > 0;
  }
}