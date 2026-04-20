import mongoose from "mongoose";

import { bookingStatuses } from "../config/constants.js";

const bookingSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      default: null,
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
    bookingDate: {
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
    occasion: {
      type: String,
      default: "Regular Dining",
    },
    specialRequest: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: bookingStatuses,
      default: "pending",
    },
    source: {
      type: String,
      enum: ["web", "phone", "walk-in"],
      default: "web",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
