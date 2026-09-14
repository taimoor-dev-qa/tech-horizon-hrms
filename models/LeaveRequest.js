import mongoose from "mongoose";

import {
    LEAVE_STATUS,
} from "../constants/leave.js";

const leaveRequestSchema =
    new mongoose.Schema(
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

            startDate: {
                type: String,
                required: true,
            },

            endDate: {
                type: String,
                required: true,
            },

            totalDays: {
                type: Number,
                min: 1,
                required: true,
            },

            reason: {
                type: String,
                required: true,
                trim: true,
            },

            status: {
                type: String,
                enum: Object.values(LEAVE_STATUS),
                default: LEAVE_STATUS.PENDING_MANAGER,
            },

            managerComment: {
                type: String,
                trim: true,
                default: "",
            },

            managerReviewedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                default: null,
            },

            managerReviewedAt: {
                type: Date,
                default: null,
            },

            hrReviewedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                default: null,
            },

            hrReviewedAt: {
                type: Date,
                default: null,
            },

            hrComment: {
                type: String,
                trim: true,
                default: "",
            },
        },
        {
            timestamps: true,
        }
    );

const LeaveRequest = mongoose.model(
    "LeaveRequest",
    leaveRequestSchema
);

export default LeaveRequest;