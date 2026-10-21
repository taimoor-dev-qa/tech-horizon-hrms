import Candidate from "../models/Candidate.js";
import Job from "../models/Job.js";

import {
    CANDIDATE_STATUS,
} from "../constants/recruitment.js";

import AppError from "../utils/AppError.js";

const isCandidateEmailDuplicate = (error) => {
    if (error?.code !== 11000) {
        return false;
    }

    const fields = error.keyPattern ?? error.keyValue;
    return fields &&
        Object.keys(fields).length === 2 &&
        Object.hasOwn(fields, "job") &&
        Object.hasOwn(fields, "email");
};

const rethrowCandidateWriteError = (error) => {
    if (isCandidateEmailDuplicate(error)) {
        throw new AppError(
            "Candidate already exists for this job",
            400
        );
    }

    throw error;
};

export const createCandidate = async (
    data
) => {
    const job = await Job.findById(data.job);

    if (!job) {
        throw new AppError("Job not found", 400);
    }

    if (job.status !== "open") {
        throw new AppError(
            "Candidate can only be added to an open job",
            400
        );
    }

    const existing =
        await Candidate.findOne({
            job: data.job,
            email: data.email.toLowerCase(),
        });

    if (existing) {
        throw new AppError(
            "Candidate already exists for this job",
            400
        );
    }

    try {
        return await Candidate.create(data);
    } catch (error) {
        rethrowCandidateWriteError(error);
    }
};

export const updateCandidateStatus = async (
    id,
    status,
    notes
) => {
    const validStatuses = Object.values(
        CANDIDATE_STATUS
    );

    if (!validStatuses.includes(status)) {
        throw new AppError(
            "Invalid candidate status",
            400
        );

    }
    if (status === CANDIDATE_STATUS.HIRED) {
        throw new AppError(
            "Use the candidate hire endpoint to hire a candidate",
            400
        );
    }

    return Candidate.findByIdAndUpdate(
        id,
        {
            status,
            ...(notes !== undefined && { notes }),
        },
        {
            new: true,
            runValidators: true,
        }
    );
};

export const updateCandidate = async (
    id,
    data
) => {
    try {
        return await Candidate.findByIdAndUpdate(
            id,
            data,
            {
                new: true,
                runValidators: true,
            }
        );
    } catch (error) {
        rethrowCandidateWriteError(error);
    }
};
