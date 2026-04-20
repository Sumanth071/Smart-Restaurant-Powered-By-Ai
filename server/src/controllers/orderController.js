import Order from "../models/Order.js";
import { createCrudController } from "./crudFactory.js";
import { normalizeOrderPayload } from "../services/orderService.js";
import { sanitizeOrderPayload } from "../services/payloadSanitizers.js";

const prepareOrderPayload = async (payload, req, existingItem) => {
  const sanitizedPayload = await sanitizeOrderPayload(payload, req, existingItem);
  return normalizeOrderPayload(sanitizedPayload);
};

const orderCrud = createCrudController(Order, {
  searchFields: ["orderNumber", "customerName", "customerEmail", "customerPhone", "status", "orderType"],
  populate: "restaurant table guestUser",
  beforeCreate: prepareOrderPayload,
  beforeUpdate: prepareOrderPayload,
});

export const listOrders = orderCrud.list;
export const getOrder = orderCrud.getById;
export const createOrder = orderCrud.create;
export const updateOrder = orderCrud.update;
export const deleteOrder = orderCrud.remove;
