import mongoose from "mongoose";

const companySettingsSchema =
  new mongoose.Schema(
    {
      companyName: {
        type: String,
        trim: true,
        default: "Tech Horizon",
      },

      companyEmail: {
        type: String,
        trim: true,
        lowercase: true,
        default: "",
      },

      companyPhone: {
        type: String,
        trim: true,
        default: "",
      },

      address: {
        type: String,
        trim: true,
        default: "",
      },

      website: {
        type: String,
        trim: true,
        default: "",
      },

      timezone: {
        type: String,
        default: "Asia/Karachi",
      },

      currency: {
        type: String,
        uppercase: true,
        default: "PKR",
      },

      attendance: {
        graceMinutes: {
          type: Number,
          min: 0,
          default: 10,
        },

        halfDayAfterMinutes: {
          type: Number,
          min: 0,
          default: 240,
        },

        allowManualAttendance: {
          type: Boolean,
          default: true,
        },
      },

      payroll: {
        payrollDay: {
          type: Number,
          min: 1,
          max: 31,
          default: 30,
        },

        overtimeEnabled: {
          type: Boolean,
          default: true,
        },

        deductAbsence: {
          type: Boolean,
          default: true,
        },

        deductUnpaidLeave: {
          type: Boolean,
          default: true,
        },
      },

      leave: {
        leaveYearStartMonth: {
          type: Number,
          min: 1,
          max: 12,
          default: 1,
        },

        allowPastDateRequest: {
          type: Boolean,
          default: false,
        },

        managerApprovalRequired: {
          type: Boolean,
          default: true,
        },

        hrApprovalRequired: {
          type: Boolean,
          default: true,
        },
      },

      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

const CompanySettings = mongoose.model(
  "CompanySettings",
  companySettingsSchema
);

export default CompanySettings;