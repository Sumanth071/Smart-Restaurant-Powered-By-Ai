import mongoose from "mongoose";

import { menuCategories } from "../config/constants.js";

const menuItemSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: menuCategories,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
    },
    isVeg: {
      type: Boolean,
      default: false,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    spiceLevel: {
      type: String,
      enum: ["Mild", "Medium", "Hot"],
      default: "Medium",
    },
    prepTime: {
      type: Number,
      default: 20,
    },
    image: {
      type: String,
      default: "",
    },
    tags: {
      type: [String],
      default: [],
    },
    popularityScore: {
      type: Number,
      default: 70,
    },
  },
  { timestamps: true }
);

export default mongoose.model("MenuItem", menuItemSchema);
