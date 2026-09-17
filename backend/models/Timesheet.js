import mongoose from "mongoose";

import {
  TIMESHEET_STATUS,
} from "../constants/timesheet.js";

const timesheetSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    workDate: {
      type: String,
      required: [true, "Work date is required"],
    },

    task: {
      type: String,
      required: [true, "Task is required"],
      trim: true,
    },

    hours: {
      type: Number,
      required: [true, "Hours are required"],
      min: 0.25,
      max: 24,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: Object.values(TIMESHEET_STATUS),
      default: TIMESHEET_STATUS.PENDING,
    },

    managerComment: {
      type: String,
      trim: true,
      default: "",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

timesheetSchema.index({
  employee: 1,
  project: 1,
  workDate: 1,
});

const Timesheet = mongoose.model(
  "Timesheet",
  timesheetSchema
);

export default Timesheet;