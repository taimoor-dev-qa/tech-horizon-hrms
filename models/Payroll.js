import mongoose from "mongoose";

import {
    DEFAULT_CURRENCY,
    PAYROLL_STATUS,
} from "../constants/payroll.js";

const payrollSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
        },

        salaryStructure: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SalaryStructure",
            required: true,
        },

        month: {
            type: String,
            required: true,
        },

        basicSalary: {
            type: Number,
            min: 0,
            required: true,
        },

        allowances: {
            housing: {
                type: Number,
                default: 0,
            },
            medical: {
                type: Number,
                default: 0,
            },
            transport: {
                type: Number,
                default: 0,
            },
            other: {
                type: Number,
                default: 0,
            },
        },
        workingDays: {
            type: Number,
            min: 0,
            default: 0,
        },

        absentDays: {
            type: Number,
            min: 0,
            default: 0,
        },

        halfDays: {
            type: Number,
            min: 0,
            default: 0,
        },

        unpaidLeaveDays: {
            type: Number,
            min: 0 ,
            default: 0,
        },
        overtimeHours: {
            type: Number,
            min: 0,
            default: 0,
        },

        overtimeAmount: {
            type: Number,
            min: 0,
            default: 0,
        },

        bonus: {
            type: Number,
            min: 0,
            default: 0,
        },

        deductions: {
            tax: {
                type: Number,
                default: 0,
            },
            providentFund: {
                type: Number,
                default: 0,
            },
            loan: {
                type: Number,
                default: 0,
            },
            absence: {
                type: Number,
                default: 0,
            },
            unpaidLeave: {
                type: Number,
                default: 0,
            },
            other: {
                type: Number,
                default: 0,
            },
        },

        grossSalary: {
            type: Number,
            required: true,
        },

        totalDeductions: {
            type: Number,
            required: true,
        },

        netSalary: {
            type: Number,
            required: true,
        },

        currency: {
            type: String,
            default: DEFAULT_CURRENCY,
        },

        status: {
            type: String,
            enum: Object.values(PAYROLL_STATUS),
            default: PAYROLL_STATUS.DRAFT,
        },

        generatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        generatedAt: {
            type: Date,
            default: null,
        },

        paidAt: {
            type: Date,
            default: null,
        },

        paymentReference: {
            type: String,
            trim: true,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

payrollSchema.index(
    {
        employee: 1,
        month: 1,
    },
    {
        unique: true,
    }
);

const Payroll = mongoose.model(
    "Payroll",
    payrollSchema
);

export default Payroll;