import { z } from "zod";

export const insertUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export interface User extends InsertUser {
  id: string;
}

export const insertPropertySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  location: z.string().min(1, "Location is required"),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  area: z.number().positive().optional(),
  type: z.enum(["house", "apartment", "condo", "townhouse"]).default("house"),
  status: z.enum(["available", "sold", "rented"]).default("available"),
});

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export interface Property extends InsertProperty {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
