import bcrypt from "bcryptjs";

import { isDemoMode } from "../config/env.js";
import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/User.js";
import { roles } from "../config/constants.js";
import { demoStore } from "../services/demoStore.js";
import { buildListFilter, buildScopeFilter, mergeFilters, scopePayloadToUser } from "../services/queryService.js";

const sanitizeUserPayload = (req, payload) => {
  const nextPayload = scopePayloadToUser(req, "User", payload);

  if (req.user.role === roles.RESTAURANT_ADMIN && nextPayload.role === roles.SUPER_ADMIN) {
    throw new Error("Restaurant admins cannot create or update super admin accounts");
  }

  return nextPayload;
};

const hashPasswordIfPresent = async (payload) => {
  const nextPayload = { ...payload };

  if (nextPayload.password) {
    const salt = await bcrypt.genSalt(10);
    nextPayload.password = await bcrypt.hash(nextPayload.password, salt);
  } else {
    delete nextPayload.password;
  }

  return nextPayload;
};

export const listUsers = asyncHandler(async (req, res) => {
  if (isDemoMode) {
    const users = demoStore.list("User", req, { searchFields: ["name", "email", "role", "status"], sort: { createdAt: -1 } });
    res.json(users);
    return;
  }

  const filters = buildListFilter(req.query, ["name", "email", "role", "status"]);
  const scope = buildScopeFilter(req, "User");
  const users = await User.find(mergeFilters(filters, scope)).populate("restaurant").sort({ createdAt: -1 });
  res.json(users);
});

export const getUser = asyncHandler(async (req, res) => {
  if (isDemoMode) {
    const user = demoStore.getById("User", req.params.id, req);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.json(user);
    return;
  }

  const scope = buildScopeFilter(req, "User");
  const user = await User.findOne(mergeFilters({ _id: req.params.id }, scope)).populate("restaurant");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json(user);
});

export const createUser = asyncHandler(async (req, res) => {
  if (isDemoMode) {
    const existingUser = demoStore.list("User", { ...req, query: {} }, { sort: { createdAt: -1 } }).find((entry) => entry.email === req.body.email);

    if (existingUser) {
      res.status(400);
      throw new Error("A user with this email already exists");
    }

    const payload = sanitizeUserPayload(req, req.body);
    const user = await demoStore.createOrUpdateUser(payload);
    res.status(201).json(user);
    return;
  }

  const existingUser = await User.findOne({ email: req.body.email });

  if (existingUser) {
    res.status(400);
    throw new Error("A user with this email already exists");
  }

  const payload = sanitizeUserPayload(req, req.body);
  const user = await User.create(payload);
  const populatedUser = await User.findById(user._id).populate("restaurant");
  res.status(201).json(populatedUser);
});

export const updateUser = asyncHandler(async (req, res) => {
  if (isDemoMode) {
    const payload = sanitizeUserPayload(req, req.body);
    const user = await demoStore.createOrUpdateUser(payload, req.params.id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.json(user);
    return;
  }

  const scope = buildScopeFilter(req, "User");
  const basePayload = sanitizeUserPayload(req, req.body);
  const payload = await hashPasswordIfPresent(basePayload);
  const user = await User.findOneAndUpdate(mergeFilters({ _id: req.params.id }, scope), payload, {
    new: true,
    runValidators: true,
  }).populate("restaurant");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json(user);
});

export const deleteUser = asyncHandler(async (req, res) => {
  if (isDemoMode) {
    const removed = demoStore.remove("User", req.params.id, req);

    if (!removed) {
      res.status(404);
      throw new Error("User not found");
    }

    res.json({ message: "User deleted successfully" });
    return;
  }

  const scope = buildScopeFilter(req, "User");
  const user = await User.findOneAndDelete(mergeFilters({ _id: req.params.id }, scope));

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json({ message: "User deleted successfully" });
});
