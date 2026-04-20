import mongoose from "mongoose";

import { orderStatuses, orderTypes, paymentStatuses } from "../config/constants.js";

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      default: null,
    },
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: [1, "Quantity must be at least 1"],
    },
    price: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Price cannot be negative"],
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
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
    customerName: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    items: {
      type: [orderItemSchema],
      validate: [(value) => value.length > 0, "At least one order item is required"],
    },
    orderType: {
      type: String,
      enum: orderTypes,
      default: "dine-in",
    },
    status: {
      type: String,
      enum: orderStatuses,
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: paymentStatuses,
      default: "pending",
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
    },
    totalAmount: {
      type: Number,
      default: 0,
      min: [0, "Total amount cannot be negative"],
    },
    notes: {
      type: String,
      default: "",
    },
    placedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
