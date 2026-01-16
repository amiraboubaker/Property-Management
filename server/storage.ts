import { type InsertProperty, type InsertUser, type Property, type User } from "@shared/schema";
import { randomUUID } from "crypto";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  location: { type: String, required: true },
  bedrooms: Number,
  bathrooms: Number,
  area: Number,
  type: { type: String, enum: ["house", "apartment", "condo", "townhouse"], default: "house" },
  status: { type: String, enum: ["available", "sold", "rented"], default: "available" },
}, { timestamps: true });

const UserModel = mongoose.models.User || mongoose.model("User", userSchema);
const PropertyModel = mongoose.models.Property || mongoose.model("Property", propertySchema);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getProperty(id: string): Promise<Property | undefined>;
  getProperties(): Promise<Property[]>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: string, property: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(id: string): Promise<boolean>;
}

export class MongoStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    try {
      const user = await UserModel.findById(id);
      if (!user) return undefined;
      return { ...user.toObject(), id: user._id.toString() } as User;
    } catch (e) {
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ username });
    if (!user) return undefined;
    return { ...user.toObject(), id: user._id.toString() } as User;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user = await UserModel.create(insertUser);
    return { ...user.toObject(), id: user._id.toString() } as User;
  }

  async getProperty(id: string): Promise<Property | undefined> {
    try {
      const property = await PropertyModel.findById(id);
      if (!property) return undefined;
      return { ...property.toObject(), id: property._id.toString() } as Property;
    } catch (e) {
      return undefined;
    }
  }

  async getProperties(): Promise<Property[]> {
    const properties = await PropertyModel.find();
    return properties.map(p => ({ ...p.toObject(), id: p._id.toString() } as Property));
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const property = await PropertyModel.create(insertProperty);
    return { ...property.toObject(), id: property._id.toString() } as Property;
  }

  async updateProperty(id: string, updateData: Partial<InsertProperty>): Promise<Property | undefined> {
    try {
      const property = await PropertyModel.findByIdAndUpdate(id, updateData, { new: true });
      if (!property) return undefined;
      return { ...property.toObject(), id: property._id.toString() } as Property;
    } catch (e) {
      return undefined;
    }
  }

  async deleteProperty(id: string): Promise<boolean> {
    try {
      const result = await PropertyModel.findByIdAndDelete(id);
      return !!result;
    } catch (e) {
      return false;
    }
  }
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private properties: Map<string, Property>;

  constructor() {
    this.users = new Map();
    this.properties = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getProperty(id: string): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async getProperties(): Promise<Property[]> {
    return Array.from(this.properties.values());
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = randomUUID();
    const now = new Date();
    const property: Property = {
      ...insertProperty,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.properties.set(id, property);
    return property;
  }

  async updateProperty(id: string, updateData: Partial<InsertProperty>): Promise<Property | undefined> {
    const existing = this.properties.get(id);
    if (!existing) return undefined;

    const updated: Property = {
      ...existing,
      ...updateData,
      updatedAt: new Date()
    };
    this.properties.set(id, updated);
    return updated;
  }

  async deleteProperty(id: string): Promise<boolean> {
    return this.properties.delete(id);
  }
}

export class HybridStorage implements IStorage {
  private memStorage: MemStorage;
  private mongoStorage: MongoStorage;

  constructor() {
    this.memStorage = new MemStorage();
    this.mongoStorage = new MongoStorage();
  }

  private get active(): IStorage {
    return mongoose.connection.readyState === 1 ? this.mongoStorage : this.memStorage;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.active.getUser(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.active.getUserByUsername(username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    return this.active.createUser(insertUser);
  }

  async getProperty(id: string): Promise<Property | undefined> {
    return this.active.getProperty(id);
  }

  async getProperties(): Promise<Property[]> {
    return this.active.getProperties();
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    return this.active.createProperty(property);
  }

  async updateProperty(id: string, property: Partial<InsertProperty>): Promise<Property | undefined> {
    return this.active.updateProperty(id, property);
  }

  async deleteProperty(id: string): Promise<boolean> {
    return this.active.deleteProperty(id);
  }
}

export const storage = new HybridStorage();
