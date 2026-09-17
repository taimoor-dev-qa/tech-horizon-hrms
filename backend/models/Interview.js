import mongoose from "mongoose";

import {
  INTERVIEW_MODES,
  INTERVIEW_RESULT,
  INTERVIEW_STATUS,
  INTERVIEW_TYPES,
} from "../constants/interview.js";

const interviewSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },

    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    interviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: Object.values(INTERVIEW_TYPES),
      required: true,
    },

    mode: {
      type: String,
      enum: Object.values(INTERVIEW_MODES),
      required: true,
    },

    scheduledAt: {
      type: Date,
      required: true,
    },

    durationMinutes: {
      type: Number,
      min: 15,
      default: 30,
    },

    location: {
      type: String,
      trim: true,
      default: "",
    },

    meetingLink: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: Object.values(INTERVIEW_STATUS),
      default: INTERVIEW_STATUS.SCHEDULED,
    },

    feedback: {
      type: String,
      trim: true,
      default: "",
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },

    result: {
      type: String,
      enum: Object.values(INTERVIEW_RESULT),
      default: INTERVIEW_RESULT.PENDING,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Interview = mongoose.model(
  "Interview",
  interviewSchema
);

export default Interview;