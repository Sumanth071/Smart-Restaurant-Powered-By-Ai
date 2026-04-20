import mongoose from "mongoose";

import { tableStatuses } from "../config/constants.js";

const tableSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    tableNumber: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    zone: {
      type: String,
      default: "Main Hall",
    },
    floor: {
      type: String,
      default: "Ground",
    },
    status: {
      type: String,
      enum: tableStatuses,
      default: "available",
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Table", tableSchema);
