import {
  acknowledgePerformanceReview as acknowledgeService,
  submitPerformanceReview as submitService,
} from "../services/performanceActionService.js";

export const submitPerformanceReview =
  async (req, res) => {
    try {
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
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

export const acknowledgePerformanceReview =
  async (req, res) => {
    try {
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
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };