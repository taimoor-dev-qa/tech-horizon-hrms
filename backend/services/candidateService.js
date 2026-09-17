import Candidate from "../models/Candidate.js";
import Job from "../models/Job.js";

import {
    CANDIDATE_STATUS,
} from "../constants/recruitment.js";

export const createCandidate = async (
    data
) => {
    const job = await Job.findById(data.job);

    if (!job) {
        throw new Error("Job not found");
    }

    if (job.status !== "open") {
        throw new Error(
            "Candidate can only be added to an open job"
        );
    }

    const existing =
        await Candidate.findOne({
            job: data.job,
            email: data.email.toLowerCase(),
        });

    if (existing) {
        throw new Error(
            "Candidate already exists for this job"
        );
    }

    return Candidate.create(data);
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
        throw new Error(
            "Invalid candidate status"
        );

    }
    if (status === CANDIDATE_STATUS.HIRED) {
        throw new Error(
            "Use the candidate hire endpoint to hire a candidate"
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
    return Candidate.findByIdAndUpdate(
        id,
        data,
        {
            new: true,
            runValidators: true,
        }
    );
};