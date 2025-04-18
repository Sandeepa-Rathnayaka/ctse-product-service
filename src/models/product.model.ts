import mongoose, { Schema } from "mongoose";
import { IProduct } from "../types/product.types";

const ProductSchema = new Schema<IProduct>(
  {
    productCode: { type: String, required: true, trim: true, unique: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    category: { type: String, required: true, trim: true, lowercase: true },
    brand: { type: String, required: true },
    subCategory: {
      type: [String],
      required: true,
      set: function (arr: string[]) {
        return arr.map(function (str: string) {
          return str.trim().toLowerCase();
        });
      },
    },
    images: { type: [String], required: true, trim: true },
    stock: { type: Number, required: true, default: 0 },
    soldStock: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    reviews: { type: [Schema.Types.ObjectId], ref: "Reviews" },
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model<IProduct>("Product", ProductSchema);
export default Product;
