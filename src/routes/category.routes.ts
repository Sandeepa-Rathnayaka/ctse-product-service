import express from "express";
import { validateUserRoleAndToken } from "../middleware/auth.middleware";
import { ROLES } from "../types/product.types";
import validate from "../middleware/schemavalidator.middleware";
import {
  categorySchema,
  categoryParamsSchema,
  subCategorySchema,
  updateSubCategorySchema,
} from "../schema/product.schema";
import {
  addNewCategory,
  addNewSubCategory,
  getAllCategories,
  getAllSubCategoriesForOneCategory,
  getOneCategory,
  updateCategory,
  updateSubCategory,
  deleteCategory,
  deleteSubCategory,
} from "../controllers/category.controller";

const router = express.Router();

// Public routes
router.get("/", getAllCategories);
router.get("/:id", validate(categoryParamsSchema), getOneCategory);
router.get(
  "/sub/:id",
  validate(categoryParamsSchema),
  getAllSubCategoriesForOneCategory
);

// Protected routes (admin and seller only)
router.post(
  "/",
  validateUserRoleAndToken([ROLES.ADMIN, ROLES.SELLER]),
  validate(categorySchema),
  addNewCategory
);

router.post(
  "/sub/:id",
  validateUserRoleAndToken([ROLES.ADMIN, ROLES.SELLER]),
  validate(subCategorySchema),
  addNewSubCategory
);

router.patch(
  "/:id",
  validateUserRoleAndToken([ROLES.ADMIN, ROLES.SELLER]),
  validate(categoryParamsSchema),
  updateCategory
);

router.patch(
  "/sub/:id",
  validateUserRoleAndToken([ROLES.ADMIN, ROLES.SELLER]),
  validate(updateSubCategorySchema),
  updateSubCategory
);

router.delete(
  "/:id",
  validateUserRoleAndToken([ROLES.ADMIN, ROLES.SELLER]),
  validate(categoryParamsSchema),
  deleteCategory
);

router.delete(
  "/sub/:id",
  validateUserRoleAndToken([ROLES.ADMIN, ROLES.SELLER]),
  validate(subCategorySchema),
  deleteSubCategory
);

export default router;
