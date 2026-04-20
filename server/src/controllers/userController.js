import bcrypt from "bcryptjs";

import { isDemoMode } from "../config/env.js";
import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/User.js";
import { roles } from "../config/constants.js";
import { demoStore } from "../services/demoStore.js";
import { buildListFilter, buildScopeFilter, mergeFilters, scopePayloadToUser } from "../services/queryService.js";

const normalizeText = (value = "") => String(value).trim();
const normalizeEmail = (value = "") => String(value).trim().toLowerCase();

const sanitizeUserPayload = (req, payload) => {
  const nextPayload = scopePayloadToUser(req, "User", payload);

  if (nextPayload.email !== undefined) {
    nextPayload.email = normalizeEmail(nextPayload.email);
  }

  if (nextPayload.name !== undefined) {
    nextPayload.name = normalizeText(nextPayload.name);
  }

  if (nextPayload.phone !== undefined) {
    nextPayload.phone = normalizeText(nextPayload.phone);
  }

  if (nextPayload.avatar !== undefined) {
    nextPayload.avatar = normalizeText(nextPayload.avatar);
  }

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

const removeBlankPassword = (payload) => {
  const nextPayload = { ...payload };

  if (!String(nextPayload.password || "").trim()) {
    delete nextPayload.password;
  }

  return nextPayload;
};

const ensurePasswordForCreate = (payload) => {
  if (!String(payload.password || "").trim()) {
    throw new Error("Password is required when creating a user");
  }

  return payload;
};

const findExistingUserByEmail = async (email) => {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return null;
  }

  if (isDemoMode) {
    return demoStore.findUserByEmail(normalizedEmail);
  }

  return User.findOne({ email: normalizedEmail });
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
  const payload = ensurePasswordForCreate(sanitizeUserPayload(req, req.body));
  const existingUser = await findExistingUserByEmail(payload.email);

  if (existingUser) {
    res.status(400);
    throw new Error("A user with this email already exists");
  }

  if (isDemoMode) {
    const user = await demoStore.createOrUpdateUser(payload);
    res.status(201).json(user);
    return;
  }

  const user = await User.create(payload);
  const populatedUser = await User.findById(user._id).populate("restaurant");
  res.status(201).json(populatedUser);
});

export const updateUser = asyncHandler(async (req, res) => {
  const scope = buildScopeFilter(req, "User");
  const sanitizedPayload = removeBlankPassword(sanitizeUserPayload(req, req.body));

  if (sanitizedPayload.email) {
    const existingUser = await findExistingUserByEmail(sanitizedPayload.email);

    if (existingUser && String(existingUser._id) !== String(req.params.id)) {
      res.status(400);
      throw new Error("A user with this email already exists");
    }
  }

  if (isDemoMode) {
    const user = await demoStore.createOrUpdateUser(sanitizedPayload, req.params.id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.json(user);
    return;
  }

  const payload = await hashPasswordIfPresent(sanitizedPayload);
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
