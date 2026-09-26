import mongoose from "mongoose";

import {
  ATTENDANCE_STATUS,
} from "../constants/attendance.js";

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    shift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shift",
      required: true,
    },

    attendanceDate: {
      type: String,
      required: true,
    },

    checkIn: {
      type: Date,
      default: null,
    },

    checkOut: {
      type: Date,
      default: null,
    },

    workingMinutes: {
      type: Number,
      min: 0,
      default: 0,
    },

    lateMinutes: {
      type: Number,
      min: 0,
      default: 0,
    },

    status: {
      type: String,
      enum: Object.values(ATTENDANCE_STATUS),
      default: ATTENDANCE_STATUS.PRESENT,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

attendanceSchema.index(
  {
    employee: 1,
    attendanceDate: 1,
  },
  {
    unique: true,
  }
);
attendanceSchema.index({
  attendanceDate: 1,
  status: 1,
  employee: 1,
});

attendanceSchema.index({
  status: 1,
  attendanceDate: -1,
});

const Attendance = mongoose.model(
  "Attendance",
  attendanceSchema
);

export default Attendance;