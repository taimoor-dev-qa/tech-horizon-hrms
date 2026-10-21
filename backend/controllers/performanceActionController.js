import asyncHandler from "../utils/asyncHandler.js";
import {
  acknowledgePerformanceReview as acknowledgeService,
  submitPerformanceReview as submitService,
} from "../services/performanceActionService.js";

export const submitPerformanceReview = asyncHandler(async (req, res) => {
  const review = await submitService(
    req.params.id,
    req.user
  );

  res.status(200).json({
    success: true,
    message:
      "Performance review submitted successfully",
    review,
  });
});

export const acknowledgePerformanceReview = asyncHandler(async (req, res) => {
  const review =
    await acknowledgeService(
      req.params.id,
      req.user._id,
      req.body.comment
    );

  res.status(200).json({
    success: true,
    message:
      "Performance review acknowledged successfully",
    review,
  });
});
