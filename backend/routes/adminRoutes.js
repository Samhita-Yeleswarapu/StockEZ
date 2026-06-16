import express from "express";
import { getAdminStats, getAllUsers, deleteUser, getAllTransactions } from "../controllers/adminController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";

const router = express.Router();

router.use(verifyToken, verifyAdmin);

router.get("/stats", getAdminStats);
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);
router.get("/transactions", getAllTransactions);

export default router;
