import express from "express";
import {
  getAllStocks, getStockBySymbol, searchStocks,
  addStock, updateStock, deleteStock
} from "../controllers/stockController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";

const router = express.Router();

router.get("/", verifyToken, getAllStocks);
router.get("/search/:keyword", verifyToken, searchStocks);
router.get("/:symbol", verifyToken, getStockBySymbol);
router.post("/", verifyToken, verifyAdmin, addStock);
router.put("/:id", verifyToken, verifyAdmin, updateStock);
router.delete("/:id", verifyToken, verifyAdmin, deleteStock);

export default router;
