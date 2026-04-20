import Restaurant from "../models/Restaurant.js";
import { createCrudController } from "./crudFactory.js";

const restaurantCrud = createCrudController(Restaurant, {
  searchFields: ["name", "code", "email", "address.city", "address.state"],
  sort: { createdAt: -1 },
});

export const listRestaurants = restaurantCrud.list;
export const getRestaurant = restaurantCrud.getById;
export const createRestaurant = restaurantCrud.create;
export const updateRestaurant = restaurantCrud.update;
export const deleteRestaurant = restaurantCrud.remove;
