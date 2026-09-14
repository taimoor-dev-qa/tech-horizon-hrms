import mongoose from "mongoose";

import {
    EMPLOYEE_STATUS,
    EMPLOYMENT_TYPES,
} from "../constants/employee.js";

const employeeSchema = new mongoose.Schema(
    {
        employeeId: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        phone: {
            type: String,
            trim: true,
            default: "",
        },

        cnic: {
            type: String,
            trim: true,
            unique: true,
            sparse: true,
            default: undefined,
        },

        dateOfBirth: {
            type: Date,
            default: null,
        },

        gender: {
            type: String,
            enum: ["male", "female", "other"],
            default: null,
        },

        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            required: true,
        },

        designation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Designation",
            required: true,
        },

        team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
            default: null,
        },

        manager: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        teamLead: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        shift: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Shift",
            default: null,
        },

        joiningDate: {
            type: Date,
            required: true,
        },

        employmentType: {
            type: String,
            enum: Object.values(EMPLOYMENT_TYPES),
            default: EMPLOYMENT_TYPES.PERMANENT,
        },

        workLocation: {
            type: String,
            trim: true,
            default: "Office",
        },

        status: {
            type: String,
            enum: Object.values(EMPLOYEE_STATUS),
            default: EMPLOYEE_STATUS.ACTIVE,
        },
    },
    {
        timestamps: true,
    }
);

const Employee = mongoose.model(
    "Employee",
    employeeSchema
);

export default Employee;