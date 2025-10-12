// User controller functions will go here

import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { TeamMember } from "../entities/Team";

const userRepo = AppDataSource.getRepository(User);

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    const existing = await userRepo.findOneBy({ email });
    if (existing)
      return res.status(400).json({ message: "Email already in use" });
    const hashed = await bcrypt.hash(password, 10);
    const user = userRepo.create({ email, password: hashed, name });
    await userRepo.save(user);
    res.status(201).json({ message: "User registered" });
  } catch (err) {
    res.status(500).json({ message: "Registration error", error: err });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await userRepo.findOneBy({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid credentials" });
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    );
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login error", error: err });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    // req.userId should be set by auth middleware
    const userId = (req as any).userId;
    const user = await userRepo.findOneBy({ id: userId });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ message: "Profile error", error: err });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { name } = req.body;
    const user = await userRepo.findOneBy({ id: userId });
    if (!user) return res.status(404).json({ message: "User not found" });
    user.name = name;
    await userRepo.save(user);
    res.json({ message: "Profile updated", name: user.name });
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile", error: err });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { currentPassword, newPassword } = req.body;
    const user = await userRepo.findOneBy({ id: userId });
    if (!user) return res.status(404).json({ message: "User not found" });
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid)
      return res.status(400).json({ message: "Current password is incorrect" });
    user.password = await bcrypt.hash(newPassword, 10);
    await userRepo.save(user);
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to change password", error: err });
  }
};


