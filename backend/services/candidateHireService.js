import AppError from "../utils/AppError.js";
import Candidate
  from "../models/Candidate.js";

import Job
  from "../models/Job.js";

import {
  createEmployee,
} from "./employeeService.js";

import {
  CANDIDATE_STATUS,
  JOB_STATUS,
} from "../constants/recruitment.js";

import runTransaction
  from "../utils/runTransaction.js";

export const hireCandidate =
  async (
    candidateId,
    data
  ) => {
    if (
      !data.temporaryPassword ||
      !data.joiningDate
    ) {
      throw new AppError("Temporary password and joining date are required", 400);
    }

    return runTransaction(
      async (session) => {
        const candidate =
          await Candidate
            .findById(
              candidateId
            )
            .session(session);

        if (!candidate) {
          throw new AppError("Candidate not found", 400);
        }

        if (candidate.employee) {
          throw new AppError("Candidate has already been converted to employee", 400);
        }

        if (
          candidate.status !==
          CANDIDATE_STATUS.OFFER
        ) {
          throw new AppError("Candidate must be in offer stage before hiring", 400);
        }

        const job =
          await Job
            .findById(
              candidate.job
            )
            .session(session);

        if (!job) {
          throw new AppError("Candidate job not found", 400);
        }

        if (
          job.filledPositions >=
          job.vacancies
        ) {
          throw new AppError("No vacancies are available for this job", 400);
        }

        const employee =
          await createEmployee(
            {
              name:
                candidate.name,

              email:
                candidate.email,

              password:
                data
                  .temporaryPassword,

              role:
                data.role ||
                "employee",

              phone:
                candidate.phone,

              department:
                job.department,

              designation:
                job.designation,

              team:
                data.team ||
                null,

              manager:
                data.manager ||
                null,

              teamLead:
                data.teamLead ||
                null,

              shift:
                data.shift ||
                null,

              joiningDate:
                data.joiningDate,

              employmentType:
                data
                  .employmentType ||
                job
                  .employmentType,

              workLocation:
                data
                  .workLocation ||
                job.location,
            },

            session
          );

        candidate.status =
          CANDIDATE_STATUS.HIRED;

        candidate.employee =
          employee._id;

        candidate.hiredAt =
          new Date();

        await candidate.save({
          session,
        });

        job.filledPositions += 1;

        if (
          job.filledPositions >=
          job.vacancies
        ) {
          job.status =
            JOB_STATUS.CLOSED;
        }

        await job.save({
          session,
        });

        return {
          candidate,
          employee,
        };
      }
    );
  };
