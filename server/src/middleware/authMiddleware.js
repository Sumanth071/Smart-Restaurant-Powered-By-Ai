import jwt from "jsonwebtoken";

import asyncHandler from "./asyncHandler.js";
import User from "../models/User.js";
import { isDemoMode } from "../config/env.js";
import { demoStore } from "../services/demoStore.js";

const findUserById = async (id) => {
  if (isDemoMode) {
    return demoStore.getUserById(id);
  }

  return User.findById(id).populate("restaurant");
};

export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    res.status(401);
    throw new Error("Authentication required");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET || "development-secret");
  const user = await findUserById(decoded.id);

  if (!user) {
    res.status(401);
    throw new Error("Invalid authentication token");
  }

  req.user = user;
  next();
});

export const optionalProtect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "development-secret");
    const user = await findUserById(decoded.id);

    if (user) {
      req.user = user;
    }
  } catch (error) {
    req.user = null;
  }

  next();
});

export const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    res.status(403);
    throw new Error("You do not have permission to perform this action");
  }

  next();
};
