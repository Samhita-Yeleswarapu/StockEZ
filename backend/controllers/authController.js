import bcrypt from "bcryptjs";

import { UserModel } from "../models/User.js";
import { PortfolioModel } from "../models/Portfolio.js";
import { generateToken } from "../utils/generateToken.js";


// REGISTER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, initialBalance } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await UserModel.findOne({
      email,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      ...(initialBalance ? { balance: Number(initialBalance) } : {}),
    });

    await PortfolioModel.create({
      userId: user._id,
      holdings: [],
    });

    const token = generateToken(
      user._id,
      user.role
    );

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({
      email,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(
      user._id,
      user.role
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        balance: user.balance,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// PROFILE
export const getProfile = async (req, res) => {
  try {
    const user = await UserModel.findById(
      req.user.userId
    ).select("-password");

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};