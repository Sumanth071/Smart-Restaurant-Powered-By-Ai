import jwt from "jsonwebtoken";

import { isDemoMode } from "../config/env.js";
import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/User.js";
import { roles } from "../config/constants.js";
import { demoStore } from "../services/demoStore.js";

const createToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET || "development-secret", {
    expiresIn: "7d",
  });

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (isDemoMode) {
    const user = await demoStore.register({ name, email, password, phone });
    res.status(201).json({
      token: createToken(user._id),
      user,
    });
    return;
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    res.status(400);
    throw new Error("A user with this email already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: roles.GUEST,
  });

  const safeUser = await User.findById(user._id);

  res.status(201).json({
    token: createToken(user._id),
    user: safeUser,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (isDemoMode) {
    const user = await demoStore.login({ email, password });

    if (!user) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    res.json({
      token: createToken(user._id),
      user,
    });
    return;
  }

  const user = await User.findOne({ email }).select("+password").populate("restaurant");

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  user.lastActive = new Date();
  await user.save();

  const safeUser = await User.findById(user._id).populate("restaurant");

  res.json({
    token: createToken(user._id),
    user: safeUser,
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});
