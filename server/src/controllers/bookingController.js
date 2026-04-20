import Booking from "../models/Booking.js";
import { createCrudController } from "./crudFactory.js";
import { sanitizeBookingPayload } from "../services/payloadSanitizers.js";

const bookingCrud = createCrudController(Booking, {
  searchFields: ["guestName", "guestEmail", "guestPhone", "occasion", "status"],
  populate: "restaurant table guestUser",
  beforeCreate: sanitizeBookingPayload,
  beforeUpdate: sanitizeBookingPayload,
});

export const listBookings = bookingCrud.list;
export const getBooking = bookingCrud.getById;
export const createBooking = bookingCrud.create;
export const updateBooking = bookingCrud.update;
export const deleteBooking = bookingCrud.remove;
