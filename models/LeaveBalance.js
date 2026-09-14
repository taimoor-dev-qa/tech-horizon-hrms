import mongoose from "mongoose";

const leaveBalanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    leaveType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LeaveType",
      required: true,
    },

    year: {
      type: Number,
      required: true,
    },

    allocatedDays: {
      type: Number,
      min: 0,
      default: 0,
    },

    usedDays: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

leaveBalanceSchema.index(
  {
    employee: 1,
    leaveType: 1,
    year: 1,
  },
  {
    unique: true,
  }
);

const LeaveBalance = mongoose.model(
  "LeaveBalance",
  leaveBalanceSchema
);

export default LeaveBalance;