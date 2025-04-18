import Category from "../models/category.model";
import { BadRequestError } from "../errors";
import { ICategory } from "../types/product.types";

export async function addNewCategory(
  name: string,
  subCategory: string[] = []
): Promise<ICategory> {
  const category = await Category.create({ name, subCategory });
  return category;
}

export async function getAllCategories(): Promise<ICategory[]> {
  const categories = await Category.find();
  return categories;
}

export async function getOneCategory(id: string): Promise<ICategory | null> {
  const foundCategory = await Category.findById(id);
  return foundCategory;
}

export async function updateCategory(
  id: string,
  name: string
): Promise<ICategory | null> {
  const updatedCategory = await Category.findByIdAndUpdate(
    id,
    { name },
    { new: true }
  );
  return updatedCategory;
}

export async function deleteCategory(id: string): Promise<ICategory | null> {
  const deletedCategory = await Category.findByIdAndDelete(id);
  return deletedCategory;
}

export async function addNewSubCategory(
  id: string,
  name: string
): Promise<ICategory | null> {
  const category = await Category.findByIdAndUpdate(
    id,
    { $addToSet: { subCategory: name } },
    { new: true }
  );
  return category;
}

export async function getAllSubCategoriesForOneCategory(
  id: string
): Promise<string[]> {
  const category = await Category.findById(id);
  if (!category) throw new BadRequestError("Category not found");
  return category.subCategory;
}

export async function updateSubCategory(
  id: string,
  oldName: string,
  newName: string
): Promise<ICategory | null> {
  const category = await Category.findById(id);
  if (!category) throw new BadRequestError("Category not found");

  const subCategoryIndex = category.subCategory.indexOf(oldName);
  if (subCategoryIndex === -1)
    throw new BadRequestError("Subcategory not found");

  category.subCategory[subCategoryIndex] = newName;
  await category.save();

  return category;
}

export async function deleteSubCategory(
  id: string,
  subCategoryName: string
): Promise<ICategory | null> {
  const deletedCategory = await Category.findByIdAndUpdate(
    id,
    { $pull: { subCategory: subCategoryName } },
    { new: true }
  );
  return deletedCategory;
}
