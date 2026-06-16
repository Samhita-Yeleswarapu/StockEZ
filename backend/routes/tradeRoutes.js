import express from "express";
import { buyStock, sellStock, getTransactionHistory } from "../controllers/tradeController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/buy", verifyToken, buyStock);
router.post("/sell", verifyToken, sellStock);
router.get("/history", verifyToken, getTransactionHistory);

export default router;
