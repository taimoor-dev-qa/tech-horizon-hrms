import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  createPerformanceReview as createService,
  updatePerformanceReview as updateService,
} from "../services/performanceService.js";

import {
  getMyPerformanceReviews as getMyService,
  getPerformanceReviewById as getByIdService,
  getPerformanceReviews as getReviewsService,
} from "../services/performanceQueryService.js";

export const createPerformanceReview = asyncHandler(async (req, res) => {
  const review = await createService(
    req.user,
    req.body
  );

  res.status(201).json({
    success: true,
    message:
      "Performance review created successfully",
    review,
  });
});

export const getPerformanceReviews = asyncHandler(async (req, res) => {
  const result =
    await getReviewsService(
      req.user,
      req.query
    );

  res.status(200).json({
    success: true,

    count:
      result
        .reviews
        .length,

    pagination:
      result.pagination,

    reviews:
      result.reviews,
  });
});

export const getMyPerformanceReviews = asyncHandler(async (req, res) => {
  const result =
    await getMyService(
      req.user._id,
      req.query
    );

  res.status(200).json({
    success: true,

    count:
      result
        .reviews
        .length,

    pagination:
      result.pagination,

    reviews:
      result.reviews,
  });
});

export const getPerformanceReviewById = asyncHandler(async (req, res) => {
  const review =
    await getByIdService(
      req.user,
      req.params.id
    );

  if (!review) {
    throw new AppError("Performance review not found", 404);
  }

  res.status(200).json({
    success: true,
    review,
  });
});

export const updatePerformanceReview = asyncHandler(async (req, res) => {
  const review = await updateService(
    req.user,
    req.params.id,
    req.body
  );

  if (!review) {
    throw new AppError("Performance review not found", 404);
  }

  res.status(200).json({
    success: true,
    message:
      "Performance review updated successfully",
    review,
  });
});
