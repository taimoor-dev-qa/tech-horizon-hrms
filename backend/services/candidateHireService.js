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
      throw new Error(
        "Temporary password and joining date are required"
      );
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
          throw new Error(
            "Candidate not found"
          );
        }

        if (candidate.employee) {
          throw new Error(
            "Candidate has already been converted to employee"
          );
        }

        if (
          candidate.status !==
          CANDIDATE_STATUS.OFFER
        ) {
          throw new Error(
            "Candidate must be in offer stage before hiring"
          );
        }

        const job =
          await Job
            .findById(
              candidate.job
            )
            .session(session);

        if (!job) {
          throw new Error(
            "Candidate job not found"
          );
        }

        if (
          job.filledPositions >=
          job.vacancies
        ) {
          throw new Error(
            "No vacancies are available for this job"
          );
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