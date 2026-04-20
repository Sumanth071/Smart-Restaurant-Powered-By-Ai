import mongoose from "mongoose";

import { reservationStatuses } from "../config/constants.js";

const reservationSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    guestUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    guestName: {
      type: String,
      required: true,
    },
    guestEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    guestPhone: {
      type: String,
      required: true,
    },
    reservationDate: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    guestCount: {
      type: Number,
      required: true,
    },
    areaPreference: {
      type: String,
      default: "Indoor",
    },
    specialRequest: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: reservationStatuses,
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Reservation", reservationSchema);
