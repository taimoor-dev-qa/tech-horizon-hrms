import mongoose from "mongoose";

import {
  HOLIDAY_TYPES,
} from "../constants/holiday.js";

const datePattern =
  /^\d{4}-\d{2}-\d{2}$/;

const holidaySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Holiday name is required"],
      trim: true,
    },

    date: {
      type: String,
      required: [true, "Holiday date is required"],
      match: [
        datePattern,
        "Use YYYY-MM-DD format",
      ],
    },

    type: {
      type: String,
      enum: Object.values(HOLIDAY_TYPES),
      default: HOLIDAY_TYPES.PUBLIC,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

holidaySchema.index(
  {
    name: 1,
    date: 1,
  },
  {
    unique: true,
  }
);

const Holiday = mongoose.model(
  "Holiday",
  holidaySchema
);

export default Holiday;