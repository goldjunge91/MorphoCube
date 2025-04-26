import {
  User,
  InsertUser,
  Parameter,
  InsertParameter,
  Attribute,
  InsertAttribute,
  MorphBox,
  InsertMorphBox,
  SharedAccess,
  InsertSharedAccess,
  ParameterWithAttributes,
  MorphBoxWithParameters,
  Tenant, // Import Tenant type
  InsertTenant, // Import InsertTenant type
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { DatabaseStorage } from "./database-storage";
const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // Tenant operations
  createTenant(insertTenant: InsertTenant): Promise<Tenant>;
  getTenantBySlug(slug: string): Promise<Tenant | undefined>;
  searchTenants(searchTerm: string): Promise<Tenant[]>;
  getAllTenants(): Promise<Tenant[]>; // Added getAllTenants signature

  // User operations
  getUser(id: string): Promise<User | undefined>; // Changed id to string
  getUserByUsername(username: string): Promise<User | undefined>; // Keep username as string
  getUserByUsernameAndTenant(username: string, tenantId: string): Promise<User | undefined>; // Add this
  getUserByEmail(email: string): Promise<User | undefined>; // Keep email as string
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User | undefined>; // Changed id to string
  deleteUser(id: string): Promise<boolean>; // Changed id to string
  getAllUsers(): Promise<User[]>;
  getUsersByTenantId(tenantId: string): Promise<User[]>; // Add this

  // Parameter operations
  createParameter(parameter: InsertParameter): Promise<Parameter>;
  updateParameter(
    id: number, // Parameter ID is number (serial)
    parameter: Partial<Parameter>,
  ): Promise<Parameter | undefined>;
  getParameter(id: number): Promise<Parameter | undefined>; // Parameter ID is number (serial)
  getParametersByUserId(userId: string): Promise<ParameterWithAttributes[]>; // Changed userId to string
  deleteParameter(id: number): Promise<boolean>; // Parameter ID is number (serial)

  // Attribute operations
  createAttribute(attribute: InsertAttribute): Promise<Attribute>;
  updateAttribute(
    id: number, // Attribute ID is number (serial)
    attribute: Partial<Attribute>,
  ): Promise<Attribute | undefined>;
  getAttribute(id: number): Promise<Attribute | undefined>; // Attribute ID is number (serial)
  getAttributesByParameterId(parameterId: number): Promise<Attribute[]>; // Parameter ID is number (serial)
  deleteAttribute(id: number): Promise<boolean>; // Attribute ID is number (serial)

  // Morphological Box operations
  createMorphBox(morphBox: InsertMorphBox): Promise<MorphBox>;
  updateMorphBox(
    id: number, // MorphBox ID is number (serial)
    morphBox: Partial<MorphBox>,
  ): Promise<MorphBox | undefined>;
  getMorphBox(id: number): Promise<MorphBox | undefined>; // MorphBox ID is number (serial)
  getMorphBoxesByUserId(userId: string): Promise<MorphBox[]>; // Changed userId to string
  getMorphBoxWithParameters(
    id: number, // MorphBox ID is number (serial)
  ): Promise<MorphBoxWithParameters | undefined>;
  deleteMorphBox(id: number): Promise<boolean>; // MorphBox ID is number (serial)
  getPublicMorphBoxes(): Promise<MorphBox[]>;

  // Shared Access operations
  createSharedAccess(sharedAccess: InsertSharedAccess): Promise<SharedAccess>;
  updateSharedAccess(
    id: number, // SharedAccess ID is number (serial)
    sharedAccess: Partial<SharedAccess>,
  ): Promise<SharedAccess | undefined>;
  getSharedAccessByUserAndBox(
    userId: string, // Changed userId to string
    morphBoxId: number, // MorphBox ID is number (serial)
  ): Promise<SharedAccess | undefined>;
  getSharedAccessesByUserId(userId: string): Promise<SharedAccess[]>; // Changed userId to string
  getSharedAccessById(id: number): Promise<SharedAccess | undefined>; // SharedAccess ID is number (serial)
  getMorphBoxesSharedWithUser(userId: string): Promise<MorphBox[]>; // Changed userId to string
  deleteSharedAccess(id: number): Promise<boolean>; // SharedAccess ID is number (serial)

  sessionStore: any;
}

