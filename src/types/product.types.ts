import { Document, ObjectId } from "mongoose";

export interface ICategory extends Document {
  name: string;
  subCategory: string[];
}

export interface IProduct extends Document {
  name: string;
  productCode: string;
  description: string;
  brand: string;
  price: number;
  category: string;
  subCategory?: string[];
  images: string[];
  stock: number;
  rating?: number;
  numReviews?: number;
  reviews?: ObjectId[];
  seller: ObjectId;
  soldStock?: number;
}

export interface IProductFilters {
  search?: string;
  sortBy?: string;
  order?: string;
  limit?: string;
  page?: string;
  cat?: string;
  subCat?: string[];
}

export interface IProductResponse {
  products: IProduct[];
  total: number;
  maxProductsPrice: number;
  minProductsPrice: number;
}

export enum ROLES {
  ADMIN = "admin",
  USER = "user",
  SELLER = "seller",
}
