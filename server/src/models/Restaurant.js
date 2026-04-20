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
      min: [0, "Total tables cannot be negative"],
    },
    totalStaff: {
      type: Number,
      default: 0,
      min: [0, "Total staff cannot be negative"],
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [0, "Rating cannot be negative"],
      max: [5, "Rating cannot exceed 5"],
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
