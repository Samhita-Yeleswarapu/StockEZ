import { StockModel } from "../models/Stock.js";


// ADD STOCK
export const addStock = async (req, res) => {
  try {
    const {
      symbol,
      companyName,
      currentPrice,
      sector,
      marketCap,
      description,
    } = req.body;

    const existingStock = await StockModel.findOne({
      symbol,
    });

    if (existingStock) {
      return res.status(400).json({
        success: false,
        message: "Stock already exists",
      });
    }

    const stock = await StockModel.create({
      symbol,
      companyName,
      currentPrice,
      sector,
      marketCap,
      description,
    });

    res.status(201).json({
      success: true,
      stock,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// GET ALL STOCKS
export const getAllStocks = async (req, res) => {
  try {
    const stocks = await StockModel.find().sort({
      companyName: 1,
    });

    res.status(200).json({
      success: true,
      count: stocks.length,
      stocks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// GET STOCK BY SYMBOL
export const getStockBySymbol = async (req, res) => {
  try {
    const stock = await StockModel.findOne({
      symbol: req.params.symbol.toUpperCase(),
    });

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: "Stock not found",
      });
    }

    res.status(200).json({
      success: true,
      stock,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// SEARCH STOCK
export const searchStocks = async (req, res) => {
  try {
    const keyword = req.params.keyword;

    const stocks = await StockModel.find({
      $or: [
        {
          symbol: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          companyName: {
            $regex: keyword,
            $options: "i",
          },
        },
      ],
    });

    res.status(200).json({
      success: true,
      count: stocks.length,
      stocks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// UPDATE STOCK
export const updateStock = async (req, res) => {
  try {
    const stock = await StockModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: "Stock not found",
      });
    }

    res.status(200).json({
      success: true,
      stock,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// DELETE STOCK
export const deleteStock = async (req, res) => {
  try {
    const stock = await StockModel.findByIdAndDelete(
      req.params.id
    );

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: "Stock not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Stock deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};