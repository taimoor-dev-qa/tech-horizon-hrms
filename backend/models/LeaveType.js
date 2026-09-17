import mongoose from "mongoose";

const leaveTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Leave type name is required"],
      trim: true,
      unique: true,
    },

    code: {
      type: String,
      required: [true, "Leave type code is required"],
      trim: true,
      uppercase: true,
      unique: true,
    },

    annualQuota: {
      type: Number,
      min: 0,
      default: 0,
    },

    isPaid: {
      type: Boolean,
      default: true,
    },

    requiresDocument: {
      type: Boolean,
      default: false,
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

const LeaveType = mongoose.model(
  "LeaveType",
  leaveTypeSchema
);

export default LeaveType;