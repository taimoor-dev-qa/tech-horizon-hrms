import mongoose from "mongoose";

import {
  PERFORMANCE_MAX_RATING,
  PERFORMANCE_MIN_RATING,
  PERFORMANCE_STATUS,
} from "../constants/performance.js";

const ratingField = {
  type: Number,
  min: PERFORMANCE_MIN_RATING,
  max: PERFORMANCE_MAX_RATING,
  required: true,
};

const performanceReviewSchema =
  new mongoose.Schema(
    {
      employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true,
      },

      reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      periodStart: {
        type: String,
        required: true,
      },

      periodEnd: {
        type: String,
        required: true,
      },

      ratings: {
        technicalSkills: ratingField,
        productivity: ratingField,
        communication: ratingField,
        teamwork: ratingField,
        attendance: ratingField,
      },

      overallScore: {
        type: Number,
        min: PERFORMANCE_MIN_RATING,
        max: PERFORMANCE_MAX_RATING,
        required: true,
      },

      strengths: {
        type: String,
        trim: true,
        default: "",
      },

      improvements: {
        type: String,
        trim: true,
        default: "",
      },

      goals: {
        type: String,
        trim: true,
        default: "",
      },

      reviewerComment: {
        type: String,
        trim: true,
        default: "",
      },

      employeeComment: {
        type: String,
        trim: true,
        default: "",
      },

      status: {
        type: String,
        enum: Object.values(PERFORMANCE_STATUS),
        default: PERFORMANCE_STATUS.DRAFT,
      },

      submittedAt: {
        type: Date,
        default: null,
      },

      acknowledgedAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

performanceReviewSchema.index(
  {
    employee: 1,
    periodStart: 1,
    periodEnd: 1,
  },
  {
    unique: true,
  }
);

const PerformanceReview = mongoose.model(
  "PerformanceReview",
  performanceReviewSchema
);

export default PerformanceReview;