import { z } from "zod";
import mongoose from "mongoose";

// Helper function to check if a string is a valid MongoDB ObjectId
const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

const productBodySchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(150, { message: "Name must be at most 150 characters" }),
  description: z
    .string()
    .min(2, { message: "Description must be at least 2 characters" })
    .max(1000, { message: "Description must be at most 1000 characters" }),
  price: z
    .number()
    .gte(0, { message: "Price must be greater than or equal to 0" })
    .lte(1500000, { message: "Price must be at most 1,500,000" }),
  stock: z
    .number()
    .gt(0, { message: "Stock must be greater than 0" })
    .lte(1000000, { message: "Stock must be at most 1,000,000" }),
  category: z
    .string()
    .min(2, { message: "Category must be at least 2 characters" }),
  subCategory: z
    .array(z.string())
    .nonempty({ message: "At least one subcategory is required" }),
  brand: z.string().min(2, { message: "Brand must be at least 2 characters" }),
  images: z.array(z.string()).optional(),
  reviews: z
    .array(
      z.string().refine(isValidObjectId, {
        message: "Review ID must be a valid ObjectId",
      })
    )
    .optional(),
});

const productParamsSchema = z.object({
  id: z.string().refine(isValidObjectId, {
    message: "Product ID must be a valid ObjectId",
  }),
});

const productQuerySchema = z.object({
  search: z.string().optional(),
  sortBy: z.string().optional(),
  order: z.string().optional(),
  limit: z.string().optional(),
  page: z.string().optional(),
  cat: z.string().optional(),
  subCat: z.union([z.string(), z.array(z.string())]).optional(),
});

// Schemas for various endpoints
export const addProductSchema = z.object({
  body: productBodySchema,
});

export const updateProductSchema = z.object({
  body: productBodySchema.partial(),
  params: productParamsSchema,
});

export const getAllProductListSchema = z.object({
  query: productQuerySchema,
});

export const getProductSchema = z.object({
  params: productParamsSchema,
});

export const deleteProductSchema = z.object({
  params: productParamsSchema,
});

// Reserve products schema for internal order service calls
export const reserveProductsSchema = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          product: z.string().refine(isValidObjectId, {
            message: "Product ID must be a valid ObjectId",
          }),
          quantity: z
            .number()
            .positive({ message: "Quantity must be positive" }),
        })
      )
      .min(1, { message: "At least one product is required" }),
  }),
});

export const categorySchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, { message: "Name must be at least 2 characters" })
      .max(50, { message: "Name must be at most 50 characters" }),
    subCategory: z.array(z.string()).optional(),
  }),
});

export const categoryParamsSchema = z.object({
  params: z.object({
    id: z.string().refine(isValidObjectId, {
      message: "Category ID must be a valid ObjectId",
    }),
  }),
});

export const subCategorySchema = z.object({
  params: z.object({
    id: z.string().refine(isValidObjectId, {
      message: "Category ID must be a valid ObjectId",
    }),
  }),
  body: z.object({
    name: z
      .string()
      .min(2, { message: "Name must be at least 2 characters" })
      .max(50, { message: "Name must be at most 50 characters" }),
  }),
});

export const updateSubCategorySchema = z.object({
  params: z.object({
    id: z.string().refine(isValidObjectId, {
      message: "Category ID must be a valid ObjectId",
    }),
  }),
  body: z.object({
    oldName: z
      .string()
      .min(2, { message: "Old name must be at least 2 characters" }),
    newName: z
      .string()
      .min(2, { message: "New name must be at least 2 characters" })
      .max(50, { message: "New name must be at most 50 characters" }),
  }),
});
