import mongoose from "mongoose";

import {
    EMPLOYMENT_TYPES,
} from "../constants/employee.js";

import {
    JOB_STATUS,
} from "../constants/recruitment.js";

const jobSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Job title is required"],
            trim: true,
        },

        code: {
            type: String,
            required: [true, "Job code is required"],
            unique: true,
            uppercase: true,
            trim: true,
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

        location: {
            type: String,
            trim: true,
            default: "Lahore",
        },

        employmentType: {
            type: String,
            enum: Object.values(EMPLOYMENT_TYPES),
            default: EMPLOYMENT_TYPES.PERMANENT,
        },

        vacancies: {
            type: Number,
            min: 1,
            default: 1,
        },
        filledPositions: {
            type: Number,
            min: 0,
            default: 0,
        },

        experienceYears: {
            type: Number,
            min: 0,
            default: 0,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        requirements: {
            type: [String],
            default: [],
        },

        status: {
            type: String,
            enum: Object.values(JOB_STATUS),
            default: JOB_STATUS.DRAFT,
        },

        closingDate: {
            type: String,
            default: null,
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

const Job = mongoose.model("Job", jobSchema);

export default Job;