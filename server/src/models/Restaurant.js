import mongoose from "mongoose";

import { restaurantStatuses } from "../config/constants.js";

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    heroImage: {
      type: String,
      default: "",
    },
    cuisineTypes: {
      type: [String],
      default: [],
    },
    openingHours: {
      type: String,
      default: "10:00 AM - 11:00 PM",
    },
    status: {
      type: String,
      enum: restaurantStatuses,
      default: "active",
    },
    totalTables: {
      type: Number,
      default: 0,
    },
    totalStaff: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    address: {
      line: String,
      city: String,
      state: String,
      country: String,
      pincode: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Restaurant", restaurantSchema);
