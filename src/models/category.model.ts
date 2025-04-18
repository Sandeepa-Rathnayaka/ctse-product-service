import mongoose, { Schema } from "mongoose";
import { ICategory } from "../types/product.types";

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    subCategory: {
      type: [String],
      set: function (arr: string[]) {
        return arr.map(function (str: string) {
          return str.trim().toLowerCase();
        });
      },
    },
  },
  { timestamps: true }
);

const Category = mongoose.model<ICategory>("Category", categorySchema);
export default Category;
