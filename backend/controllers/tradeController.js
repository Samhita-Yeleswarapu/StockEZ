import { UserModel } from "../models/User.js";
import { StockModel } from "../models/Stock.js";
import { PortfolioModel } from "../models/Portfolio.js";
import { TransactionModel } from "../models/Transaction.js";


// BUY STOCK
export const buyStock = async (req, res) => {
  try {
    const { stockId, quantity } = req.body;

    if (!stockId || !quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid stock or quantity",
      });
    }

    const user = await UserModel.findById(req.user.userId);

    const stock = await StockModel.findById(stockId);

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: "Stock not found",
      });
    }

    const totalCost = stock.currentPrice * quantity;

    if (user.balance < totalCost) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
      });
    }

    user.balance -= totalCost;
    await user.save();

    const portfolio = await PortfolioModel.findOne({
      userId: user._id,
    });

    const existingHolding = portfolio.holdings.find(
      (holding) =>
        holding.stockId.toString() === stockId
    );

    if (existingHolding) {
      const newQuantity =
        existingHolding.quantity + quantity;

      existingHolding.averagePrice =
        (
          existingHolding.averagePrice *
            existingHolding.quantity +
          stock.currentPrice * quantity
        ) / newQuantity;

      existingHolding.quantity = newQuantity;
    } else {
      portfolio.holdings.push({
        stockId,
        quantity,
        averagePrice: stock.currentPrice,
      });
    }

    await portfolio.save();

    await TransactionModel.create({
      userId: user._id,
      stockId,
      type: "BUY",
      quantity,
      price: stock.currentPrice,
      totalAmount: totalCost,
    });

    res.status(200).json({
      success: true,
      message: "Stock purchased successfully",
      balance: user.balance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// SELL STOCK
export const sellStock = async (req, res) => {
  try {
    const { stockId, quantity } = req.body;

    const user = await UserModel.findById(
      req.user.userId
    );

    const stock = await StockModel.findById(
      stockId
    );

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: "Stock not found",
      });
    }

    const portfolio =
      await PortfolioModel.findOne({
        userId: user._id,
      });

    const holding = portfolio.holdings.find(
      (h) => h.stockId.toString() === stockId
    );

    if (!holding) {
      return res.status(400).json({
        success: false,
        message: "Stock not owned",
      });
    }

    if (holding.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: "Not enough shares",
      });
    }

    const totalAmount =
      stock.currentPrice * quantity;

    holding.quantity -= quantity;

    if (holding.quantity === 0) {
      portfolio.holdings =
        portfolio.holdings.filter(
          (h) =>
            h.stockId.toString() !== stockId
        );
    }

    await portfolio.save();

    user.balance += totalAmount;
    await user.save();

    await TransactionModel.create({
      userId: user._id,
      stockId,
      type: "SELL",
      quantity,
      price: stock.currentPrice,
      totalAmount,
    });

    res.status(200).json({
      success: true,
      message: "Stock sold successfully",
      balance: user.balance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// HISTORY
export const getTransactionHistory =
  async (req, res) => {
    try {
      const transactions =
        await TransactionModel.find({
          userId: req.user.userId,
        })
          .populate(
            "stockId",
            "symbol companyName"
          )
          .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        transactions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };