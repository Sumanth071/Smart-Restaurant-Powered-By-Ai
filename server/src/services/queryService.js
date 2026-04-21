import { roles } from "../config/constants.js";

const restaurantScopedModels = ["MenuItem", "Table", "Booking", "Reservation", "Order"];

const castValue = (value) => {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return value;
};

export const mergeFilters = (...filters) => {
  const validFilters = filters.filter((filter) => filter && Object.keys(filter).length);

  if (!validFilters.length) {
    return {};
  }

  if (validFilters.length === 1) {
    return validFilters[0];
  }

  return { $and: validFilters };
};

export const buildListFilter = (queryParams = {}, searchFields = []) => {
  const filter = {};
  const query = { ...queryParams };
  const searchTerm = query.q;

  delete query.q;
  delete query.page;
  delete query.limit;
  delete query.sort;
  delete query.paged;

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "" || value === "all") {
      return;
    }

    filter[key] = castValue(value);
  });

  if (searchTerm && searchFields.length) {
    filter.$or = searchFields.map((field) => ({
      [field]: { $regex: searchTerm, $options: "i" },
    }));
  }

  return filter;
};

export const parsePagination = (queryParams = {}, defaults = {}) => {
  const enabled = queryParams.paged === "true" || queryParams.page !== undefined || queryParams.limit !== undefined;
  const defaultPage = Number(defaults.page || 1);
  const defaultLimit = Number(defaults.limit || 10);
  const maxLimit = Number(defaults.maxLimit || 50);
  const page = Math.max(1, Number(queryParams.page || defaultPage || 1));
  const limit = Math.min(maxLimit, Math.max(1, Number(queryParams.limit || defaultLimit || 10)));

  return {
    enabled,
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

export const parseSort = (sortValue, fallbackSort = { createdAt: -1 }) => {
  if (!sortValue) {
    return fallbackSort;
  }

  if (typeof sortValue === "object" && !Array.isArray(sortValue)) {
    return sortValue;
  }

  const normalized = String(sortValue).trim();

  if (!normalized) {
    return fallbackSort;
  }

  if (normalized.startsWith("-")) {
    return { [normalized.slice(1)]: -1 };
  }

  const [field, direction = "desc"] = normalized.split(":");

  if (!field) {
    return fallbackSort;
  }

  return { [field]: direction.toLowerCase() === "asc" ? 1 : -1 };
};

export const buildScopeFilter = (req, modelName) => {
  if (!req.user) {
    return {};
  }

  const { role, restaurant, email, _id } = req.user;

  if (role === roles.SUPER_ADMIN) {
    return {};
  }

  if (role === roles.RESTAURANT_ADMIN || role === roles.STAFF) {
    if (modelName === "Restaurant") {
      return restaurant ? { _id: restaurant._id || restaurant } : { _id: null };
    }

    if (modelName === "User") {
      return restaurant ? { $or: [{ restaurant: restaurant._id || restaurant }, { role: roles.GUEST }] } : { _id: null };
    }

    if (modelName === "AuditLog") {
      return restaurant ? { restaurant: restaurant._id || restaurant } : { _id: null };
    }

    if (restaurantScopedModels.includes(modelName)) {
      return restaurant ? { restaurant: restaurant._id || restaurant } : { _id: null };
    }
  }

  if (role === roles.GUEST) {
    if (modelName === "Booking") {
      return { $or: [{ guestUser: _id }, { guestEmail: email }] };
    }

    if (modelName === "Reservation") {
      return { $or: [{ guestUser: _id }, { guestEmail: email }] };
    }

    if (modelName === "Order") {
      return { $or: [{ guestUser: _id }, { customerEmail: email }] };
    }

    if (["Restaurant", "MenuItem"].includes(modelName)) {
      return {};
    }

    return { _id: null };
  }

  return {};
};

export const scopePayloadToUser = (req, modelName, payload) => {
  if (!req.user) {
    return payload;
  }

  const scopedPayload = { ...payload };

  if ((req.user.role === roles.RESTAURANT_ADMIN || req.user.role === roles.STAFF) && req.user.restaurant) {
    const restaurantId = req.user.restaurant._id || req.user.restaurant;

    if (restaurantScopedModels.includes(modelName)) {
      scopedPayload.restaurant = restaurantId;
    }

    if (modelName === "User" && !scopedPayload.restaurant) {
      scopedPayload.restaurant = restaurantId;
    }
  }

  if (req.user.role === roles.GUEST) {
    if (modelName === "Booking") {
      scopedPayload.guestUser = req.user._id;
      scopedPayload.guestEmail = req.user.email;
      scopedPayload.guestName = scopedPayload.guestName || req.user.name;
      scopedPayload.guestPhone = scopedPayload.guestPhone || req.user.phone;
    }

    if (modelName === "Reservation") {
      scopedPayload.guestUser = req.user._id;
      scopedPayload.guestEmail = req.user.email;
      scopedPayload.guestName = scopedPayload.guestName || req.user.name;
      scopedPayload.guestPhone = scopedPayload.guestPhone || req.user.phone;
    }

    if (modelName === "Order") {
      scopedPayload.guestUser = req.user._id;
      scopedPayload.customerEmail = req.user.email;
      scopedPayload.customerName = scopedPayload.customerName || req.user.name;
      scopedPayload.customerPhone = scopedPayload.customerPhone || req.user.phone;
    }
  }

  return scopedPayload;
};
