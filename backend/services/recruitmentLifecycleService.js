import AppError from "../utils/AppError.js";
import {
  CANDIDATE_STATUS,
  JOB_STATUS,
} from "../constants/recruitment.js";
import {
  getRuntimeCompanySettings,
} from "./companySettingsRuntimeService.js";
import {
  getCurrentDate,
} from "./attendanceTimeService.js";

const CANDIDATE_STAGE_ORDER = [
  CANDIDATE_STATUS.APPLIED,
  CANDIDATE_STATUS.SCREENING,
  CANDIDATE_STATUS.INTERVIEW,
  CANDIDATE_STATUS.TECHNICAL_INTERVIEW,
  CANDIDATE_STATUS.SELECTED,
  CANDIDATE_STATUS.OFFER,
  CANDIDATE_STATUS.HIRED,
];

export const getRecruitmentCurrentDate =
  async () => {
    const settings =
      await getRuntimeCompanySettings();

    return getCurrentDate(
      settings.timezone
    );
  };

export const validateJobLifecycle = async (
  data,
  existingJob = null
) => {
  const vacancies = Number(
    data.vacancies ??
      existingJob?.vacancies ??
      1
  );
  const filledPositions = Number(
    existingJob?.filledPositions ?? 0
  );
  const status =
    data.status ??
    existingJob?.status ??
    JOB_STATUS.DRAFT;
  const closingDate =
    data.closingDate !== undefined
      ? data.closingDate
      : existingJob?.closingDate;

  if (vacancies < filledPositions) {
    throw new AppError(
      "Vacancies cannot be less than filled positions",
      400
    );
  }

  if (
    status === JOB_STATUS.OPEN &&
    filledPositions >= vacancies
  ) {
    throw new AppError(
      "A job without available vacancies cannot be opened",
      400
    );
  }

  if (
    status === JOB_STATUS.OPEN &&
    closingDate
  ) {
    const today =
      await getRecruitmentCurrentDate();

    if (closingDate < today) {
      throw new AppError(
        "Open job closing date cannot be in the past",
        400
      );
    }
  }
};

export const validateJobAcceptingCandidates =
  async (job) => {
    if (job.status !== JOB_STATUS.OPEN) {
      throw new AppError(
        "Candidate can only be added to an open job",
        400
      );
    }

    if (
      Number(job.filledPositions || 0) >=
      Number(job.vacancies || 0)
    ) {
      throw new AppError(
        "No vacancies are available for this job",
        400
      );
    }

    if (job.closingDate) {
      const today =
        await getRecruitmentCurrentDate();

      if (job.closingDate < today) {
        throw new AppError(
          "Job application deadline has passed",
          400
        );
      }
    }
  };

export const validateCandidateTransition = (
  candidate,
  nextStatus
) => {
  const currentStatus = candidate.status;

  if (nextStatus === currentStatus) {
    return;
  }

  if (
    candidate.employee ||
    currentStatus === CANDIDATE_STATUS.HIRED
  ) {
    throw new AppError(
      "Hired candidate status cannot be changed",
      400
    );
  }

  if (
    currentStatus === CANDIDATE_STATUS.REJECTED
  ) {
    throw new AppError(
      "Rejected candidate status cannot be changed",
      400
    );
  }

  if (nextStatus === CANDIDATE_STATUS.REJECTED) {
    return;
  }

  const currentIndex =
    CANDIDATE_STAGE_ORDER.indexOf(
      currentStatus
    );
  const nextIndex =
    CANDIDATE_STAGE_ORDER.indexOf(
      nextStatus
    );

  if (
    currentIndex === -1 ||
    nextIndex === -1 ||
    nextIndex < currentIndex
  ) {
    throw new AppError(
      "Candidate status cannot move backward",
      400
    );
  }
};
