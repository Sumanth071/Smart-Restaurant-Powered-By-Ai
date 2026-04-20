import Reservation from "../models/Reservation.js";
import { createCrudController } from "./crudFactory.js";
import { sanitizeReservationPayload } from "../services/payloadSanitizers.js";

const reservationCrud = createCrudController(Reservation, {
  searchFields: ["guestName", "guestEmail", "guestPhone", "areaPreference", "status"],
  populate: "restaurant guestUser",
  beforeCreate: sanitizeReservationPayload,
  beforeUpdate: sanitizeReservationPayload,
});

export const listReservations = reservationCrud.list;
export const getReservation = reservationCrud.getById;
export const createReservation = reservationCrud.create;
export const updateReservation = reservationCrud.update;
export const deleteReservation = reservationCrud.remove;
