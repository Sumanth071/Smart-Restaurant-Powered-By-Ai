export const roles = {
  SUPER_ADMIN: "super-admin",
  RESTAURANT_ADMIN: "restaurant-admin",
  STAFF: "staff",
  GUEST: "guest",
};

export const roleOptions = Object.values(roles);

export const restaurantStatuses = ["active", "inactive", "maintenance"];
export const menuCategories = [
  "Starters",
  "Main Course",
  "Desserts",
  "Beverages",
  "Combos",
];
export const tableStatuses = ["available", "reserved", "occupied", "cleaning"];
export const bookingStatuses = ["pending", "confirmed", "checked-in", "completed", "cancelled"];
export const orderStatuses = ["pending", "preparing", "ready", "served", "cancelled"];
export const paymentStatuses = ["pending", "paid", "refunded"];
export const reservationStatuses = ["pending", "confirmed", "seated", "completed", "cancelled"];
export const orderTypes = ["dine-in", "takeaway", "delivery"];
export const busyHourRange = Array.from({ length: 14 }, (_, index) => 9 + index);
