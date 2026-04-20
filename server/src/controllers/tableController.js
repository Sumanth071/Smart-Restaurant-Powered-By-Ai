import Table from "../models/Table.js";
import { createCrudController } from "./crudFactory.js";

const tableCrud = createCrudController(Table, {
  searchFields: ["tableNumber", "zone", "floor", "status"],
  populate: "restaurant",
});

export const listTables = tableCrud.list;
export const getTable = tableCrud.getById;
export const createTable = tableCrud.create;
export const updateTable = tableCrud.update;
export const deleteTable = tableCrud.remove;
