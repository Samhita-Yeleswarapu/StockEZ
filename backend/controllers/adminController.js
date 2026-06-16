import { UserModel } from "../models/User.js";
import { StockModel } from "../models/Stock.js";
import { TransactionModel } from "../models/Transaction.js";
import mongoose from "mongoose";

// GET ALL USERS
export const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find().select(
      "-password"
    );

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// DELETE USER
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await UserModel.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL TRANSACTIONS
export const getAllTransactions =
  async (req, res) => {
    try {
      const transactions =
        await TransactionModel.find()
          .populate("userId", "name email")
          .populate(
            "stockId",
            "symbol companyName"
          )
          .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: transactions.length,
        transactions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };


// DASHBOARD STATS
export const getAdminStats = async (
  req,
  res
) => {
  try {
    const totalUsers =
      await UserModel.countDocuments();

    const totalStocks =
      await StockModel.countDocuments();

    const totalTransactions =
      await TransactionModel.countDocuments();

    const buyTrades =
      await TransactionModel.countDocuments({
        type: "BUY",
      });

    const sellTrades =
      await TransactionModel.countDocuments({
        type: "SELL",
      });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalStocks,
        totalTransactions,
        buyTrades,
        sellTrades,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};