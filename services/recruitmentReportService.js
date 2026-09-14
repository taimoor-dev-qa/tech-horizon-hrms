import Candidate from "../models/Candidate.js";
import Job from "../models/Job.js";

export const getRecruitmentReport =
  async ({
    job,
    candidateStatus,
    jobStatus,
    department,
  } = {}) => {
    const candidateFilter = {};
    const jobFilter = {};

    if (job) {
      candidateFilter.job = job;
    }

    if (candidateStatus) {
      candidateFilter.status =
        candidateStatus;
    }

    if (jobStatus) {
      jobFilter.status = jobStatus;
    }

    if (department) {
      jobFilter.department = department;
    }

    const jobs = await Job.find(jobFilter)
      .populate(
        "department",
        "name code"
      )
      .populate(
        "designation",
        "name code"
      );

    if (!job && (department || jobStatus)) {
      candidateFilter.job = {
        $in: jobs.map(
          (item) => item._id
        ),
      };
    }

    const candidates =
      await Candidate.find(
        candidateFilter
      )
        .populate(
          "job",
          "title code status"
        )
        .sort({ createdAt: -1 });

    const summary = {
      totalJobs: jobs.length,
      totalCandidates:
        candidates.length,
      applied: 0,
      screening: 0,
      interview: 0,
      technicalInterview: 0,
      selected: 0,
      offer: 0,
      hired: 0,
      rejected: 0,
    };

    candidates.forEach((candidate) => {
      const status =
        candidate.status;

      if (status === "applied") {
        summary.applied += 1;
      }

      if (status === "screening") {
        summary.screening += 1;
      }

      if (status === "interview") {
        summary.interview += 1;
      }

      if (
        status ===
        "technical_interview"
      ) {
        summary.technicalInterview += 1;
      }

      if (status === "selected") {
        summary.selected += 1;
      }

      if (status === "offer") {
        summary.offer += 1;
      }

      if (status === "hired") {
        summary.hired += 1;
      }

      if (status === "rejected") {
        summary.rejected += 1;
      }
    });

    return {
      summary,
      jobs,
      candidates,
    };
  };