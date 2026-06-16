import { PortfolioModel } from "../models/Portfolio.js";
import { UserModel } from "../models/User.js";
import { StockModel } from "../models/Stock.js";
import { calculatePnL } from "../utils/calculatePnL.js";

// GET USER PORTFOLIO
export const getPortfolio = async (req, res) => {
  try {
    const portfolio = await PortfolioModel.findOne({
      userId: req.user.userId,
    }).populate({
      path: "holdings.stockId",
      model: "Stock",
    });

    res.status(200).json({
      success: true,
      portfolio,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// PORTFOLIO SUMMARY
export const getPortfolioSummary = async (
  req,
  res
) => {
  try {
    const user = await UserModel.findById(
      req.user.userId
    );

    const portfolio = await PortfolioModel.findOne({
      userId: req.user.userId,
    }).populate({
      path: "holdings.stockId",
      model: "Stock",
    });

    const {
      invested,
      currentValue,
      profitLoss,
    } = calculatePnL(portfolio.holdings);

    res.status(200).json({
      success: true,
      summary: {
        balance: user.balance,
        invested,
        currentValue,
        profitLoss,
        totalHoldings:
          portfolio.holdings.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};