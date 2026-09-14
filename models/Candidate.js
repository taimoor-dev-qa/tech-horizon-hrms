import mongoose from "mongoose";

import {
    CANDIDATE_STATUS,
} from "../constants/recruitment.js";

const candidateSchema = new mongoose.Schema(
    {
        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        phone: {
            type: String,
            required: true,
            trim: true,
        },

        experienceYears: {
            type: Number,
            min: 0,
            default: 0,
        },

        currentCompany: {
            type: String,
            trim: true,
            default: "",
        },

        expectedSalary: {
            type: Number,
            min: 0,
            default: 0,
        },

        cvUrl: {
            type: String,
            trim: true,
            default: "",
        },

        notes: {
            type: String,
            trim: true,
            default: "",
        },

        status: {
            type: String,
            enum: Object.values(CANDIDATE_STATUS),
            default: CANDIDATE_STATUS.APPLIED,
        },
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            default: null,
        },

        hiredAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

candidateSchema.index(
    {
        job: 1,
        email: 1,
    },
    {
        unique: true,
    }
);

const Candidate = mongoose.model(
    "Candidate",
    candidateSchema
);

export default Candidate;