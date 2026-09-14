import express from "express";

import {
  getMyLeaveBalances,
} from "../controllers/leaveBalanceController.js";

import protect
  from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/me",
  protect,
  getMyLeaveBalances
);

export default router;