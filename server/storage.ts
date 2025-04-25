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
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { DatabaseStorage } from "./database-storage";
const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;

  // Parameter operations
  createParameter(parameter: InsertParameter): Promise<Parameter>;
  updateParameter(
    id: number,
    parameter: Partial<Parameter>,
  ): Promise<Parameter | undefined>;
  getParameter(id: number): Promise<Parameter | undefined>;
  getParametersByUserId(userId: number): Promise<ParameterWithAttributes[]>;
  deleteParameter(id: number): Promise<boolean>;

  // Attribute operations
  createAttribute(attribute: InsertAttribute): Promise<Attribute>;
  updateAttribute(
    id: number,
    attribute: Partial<Attribute>,
  ): Promise<Attribute | undefined>;
  getAttribute(id: number): Promise<Attribute | undefined>;
  getAttributesByParameterId(parameterId: number): Promise<Attribute[]>;
  deleteAttribute(id: number): Promise<boolean>;

  // Morphological Box operations
  createMorphBox(morphBox: InsertMorphBox): Promise<MorphBox>;
  updateMorphBox(
    id: number,
    morphBox: Partial<MorphBox>,
  ): Promise<MorphBox | undefined>;
  getMorphBox(id: number): Promise<MorphBox | undefined>;
  getMorphBoxesByUserId(userId: number): Promise<MorphBox[]>;
  getMorphBoxWithParameters(
    id: number,
  ): Promise<MorphBoxWithParameters | undefined>;
  deleteMorphBox(id: number): Promise<boolean>;
  getPublicMorphBoxes(): Promise<MorphBox[]>;

  // Shared Access operations
  createSharedAccess(sharedAccess: InsertSharedAccess): Promise<SharedAccess>;
  updateSharedAccess(
    id: number,
    sharedAccess: Partial<SharedAccess>,
  ): Promise<SharedAccess | undefined>;
  getSharedAccessByUserAndBox(
    userId: number,
    morphBoxId: number,
  ): Promise<SharedAccess | undefined>;
  getSharedAccessesByUserId(userId: number): Promise<SharedAccess[]>;
  getMorphBoxesSharedWithUser(userId: number): Promise<MorphBox[]>;
  deleteSharedAccess(id: number): Promise<boolean>;

  sessionStore: any;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private parameters: Map<number, Parameter>;
  private attributes: Map<number, Attribute>;
  private morphBoxes: Map<number, MorphBox>;
  private sharedAccesses: Map<number, SharedAccess>;

  sessionStore: any; // Using any type for session store

  private userCounter: number;
  private parameterCounter: number;
  private attributeCounter: number;
  private morphBoxCounter: number;
  private sharedAccessCounter: number;

  constructor() {
    this.users = new Map();
    this.parameters = new Map();
    this.attributes = new Map();
    this.morphBoxes = new Map();
    this.sharedAccesses = new Map();

    this.userCounter = 1;
    this.parameterCounter = 1;
    this.attributeCounter = 1;
    this.morphBoxCounter = 1;
    this.sharedAccessCounter = 1;

    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCounter++;
    const now = new Date();
    const user: User = {
      id,
      ...insertUser,
      createdAt: now,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(
    id: number,
    userData: Partial<User>,
  ): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Parameter operations
  async createParameter(insertParameter: InsertParameter): Promise<Parameter> {
    const id = this.parameterCounter++;
    const parameter: Parameter = { id, ...insertParameter };
    this.parameters.set(id, parameter);
    return parameter;
  }

  async updateParameter(
    id: number,
    parameterData: Partial<Parameter>,
  ): Promise<Parameter | undefined> {
    const parameter = this.parameters.get(id);
    if (!parameter) return undefined;

    const updatedParameter = { ...parameter, ...parameterData };
    this.parameters.set(id, updatedParameter);
    return updatedParameter;
  }

  async getParameter(id: number): Promise<Parameter | undefined> {
    return this.parameters.get(id);
  }

  async getParametersByUserId(
    userId: number,
  ): Promise<ParameterWithAttributes[]> {
    const userParameters = Array.from(this.parameters.values()).filter(
      (parameter) => parameter.userId === userId,
    );

    const result: ParameterWithAttributes[] = [];
    for (const param of userParameters) {
      const paramAttributes = await this.getAttributesByParameterId(param.id);
      result.push({
        ...param,
        attributes: paramAttributes,
      });
    }
    return result;
  }
  async deleteParameter(id: number): Promise<boolean> {
    // Delete associated attributes
    Array.from(this.attributes.values())
      .filter((attr) => attr.parameterId === id)
      .forEach((attr) => this.attributes.delete(attr.id));

    return this.parameters.delete(id);
  }
  // Attribute operations
  async createAttribute(insertAttribute: InsertAttribute): Promise<Attribute> {
    const id = this.attributeCounter++;
    const attribute: Attribute = { id, ...insertAttribute };
    this.attributes.set(id, attribute);
    return attribute;
  }

  async updateAttribute(
    id: number,
    attributeData: Partial<Attribute>,
  ): Promise<Attribute | undefined> {
    const attribute = this.attributes.get(id);
    if (!attribute) return undefined;

    const updatedAttribute = { ...attribute, ...attributeData };
    this.attributes.set(id, updatedAttribute);
    return updatedAttribute;
  }

  async getAttribute(id: number): Promise<Attribute | undefined> {
    return this.attributes.get(id);
  }

  async getAttributesByParameterId(parameterId: number): Promise<Attribute[]> {
    return Array.from(this.attributes.values()).filter(
      (attribute) => attribute.parameterId === parameterId,
    );
  }

  async deleteAttribute(id: number): Promise<boolean> {
    return this.attributes.delete(id);
  }

  // Morphological Box operations
  async createMorphBox(insertMorphBox: InsertMorphBox): Promise<MorphBox> {
    const id = this.morphBoxCounter++;
    const now = new Date();
    const morphBox: MorphBox = {
      id,
      ...insertMorphBox,
      createdAt: now,
      updatedAt: now,
    };
    this.morphBoxes.set(id, morphBox);
    return morphBox;
  }

  async updateMorphBox(
    id: number,
    morphBoxData: Partial<MorphBox>,
  ): Promise<MorphBox | undefined> {
    const morphBox = this.morphBoxes.get(id);
    if (!morphBox) return undefined;

    const updatedMorphBox = {
      ...morphBox,
      ...morphBoxData,
      updatedAt: new Date(),
    };
    this.morphBoxes.set(id, updatedMorphBox);
    return updatedMorphBox;
  }

  async getMorphBox(id: number): Promise<MorphBox | undefined> {
    return this.morphBoxes.get(id);
  }

  async getMorphBoxesByUserId(userId: number): Promise<MorphBox[]> {
    return Array.from(this.morphBoxes.values()).filter(
      (morphBox) => morphBox.userId === userId,
    );
  }

  async getMorphBoxWithParameters(
    id: number,
  ): Promise<MorphBoxWithParameters | undefined> {
    const morphBox = this.morphBoxes.get(id);
    if (!morphBox) return undefined;

    const parameters = await this.getParametersByUserId(morphBox.userId);
    const parametersWithAttributes: ParameterWithAttributes[] = [];

    for (const parameter of parameters) {
      const attributes = await this.getAttributesByParameterId(parameter.id);
      parametersWithAttributes.push({
        ...parameter,
        attributes,
      });
    }

    return {
      ...morphBox,
      parameters: parametersWithAttributes,
    };
  }

  async deleteMorphBox(id: number): Promise<boolean> {
    // Delete associated shared access entries
    Array.from(this.sharedAccesses.values())
      .filter((access) => access.morphBoxId === id)
      .forEach((access) => this.sharedAccesses.delete(access.id));

    return this.morphBoxes.delete(id);
  }

  async getPublicMorphBoxes(): Promise<MorphBox[]> {
    return Array.from(this.morphBoxes.values()).filter((box) => box.isPublic);
  }

  // Shared Access operations
  async createSharedAccess(
    insertSharedAccess: InsertSharedAccess,
  ): Promise<SharedAccess> {
    const id = this.sharedAccessCounter++;
    const now = new Date();
    const sharedAccess: SharedAccess = {
      id,
      ...insertSharedAccess,
      createdAt: now,
    };
    this.sharedAccesses.set(id, sharedAccess);
    return sharedAccess;
  }

  async updateSharedAccess(
    id: number,
    sharedAccessData: Partial<SharedAccess>,
  ): Promise<SharedAccess | undefined> {
    const sharedAccess = this.sharedAccesses.get(id);
    if (!sharedAccess) return undefined;

    const updatedSharedAccess = { ...sharedAccess, ...sharedAccessData };
    this.sharedAccesses.set(id, updatedSharedAccess);
    return updatedSharedAccess;
  }

  async getSharedAccessByUserAndBox(
    userId: number,
    morphBoxId: number,
  ): Promise<SharedAccess | undefined> {
    return Array.from(this.sharedAccesses.values()).find(
      (access) => access.userId === userId && access.morphBoxId === morphBoxId,
    );
  }

  async getSharedAccessesByUserId(userId: number): Promise<SharedAccess[]> {
    return Array.from(this.sharedAccesses.values()).filter(
      (access) => access.userId === userId,
    );
  }

  async getMorphBoxesSharedWithUser(userId: number): Promise<MorphBox[]> {
    const sharedAccesses = await this.getSharedAccessesByUserId(userId);
    return sharedAccesses
      .map((access) => this.morphBoxes.get(access.morphBoxId))
      .filter((box): box is MorphBox => box !== undefined);
  }

  async deleteSharedAccess(id: number): Promise<boolean> {
    return this.sharedAccesses.delete(id);
  }
}

// Use the DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
