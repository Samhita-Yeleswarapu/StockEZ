import express from "express";
import { getPortfolio, getPortfolioSummary } from "../controllers/portfolioController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, getPortfolio);
router.get("/summary", verifyToken, getPortfolioSummary);

export default router;
