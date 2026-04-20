import MenuItem from "../models/MenuItem.js";
import { createCrudController } from "./crudFactory.js";

const menuCrud = createCrudController(MenuItem, {
  searchFields: ["name", "category", "description"],
  populate: "restaurant",
  sort: { popularityScore: -1, createdAt: -1 },
});

export const listMenuItems = menuCrud.list;
export const getMenuItem = menuCrud.getById;
export const createMenuItem = menuCrud.create;
export const updateMenuItem = menuCrud.update;
export const deleteMenuItem = menuCrud.remove;
