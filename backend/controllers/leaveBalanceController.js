import {
  getMyBalances,
} from "../services/leaveBalanceService.js";

export const getMyLeaveBalances = async (
  req,
  res
) => {
  try {
    const balances = await getMyBalances(
      req.user._id,
      req.query.year
    );

    res.status(200).json({
      success: true,
      balances,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};