import express from "express";
import { validateUserRoleAndToken } from "../middleware/auth.middleware";
import { ROLES } from "../types/product.types";
import validate from "../middleware/schemavalidator.middleware";
import {
  addProductSchema,
  updateProductSchema,
  getAllProductListSchema,
  getProductSchema,
  deleteProductSchema,
  reserveProductsSchema,
} from "../schema/product.schema";
import { upload } from "../utils/multerConfig";
import {
  addNewProduct,
  getAllProductList,
  getOneProductDetails,
  getOneSellerProductList,
  updateProduct,
  deleteProduct,
  getNewArrivals,
  getPopularProducts,
  reserveProducts,
  confirmReservation,
  cancelReservation,
} from "../controllers/product.controller";

const router = express.Router();

// Public routes
router.get("/", validate(getAllProductListSchema), getAllProductList);
router.get("/newArrivals", getNewArrivals);
router.get("/popular", getPopularProducts);
router.get("/:id", validate(getProductSchema), getOneProductDetails);

// Protected routes (seller and admin only)
router.post(
  "/",
  validateUserRoleAndToken([ROLES.ADMIN, ROLES.SELLER]),
  upload.array("images", 6),
  validate(addProductSchema),
  addNewProduct
);

router.get(
  "/seller/products",
  validateUserRoleAndToken([ROLES.ADMIN, ROLES.SELLER]),
  getOneSellerProductList
);

router.patch(
  "/:id",
  validateUserRoleAndToken([ROLES.ADMIN, ROLES.SELLER]),
  validate(updateProductSchema),
  updateProduct
);

router.delete(
  "/:id",
  validateUserRoleAndToken([ROLES.ADMIN, ROLES.SELLER]),
  validate(deleteProductSchema),
  deleteProduct
);

// Internal routes for order service
router.post(
  "/internal/reserve",
  validate(reserveProductsSchema),
  reserveProducts
);

router.post(
  "/internal/confirm-reservation/:reservationId",
  validate(reserveProductsSchema),
  confirmReservation
);

router.delete(
  "/internal/reservation/:reservationId",
  validate(reserveProductsSchema),
  cancelReservation
);

export default router;