// MemStorage needs significant updates to handle UUIDs (strings) for users/tenants
// and relationships. For now, focusing on DatabaseStorage.
// export class MemStorage implements IStorage {
//   // ... existing MemStorage code ...
//   // NOTE: This implementation is likely incompatible now due to UUIDs and relations.
//   // It needs to be updated or removed if only DatabaseStorage is used.

//   // --- Placeholder implementations for new Tenant/User methods ---
//   async createTenant(insertTenant: InsertTenant): Promise<Tenant> { throw new Error("MemStorage.createTenant not implemented"); }
//   async getTenantBySlug(slug: string): Promise<Tenant | undefined> { throw new Error("MemStorage.getTenantBySlug not implemented"); }
//   async searchTenants(searchTerm: string): Promise<Tenant[]> { throw new Error("MemStorage.searchTenants not implemented"); }
//   async getUserByUsernameAndTenant(username: string, tenantId: string): Promise<User | undefined> { throw new Error("MemStorage.getUserByUsernameAndTenant not implemented"); }
//   async getUsersByTenantId(tenantId: string): Promise<User[]> { throw new Error("MemStorage.getUsersByTenantId not implemented"); }

//   // --- Update existing User methods for string ID ---
//   private users: Map<string, User>; // Changed key to string
//   private userCounter: number; // Still used for generating *something*, but ID is UUID

//   constructor() {
//     this.users = new Map(); // Key is now string
//     // ... other initializations ...
//     this.userCounter = 1; // This counter is less relevant for UUIDs
//     // ... other counter initializations ...

//     this.sessionStore = new MemoryStore({
//       checkPeriod: 86400000, // prune expired entries every 24h
//     });
//   }
//   getUserByUsername(username: string): Promise<User | undefined> {
//     throw new Error("Method not implemented.");
//   }
//   getUserByEmail(email: string): Promise<User | undefined> {
//     throw new Error("Method not implemented.");
//   }
//   getAllUsers(): Promise<User[]> {
//     throw new Error("Method not implemented.");
//   }
//   createParameter(parameter: InsertParameter): Promise<Parameter> {
//     throw new Error("Method not implemented.");
//   }
//   updateParameter(id: number, parameter: Partial<Parameter>): Promise<Parameter | undefined> {
//     throw new Error("Method not implemented.");
//   }
//   getParameter(id: number): Promise<Parameter | undefined> {
//     throw new Error("Method not implemented.");
//   }
//   deleteParameter(id: number): Promise<boolean> {
//     throw new Error("Method not implemented.");
//   }
//   createAttribute(attribute: InsertAttribute): Promise<Attribute> {
//     throw new Error("Method not implemented.");
//   }
//   updateAttribute(id: number, attribute: Partial<Attribute>): Promise<Attribute | undefined> {
//     throw new Error("Method not implemented.");
//   }
//   getAttribute(id: number): Promise<Attribute | undefined> {
//     throw new Error("Method not implemented.");
//   }
//   getAttributesByParameterId(parameterId: number): Promise<Attribute[]> {
//     throw new Error("Method not implemented.");
//   }
//   deleteAttribute(id: number): Promise<boolean> {
//     throw new Error("Method not implemented.");
//   }
//   createMorphBox(morphBox: InsertMorphBox): Promise<MorphBox> {
//     throw new Error("Method not implemented.");
//   }
//   updateMorphBox(id: number, morphBox: Partial<MorphBox>): Promise<MorphBox | undefined> {
//     throw new Error("Method not implemented.");
//   }
//   getMorphBox(id: number): Promise<MorphBox | undefined> {
//     throw new Error("Method not implemented.");
//   }
//   getMorphBoxWithParameters(id: number): Promise<MorphBoxWithParameters | undefined> {
//     throw new Error("Method not implemented.");
//   }
//   deleteMorphBox(id: number): Promise<boolean> {
//     throw new Error("Method not implemented.");
//   }
//   getPublicMorphBoxes(): Promise<MorphBox[]> {
//     throw new Error("Method not implemented.");
//   }
//   createSharedAccess(sharedAccess: InsertSharedAccess): Promise<SharedAccess> {
//     throw new Error("Method not implemented.");
//   }
//   updateSharedAccess(id: number, sharedAccess: Partial<SharedAccess>): Promise<SharedAccess | undefined> {
//     throw new Error("Method not implemented.");
//   }
//   getSharedAccessById(id: number): Promise<SharedAccess | undefined> {
//     throw new Error("Method not implemented.");
//   }
//   deleteSharedAccess(id: number): Promise<boolean> {
//     throw new Error("Method not implemented.");
//   }
//   sessionStore: any;

