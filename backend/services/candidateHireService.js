import Candidate from "../models/Candidate.js";
import Employee from "../models/Employee.js";
import User from "../models/User.js";

import {
  createEmployee,
} from "./employeeService.js";

import {
  CANDIDATE_STATUS,
  JOB_STATUS,
} from "../constants/recruitment.js";

export const hireCandidate = async (
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

  const candidate = await Candidate.findById(
    candidateId
  ).populate("job");

  if (!candidate) {
    throw new Error("Candidate not found");
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

  const employee = await createEmployee({
    name: candidate.name,
    email: candidate.email,
    password: data.temporaryPassword,
    role: data.role || "employee",

    phone: candidate.phone,

    department:
      candidate.job.department,

    designation:
      candidate.job.designation,

    team: data.team || null,
    manager: data.manager || null,
    teamLead: data.teamLead || null,
    shift: data.shift || null,

    joiningDate: data.joiningDate,

    employmentType:
      data.employmentType ||
      candidate.job.employmentType,

    workLocation:
      data.workLocation ||
      candidate.job.location,
  });

  try {
    candidate.status =
      CANDIDATE_STATUS.HIRED;

    candidate.employee = employee._id;
    candidate.hiredAt = new Date();

    await candidate.save();

    candidate.job.filledPositions += 1;

    if (
      candidate.job.filledPositions >=
      candidate.job.vacancies
    ) {
      candidate.job.status =
        JOB_STATUS.CLOSED;
    }

    await candidate.job.save();

    return {
      candidate,
      employee,
    };
  } catch (error) {
    await Employee.findByIdAndDelete(
      employee._id
    );

    await User.findByIdAndDelete(
      employee.user
    );

    throw error;
  }
};