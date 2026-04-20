const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const normalizeText = (value = "") => String(value).trim();
export const normalizeEmail = (value = "") => String(value).trim().toLowerCase();
export const createValidationError = (message) => Object.assign(new Error(message), { statusCode: 400 });

export const requireText = (value, label) => {
  const nextValue = normalizeText(value);

  if (!nextValue) {
    throw createValidationError(`${label} is required`);
  }

  return nextValue;
};

export const requireEmail = (value, label = "Email") => {
  const nextValue = normalizeEmail(value);

  if (!nextValue) {
    throw createValidationError(`${label} is required`);
  }

  if (!emailPattern.test(nextValue)) {
    throw createValidationError(`Please enter a valid ${label.toLowerCase()}`);
  }

  return nextValue;
};

export const requireMinNumber = (value, label, minimum = 1) => {
  const nextValue = Number(value);

  if (!Number.isFinite(nextValue)) {
    throw createValidationError(`${label} is required`);
  }

  if (nextValue < minimum) {
    throw createValidationError(`${label} must be at least ${minimum}`);
  }

  return nextValue;
};

export const requireNonNegativeNumber = (value, label) => requireMinNumber(value, label, 0);

export const validateAuthRegistrationPayload = ({ name, email, password, phone }) => {
  requireText(name, "Name");
  requireEmail(email);
  requireText(phone, "Phone");

  if (String(password || "").length < 6) {
    throw createValidationError("Password must be at least 6 characters long");
  }
};

export const validateAuthLoginPayload = ({ email, password }) => {
  requireEmail(email);

  if (!String(password || "")) {
    throw createValidationError("Password is required");
  }
};

export const validateRestaurantPayload = (payload) => {
  requireText(payload.name, "Restaurant name");
  requireText(payload.code, "Restaurant code");
  requireEmail(payload.email, "Restaurant email");
  requireText(payload.phone, "Restaurant phone");

  if (payload.totalTables !== undefined) {
    requireNonNegativeNumber(payload.totalTables, "Total tables");
  }

  if (payload.totalStaff !== undefined) {
    requireNonNegativeNumber(payload.totalStaff, "Total staff");
  }

  if (payload.rating !== undefined) {
    const rating = Number(payload.rating);

    if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
      throw createValidationError("Rating must be between 0 and 5");
    }
  }
};

export const validateMenuItemPayload = (payload) => {
  requireText(payload.restaurant, "Restaurant");
  requireText(payload.name, "Dish name");
  requireText(payload.category, "Category");
  requireNonNegativeNumber(payload.price, "Price");

  if (payload.prepTime !== undefined) {
    requireNonNegativeNumber(payload.prepTime, "Preparation time");
  }

  if (payload.popularityScore !== undefined) {
    requireNonNegativeNumber(payload.popularityScore, "Popularity score");
  }
};

export const validateTablePayload = (payload) => {
  requireText(payload.restaurant, "Restaurant");
  requireText(payload.tableNumber, "Table number");
  requireMinNumber(payload.capacity, "Capacity", 1);
};

export const validateBookingPayload = (payload) => {
  requireText(payload.restaurant, "Restaurant");
  requireText(payload.guestName, "Guest name");
  requireEmail(payload.guestEmail, "Guest email");
  requireText(payload.guestPhone, "Guest phone");
  requireText(payload.bookingDate, "Booking date");
  requireText(payload.timeSlot, "Time slot");
  requireMinNumber(payload.guestCount, "Guest count", 1);
};

export const validateReservationPayload = (payload) => {
  requireText(payload.restaurant, "Restaurant");
  requireText(payload.guestName, "Guest name");
  requireEmail(payload.guestEmail, "Guest email");
  requireText(payload.guestPhone, "Guest phone");
  requireText(payload.reservationDate, "Reservation date");
  requireText(payload.timeSlot, "Time slot");
  requireMinNumber(payload.guestCount, "Guest count", 1);
};

export const validateOrderPayload = (payload) => {
  requireText(payload.restaurant, "Restaurant");
  requireText(payload.customerName, "Customer name");
  requireEmail(payload.customerEmail, "Customer email");
  requireText(payload.customerPhone, "Customer phone");

  const items = Array.isArray(payload.items) ? payload.items : [];

  if (!items.length) {
    throw createValidationError("At least one menu item is required for an order");
  }

  items.forEach((item, index) => {
    requireText(item.name || item.menuItem, `Order item ${index + 1}`);
    requireMinNumber(item.quantity, `Quantity for item ${index + 1}`, 1);

    if (item.price !== undefined && item.price !== null && item.price !== "") {
      requireNonNegativeNumber(item.price, `Price for item ${index + 1}`);
    }
  });
};

export const validateUserPayload = (payload, { requirePassword = false } = {}) => {
  requireText(payload.name, "Name");
  requireEmail(payload.email);

  if (payload.phone !== undefined) {
    requireText(payload.phone, "Phone");
  }

  if (requirePassword && String(payload.password || "").length < 6) {
    throw createValidationError("Password must be at least 6 characters long");
  }

  if (!requirePassword && payload.password && String(payload.password).length < 6) {
    throw createValidationError("Password must be at least 6 characters long");
  }
};

export const validateEntityPayload = (modelName, payload, options = {}) => {
  switch (modelName) {
    case "Restaurant":
      validateRestaurantPayload(payload);
      break;
    case "MenuItem":
      validateMenuItemPayload(payload);
      break;
    case "Table":
      validateTablePayload(payload);
      break;
    case "Booking":
      validateBookingPayload(payload);
      break;
    case "Reservation":
      validateReservationPayload(payload);
      break;
    case "Order":
      validateOrderPayload(payload);
      break;
    case "User":
      validateUserPayload(payload, options);
      break;
    default:
      break;
  }
};
