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
import { Store } from "express-session";

const MemoryStore = createMemoryStore(session);

// Interface für Storage-Implementierungen
export interface IStorage {
  sessionStore: Store;

  // Tenant Operations
  createTenant(insertTenant: InsertTenant): Promise<Tenant>;
  getTenant(id: string): Promise<Tenant | undefined>;
  getTenantBySlug(slug: string): Promise<Tenant | undefined>;
  getAllTenants(): Promise<Tenant[]>;
  updateTenant(id: string, tenantData: Partial<InsertTenant>): Promise<Tenant | undefined>;
  searchTenants(searchTerm: string): Promise<Tenant[]>;

  // User Operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsernameAndTenant(username: string, tenantId: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUser(id: string, userData: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  getUsersByTenantId(tenantId: string): Promise<User[]>;

  // Parameter Operations
  createParameter(insertParameter: InsertParameter): Promise<Parameter>;
  updateParameter(id: string, parameterData: Partial<Parameter>): Promise<Parameter | undefined>;
  getParameter(id: string): Promise<Parameter | undefined>;
  getParametersByUserId(userId: string): Promise<ParameterWithAttributes[]>;
  deleteParameter(id: string): Promise<boolean>;

  // Attribute Operations
  createAttribute(insertAttribute: InsertAttribute): Promise<Attribute>;
  updateAttribute(id: string, attributeData: Partial<Attribute>): Promise<Attribute | undefined>;
  getAttribute(id: string): Promise<Attribute | undefined>;
  getAttributesByParameterId(parameterId: string): Promise<Attribute[]>;
  deleteAttribute(id: string): Promise<boolean>;

  // Morphological Box Operations
  createMorphBox(insertMorphBox: InsertMorphBox): Promise<MorphBox>;
  updateMorphBox(id: string, morphBoxData: Partial<MorphBox>): Promise<MorphBox | undefined>;
  getMorphBox(id: string): Promise<MorphBox | undefined>;
  getMorphBoxesByUserId(userId: string): Promise<MorphBox[]>;
  getMorphBoxWithParameters(id: string): Promise<MorphBoxWithParameters | undefined>;
  deleteMorphBox(id: string): Promise<boolean>;
  getPublicMorphBoxes(): Promise<MorphBox[]>;

  // Shared Access Operations
  createSharedAccess(insertSharedAccess: InsertSharedAccess): Promise<SharedAccess>;
  updateSharedAccess(id: string, sharedAccessData: Partial<SharedAccess>): Promise<SharedAccess | undefined>;
  getSharedAccessById(id: string): Promise<SharedAccess | undefined>;
  getSharedAccessByUserAndBox(userId: string, morphBoxId: string): Promise<SharedAccess | undefined>;
  getSharedAccessesByUserId(userId: string): Promise<SharedAccess[]>;
  getMorphBoxesSharedWithUser(userId: string): Promise<MorphBox[]>;
  deleteSharedAccess(id: string): Promise<boolean>;
}

// Eine Variable zum Exportieren der aktiven Storage-Implementierung
export let storage: IStorage;

// Funktion, um die Storage-Implementierung zu initialisieren
export const initialize = async (): Promise<void> => {
  const { DatabaseStorage } = await import('./database-storage');
  storage = new DatabaseStorage();
};
