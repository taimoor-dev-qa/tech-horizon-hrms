import mongoose from "mongoose";

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

const shiftSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Shift name is required"],
      trim: true,
    },

    code: {
      type: String,
      required: [true, "Shift code is required"],
      trim: true,
      uppercase: true,
      unique: true,
    },

    startTime: {
      type: String,
      required: [true, "Start time is required"],
      match: [timePattern, "Use HH:MM format"],
    },

    endTime: {
      type: String,
      required: [true, "End time is required"],
      match: [timePattern, "Use HH:MM format"],
    },

    breakMinutes: {
      type: Number,
      min: 0,
      default: 60,
    },

    graceMinutes: {
      type: Number,
      min: 0,
      default: 10,
    },

    workingDays: {
      type: [String],
      enum: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ],
      default: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
      ],
    },

    isNightShift: {
      type: Boolean,
      default: false,
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

const Shift = mongoose.model("Shift", shiftSchema);

export default Shift;