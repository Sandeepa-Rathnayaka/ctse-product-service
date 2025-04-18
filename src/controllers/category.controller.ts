import { Request, Response } from "express";
import * as CategoryService from "../services/category.service";

export const addNewCategory = async (req: Request, res: Response) => {
  const { name, subCategory } = req.body;
  const category = await CategoryService.addNewCategory(name, subCategory);
  res.status(201).json({ category });
};

export const addNewSubCategory = async (req: Request, res: Response) => {
  const { name } = req.body;
  const { id } = req.params;
  const subCategory = await CategoryService.addNewSubCategory(id, name);
  res.status(201).json({ subCategory });
};

export const getAllCategories = async (req: Request, res: Response) => {
  const categories = await CategoryService.getAllCategories();
  res.status(200).json({ categories });
};

export const getOneCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const category = await CategoryService.getOneCategory(id);
  res.status(200).json({ category });
};

export const getAllSubCategoriesForOneCategory = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;
  const subCategories = await CategoryService.getAllSubCategoriesForOneCategory(
    id
  );
  res.status(200).json({ subCategories });
};

export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;
  const updatedCategory = await CategoryService.updateCategory(id, name);
  res.status(200).json({ updatedCategory });
};

export const updateSubCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { oldName, newName } = req.body;
  const updatedSubCategory = await CategoryService.updateSubCategory(
    id,
    oldName,
    newName
  );
  res.status(200).json({ updatedSubCategory });
};

export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const deletedCategory = await CategoryService.deleteCategory(id);
  res.status(200).json({ deletedCategory });
};

export const deleteSubCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;
  const deletedSubCategory = await CategoryService.deleteSubCategory(id, name);
  res.status(200).json({ deletedSubCategory });
};
