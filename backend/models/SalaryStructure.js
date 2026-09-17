import mongoose from "mongoose";

import {
  DEFAULT_CURRENCY,
} from "../constants/payroll.js";

const salaryStructureSchema =
  new mongoose.Schema(
    {
      employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true,
      },

      basicSalary: {
        type: Number,
        required: true,
        min: 0,
      },

      allowances: {
        housing: {
          type: Number,
          min: 0,
          default: 0,
        },

        medical: {
          type: Number,
          min: 0,
          default: 0,
        },

        transport: {
          type: Number,
          min: 0,
          default: 0,
        },

        other: {
          type: Number,
          min: 0,
          default: 0,
        },
      },

      deductions: {
        tax: {
          type: Number,
          min: 0,
          default: 0,
        },

        providentFund: {
          type: Number,
          min: 0,
          default: 0,
        },

        loan: {
          type: Number,
          min: 0,
          default: 0,
        },

        other: {
          type: Number,
          min: 0,
          default: 0,
        },
      },

      overtimeHourlyRate: {
        type: Number,
        min: 0,
        default: 0,
      },

      currency: {
        type: String,
        uppercase: true,
        trim: true,
        default: DEFAULT_CURRENCY,
      },

      effectiveFrom: {
        type: String,
        required: true,
      },

      effectiveTo: {
        type: String,
        default: null,
      },

      isActive: {
        type: Boolean,
        default: true,
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

salaryStructureSchema.index(
  {
    employee: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      isActive: true,
    },
  }
);

const SalaryStructure = mongoose.model(
  "SalaryStructure",
  salaryStructureSchema
);

export default SalaryStructure;