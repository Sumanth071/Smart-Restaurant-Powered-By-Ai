import { roles } from "../config/constants.js";

const pick = (payload = {}, keys = []) =>
  keys.reduce((accumulator, key) => {
    if (payload[key] !== undefined) {
      accumulator[key] = payload[key];
    }

    return accumulator;
  }, {});

const bookingEditableFields = [
  "restaurant",
  "table",
  "guestName",
  "guestEmail",
  "guestPhone",
  "bookingDate",
  "timeSlot",
  "guestCount",
  "occasion",
  "specialRequest",
  "source",
];

const reservationEditableFields = [
  "restaurant",
  "guestName",
  "guestEmail",
  "guestPhone",
  "reservationDate",
  "timeSlot",
  "guestCount",
  "areaPreference",
  "specialRequest",
];

const orderEditableFields = [
  "restaurant",
  "table",
  "customerName",
  "customerEmail",
  "customerPhone",
  "items",
  "orderType",
  "notes",
];

const isGuestContext = (req) => !req.user || req.user.role === roles.GUEST;

export const sanitizeBookingPayload = async (payload, req, existingItem) => {
  if (!isGuestContext(req)) {
    return payload;
  }

  const nextPayload = pick(payload, bookingEditableFields);
  nextPayload.source = "web";

  if (payload.status === "cancelled") {
    nextPayload.status = "cancelled";
  } else if (!existingItem) {
    nextPayload.status = "pending";
  }

  return nextPayload;
};

export const sanitizeReservationPayload = async (payload, req, existingItem) => {
  if (!isGuestContext(req)) {
    return payload;
  }

  const nextPayload = pick(payload, reservationEditableFields);

  if (payload.status === "cancelled") {
    nextPayload.status = "cancelled";
  } else if (!existingItem) {
    nextPayload.status = "pending";
  }

  return nextPayload;
};

export const sanitizeOrderPayload = async (payload, req, existingItem) => {
  if (!isGuestContext(req)) {
    return payload;
  }

  const nextPayload = pick(payload, orderEditableFields);

  if (payload.status === "cancelled") {
    nextPayload.status = "cancelled";
  } else if (!existingItem) {
    nextPayload.status = "pending";
  }

  nextPayload.paymentStatus = existingItem?.paymentStatus || "pending";
  nextPayload.discount = existingItem?.discount || 0;
  nextPayload.orderNumber = existingItem?.orderNumber;
  nextPayload.placedAt = existingItem?.placedAt;

  return nextPayload;
};
