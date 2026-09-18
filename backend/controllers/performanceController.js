import {
  createPerformanceReview as createService,
  updatePerformanceReview as updateService,
} from "../services/performanceService.js";

import {
  getMyPerformanceReviews as getMyService,
  getPerformanceReviewById as getByIdService,
  getPerformanceReviews as getReviewsService,
} from "../services/performanceQueryService.js";

export const createPerformanceReview =
  async (req, res) => {
    try {
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
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

export const getPerformanceReviews =
  async (req, res) => {
    try {
      const reviews =
        await getReviewsService(
          req.user,
          req.query
        );

      res.status(200).json({
        success: true,
        count: reviews.length,
        reviews,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

export const getMyPerformanceReviews =
  async (req, res) => {
    try {
      const reviews = await getMyService(
        req.user._id
      );

      res.status(200).json({
        success: true,
        count: reviews.length,
        reviews,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });

    }
  };

export const getPerformanceReviewById =
  async (req, res) => {
    try {
      const review =
        await getByIdService(
          req.user,
          req.params.id
        );

      if (!review) {
        return res.status(404).json({
          success: false,
          message:
            "Performance review not found",
        });
      }

      res.status(200).json({
        success: true,
        review,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

export const updatePerformanceReview =
  async (req, res) => {
    try {
      const review = await updateService(
        req.user,
        req.params.id,
        req.body
      );

      if (!review) {
        return res.status(404).json({
          success: false,
          message:
            "Performance review not found",
        });
      }

      res.status(200).json({
        success: true,
        message:
          "Performance review updated successfully",
        review,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };