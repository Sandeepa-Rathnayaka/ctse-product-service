import Product from "../models/product.model";
import { BadRequestError } from "../errors";
import {
  IProduct,
  IProductFilters,
  IProductResponse,
} from "../types/product.types";
import { generateRandomUniqueCode } from "../utils/genrate-product-code";

export async function addProduct(
  input: Omit<IProduct, "productCode">
): Promise<IProduct> {
  const productCode = generateRandomUniqueCode("PD");
  const product = await Product.create({ ...input, productCode });
  return product;
}

export async function updateProduct(
  id: string,
  data: Partial<IProduct>,
  sellerId: string
): Promise<IProduct> {
  const { subCategory, reviews, ...restData } = data;

  const product = await Product.findById(id);
  if (!product) throw new BadRequestError("Product not found");

  // Check if user is the seller of the product
  if (
    product.seller.toString() !== sellerId &&
    data.seller?.toString() !== sellerId
  ) {
    throw new BadRequestError("You can only update your own products");
  }

  // Update the product
  const updateData: any = { ...restData };

  // Handle array fields with addToSet to avoid duplicates
  if (subCategory) {
    updateData.$addToSet = {
      ...(updateData.$addToSet || {}),
      subCategory,
    };
  }

  if (reviews) {
    updateData.$addToSet = {
      ...(updateData.$addToSet || {}),
      reviews,
    };
  }

  const updateProduct = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updateProduct) {
    throw new BadRequestError("Product not found");
  }

  return updateProduct;
}

export async function removeProduct(
  id: string,
  sellerId: string
): Promise<IProduct> {
  const product = await Product.findById(id);
  if (!product) throw new BadRequestError("Product not found");

  // Check if user is the seller of the product
  if (product.seller.toString() !== sellerId) {
    throw new BadRequestError("You can only delete your own products");
  }

  const deletedProduct = await Product.findByIdAndDelete(id);

  if (!deletedProduct) {
    throw new BadRequestError("Product not found");
  }

  return deletedProduct;
}

export async function findAllProducts(
  filters: IProductFilters
): Promise<IProductResponse> {
  const {
    search = "",
    sortBy = "createdAt",
    order = "-1",
    limit = "10",
    page = "1",
    cat,
    subCat = [],
  } = filters;

  //default filters
  const defaultFilters: any = {
    name: { $regex: search, $options: "i" },
  };

  //if category is present then add it to the filter
  if (cat) {
    defaultFilters["category"] = cat.toLowerCase();
  }

  //if sub category is present then add it to the filter
  if (subCat.length > 0) {
    defaultFilters["subCategory"] = { $in: subCat };
  }

  // Parse limit and page values
  const limitNum = parseInt(limit);
  const pageNum = parseInt(page);
  const skip = limitNum * (pageNum - 1);

  // Create sort object properly for Mongoose
  const sortObject: { [key: string]: 1 | -1 } = {};
  sortObject[sortBy] = parseInt(order) as 1 | -1;

  //find all products
  const products = await Product.find(defaultFilters)
    .sort(sortObject) // Pass the properly formatted sort object
    .limit(limitNum)
    .skip(skip);

  //find count for matching products
  const totalDocCount = await Product.countDocuments(defaultFilters);
  const total = Math.ceil(totalDocCount / limitNum);

  // Get max and min product prices
  const maxProduct = await Product.findOne()
    .sort({ price: -1 })
    .select("price")
    .exec();

  const minProduct = await Product.findOne()
    .sort({ price: 1 })
    .select("price")
    .exec();

  const maxProductsPrice = maxProduct ? maxProduct.price : 0;
  const minProductsPrice = minProduct ? minProduct.price : 0;

  return { products, total, maxProductsPrice, minProductsPrice };
}

export async function findProductById(id: string): Promise<IProduct> {
  const product = await Product.findById(id).exec();

  if (!product) {
    throw new BadRequestError("Product not found");
  }

  return product;
}

export async function findProductBySellerId(
  sellerId: string
): Promise<IProduct[]> {
  const products = await Product.find({
    seller: sellerId,
  });

  return products;
}

export async function findNewArrivals(): Promise<IProduct[]> {
  // Get the date and time 24 hours ago
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  // Find products that were created within the last 24 hours
  const products = await Product.find({
    createdAt: { $gte: yesterday },
  })
    .sort({ createdAt: -1 })
    .limit(10);

  // If fewer than 4 products, get most recent ones
  if (products.length < 4) {
    return await Product.find().sort({ createdAt: -1 }).limit(10);
  }

  return products;
}

export async function findPopularProducts(): Promise<IProduct[]> {
  const popularProducts = await Product.find({ soldStock: { $gt: 0 } })
    .sort({ soldStock: -1 })
    .limit(10);

  return popularProducts;
}

export async function reserveProductStock(
  productId: string,
  quantity: number
): Promise<boolean> {
  const product = await Product.findById(productId);
  if (!product) throw new BadRequestError("Product not found");

  if (product.stock < quantity) {
    throw new BadRequestError("Insufficient stock");
  }

  product.stock -= quantity;
  await product.save();

  return true;
}

export async function confirmProductPurchase(
  productId: string,
  quantity: number
): Promise<boolean> {
  const product = await Product.findById(productId);
  if (!product) throw new BadRequestError("Product not found");

  // Update sold stock
  product.soldStock = (product.soldStock || 0) + quantity;
  await product.save();

  return true;
}

export async function cancelProductReservation(
  productId: string,
  quantity: number
): Promise<boolean> {
  const product = await Product.findById(productId);
  if (!product) throw new BadRequestError("Product not found");

  // Restore stock
  product.stock += quantity;
  await product.save();

  return true;
}
