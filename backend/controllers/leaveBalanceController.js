import asyncHandler from "../utils/asyncHandler.js";
import {
  getMyBalances,
} from "../services/leaveBalanceService.js";

export const getMyLeaveBalances = asyncHandler(async (req, res) => {
  const balances = await getMyBalances(
    req.user._id,
    req.query.year
  );

  res.status(200).json({
    success: true,
    balances,
  });
});
