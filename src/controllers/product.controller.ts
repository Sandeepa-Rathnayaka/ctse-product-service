import { Request, Response } from "express";
import * as ProductService from "../services/product.service";
import { generateRandomUniqueCode } from "../utils/genrate-product-code";
import { IProductFilters } from "../types/product.types";

export const addNewProduct = async (req: Request, res: Response) => {
  const imageFiles = req.files as Express.MulterS3.File[];
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      message: "Unauthorized: User not authenticated",
    });
  }

  // Extract image URLs
  let imgArr: string[] = [];
  if (imageFiles && imageFiles.length > 0) {
    imgArr = imageFiles.map((file) => file.location);
  } else {
    imgArr.push(
      "https://ds-nature-ayur.s3.ap-southeast-1.amazonaws.com/defaultImages/No-Image-Placeholder.svg.png"
    );
  }

  // Prepare product data
  const productData: any = {
    name: req.body.name,
    price: Number(req.body.price),
    description: req.body.description,
    category: req.body.category,
    subCategory: Array.isArray(req.body.subCategory)
      ? req.body.subCategory
      : [req.body.subCategory],
    images: imgArr,
    stock: Number(req.body.stock),
    seller: user.id,
    brand: req.body.brand,
  };

  const product = await ProductService.addProduct(productData);

  return res.status(201).json({
    message: "Product Added Successfully",
    product,
  });
};

export const getAllProductList = async (req: Request, res: Response) => {
  const { search, sortBy, order, cat, subCat, limit, page } =
    req.query as unknown as IProductFilters;

  // Convert subCat to an array if it's a string
  let subCatArray: string[] = [];
  if (typeof subCat === "string") {
    subCatArray = [subCat];
  } else if (Array.isArray(subCat)) {
    subCatArray = subCat;
  }

  // Convert subCategory to lowercase and trim
  const processedSubCat = subCatArray.map((item: string) =>
    item.trim().toLowerCase()
  );

  // Get products with filters
  const { products, total, maxProductsPrice, minProductsPrice } =
    await ProductService.findAllProducts({
      search: search as string,
      sortBy: sortBy as string,
      order: order as string,
      limit: limit as string,
      page: page as string,
      cat: cat as string,
      subCat: processedSubCat,
    });

  return res.status(200).json({
    message: "Products found Successfully",
    total,
    products,
    maxProductsPrice,
    minProductsPrice,
  });
};

export const getOneProductDetails = async (req: Request, res: Response) => {
  const { id } = req.params;
  const product = await ProductService.findProductById(id);

  return res.status(200).json({
    message: "Product found Successfully",
    product,
  });
};

export const getOneSellerProductList = async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      message: "Unauthorized: User not authenticated",
    });
  }

  const products = await ProductService.findProductBySellerId(user.id);

  return res.status(200).json({
    message: "Seller products found Successfully",
    products,
  });
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      message: "Unauthorized: User not authenticated",
    });
  }

  const updatedProduct = await ProductService.updateProduct(
    id,
    req.body,
    user.id
  );

  return res.status(200).json({
    message: "Product Updated Successfully",
    product: updatedProduct,
  });
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      message: "Unauthorized: User not authenticated",
    });
  }

  const deletedProduct = await ProductService.removeProduct(id, user.id);

  return res.status(200).json({
    message: "Product Deleted Successfully",
    product: deletedProduct,
  });
};

export const getNewArrivals = async (req: Request, res: Response) => {
  const newArrivals = await ProductService.findNewArrivals();

  return res.status(200).json({
    message: "New Arrivals found Successfully",
    products: newArrivals,
  });
};

export const getPopularProducts = async (req: Request, res: Response) => {
  const popularProducts = await ProductService.findPopularProducts();

  return res.status(200).json({
    message: "Popular Products found Successfully",
    products: popularProducts,
  });
};

// Internal service endpoints for order service to call
export const reserveProducts = async (req: Request, res: Response) => {
  const { items } = req.body;

  try {
    for (const item of items) {
      await ProductService.reserveProductStock(item.product, item.quantity);
    }

    return res.status(200).json({
      message: "Products reserved successfully",
      reservationId: generateRandomUniqueCode("RES"),
    });
  } catch (error: any) {
    // Rollback any reservations made before the error
    for (const item of items) {
      try {
        await ProductService.cancelProductReservation(
          item.product,
          item.quantity
        );
      } catch (rollbackError: any) {
        // Log rollback errors but continue
        console.error(`Rollback error: ${rollbackError.message}`);
      }
    }

    return res.status(400).json({
      message: error.message,
    });
  }
};

export const confirmReservation = async (req: Request, res: Response) => {
  const { reservationId } = req.params;
  const { items } = req.body;

  try {
    for (const item of items) {
      await ProductService.confirmProductPurchase(item.product, item.quantity);
    }

    return res.status(200).json({
      message: "Products purchase confirmed",
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const cancelReservation = async (req: Request, res: Response) => {
  const { reservationId } = req.params;
  const { items } = req.body;

  try {
    for (const item of items) {
      await ProductService.cancelProductReservation(
        item.product,
        item.quantity
      );
    }

    return res.status(200).json({
      message: "Reservation cancelled, stock restored",
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};