//   async getUser(id: string): Promise<User | undefined> { // Changed id to string
//     return this.users.get(id);
//   }

//   // getUserByUsername/Email remain the same logic (iterate values)

//   async createUser(insertUser: InsertUser): Promise<User> {
//     const id = crypto.randomUUID(); // Generate UUID for user ID
//     const now = new Date();
//     const user: User = {
//       // Ensure all required fields from the User type are present
//       id,
//       tenantId: insertUser.tenantId ?? null, // Handle potential null tenantId
//       email: insertUser.email,
//       username: insertUser.username,
//       passwordHash: insertUser.passwordHash, // Assuming passwordHash is provided
//       isAdmin: insertUser.isAdmin ?? false,
//       isTenantAdmin: insertUser.isTenantAdmin ?? false,
//       isSuperAdmin: false, // Default super admin to false
//       isActive: insertUser.isActive ?? true,
//       lastLogin: null, // Default lastLogin to null
//       createdAt: now,
//       updatedAt: now,
//     };
//     this.users.set(id, user);
//     return user;
//   }

//   async updateUser(
//     id: string, // Changed id to string
//     userData: Partial<User>,
//   ): Promise<User | undefined> {
//     const user = this.users.get(id);
//     if (!user) return undefined;

//     // Ensure 'id' and 'createdAt' are not overwritten
//     const { id: _, createdAt: __, ...updateData } = userData;

//     const updatedUser: User = {
//       ...user,
//       ...updateData,
//       updatedAt: new Date(), // Always update 'updatedAt'
//     };
//     this.users.set(id, updatedUser);
//     return updatedUser;
//   }

//   async deleteUser(id: string): Promise<boolean> { // Changed id to string
//     // Also need to handle related data (parameters, boxes, shared access) in MemStorage
//     console.warn("MemStorage.deleteUser does not cascade deletes.");
//     return this.users.delete(id);
//   }

//   // getAllUsers remains the same logic (iterate values)

//   // --- Update methods using userId ---

//   async getParametersByUserId(userId: string): Promise<ParameterWithAttributes[]> { // Changed userId to string
//     // ... implementation needs update for string comparison ...
//     throw new Error("MemStorage.getParametersByUserId needs update for string IDs.");
//   }

//   async getMorphBoxesByUserId(userId: string): Promise<MorphBox[]> { // Changed userId to string
//     // ... implementation needs update for string comparison ...
//     throw new Error("MemStorage.getMorphBoxesByUserId needs update for string IDs.");
//   }

//   async getSharedAccessByUserAndBox(userId: string, morphBoxId: number): Promise<SharedAccess | undefined> { // Changed userId to string
//     // ... implementation needs update for string comparison ...
//     throw new Error("MemStorage.getSharedAccessByUserAndBox needs update for string IDs.");
//   }

//   async getSharedAccessesByUserId(userId: string): Promise<SharedAccess[]> { // Changed userId to string
//     // ... implementation needs update for string comparison ...
//     throw new Error("MemStorage.getSharedAccessesByUserId needs update for string IDs.");
//   }

//   async getMorphBoxesSharedWithUser(userId: string): Promise<MorphBox[]> { // Changed userId to string
//     // ... implementation needs update for string IDs ...
//     throw new Error("MemStorage.getMorphBoxesSharedWithUser needs update for string IDs.");
//   }

//   // ... rest of MemStorage ...
// }


// Use the DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
