import { z } from "zod";

import {
  EMPLOYMENT_TYPES,
} from "../constants/employee.js";

import {
  CANDIDATE_STATUS,
  JOB_STATUS,
} from "../constants/recruitment.js";

import {
  INTERVIEW_MODES,
  INTERVIEW_RESULT,
  INTERVIEW_TYPES,
} from "../constants/interview.js";

import {
  dateString,
  dateTimeString,
  enumValue,
  nonNegativeNumber,
  objectId,
  optionalObjectId,
} from "./commonValidators.js";

export const jobSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2),

  code: z
    .string()
    .trim()
    .min(2),

  department: objectId,

  designation: objectId,

  location: z
    .string()
    .trim()
    .optional(),

  employmentType: enumValue(
    Object.values(
      EMPLOYMENT_TYPES
    )
  ),

  vacancies: z
    .number()
    .int()
    .min(1),

  experienceYears:
    nonNegativeNumber.optional(),

  description: z
    .string()
    .trim()
    .min(3),

  requirements: z
    .array(
      z.string().trim().min(1)
    )
    .optional(),

  status: enumValue(
    Object.values(JOB_STATUS)
  ).optional(),

  closingDate:
    dateString.optional().nullable(),
});

export const candidateSchema =
  z.object({
    job: objectId,

    name: z
      .string()
      .trim()
      .min(2),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email(),

    phone: z
      .string()
      .trim()
      .min(5),

    experienceYears:
      nonNegativeNumber.optional(),

    currentCompany: z
      .string()
      .trim()
      .optional(),

    expectedSalary:
      nonNegativeNumber.optional(),

    cvUrl: z
      .string()
      .trim()
      .optional(),

    notes: z
      .string()
      .trim()
      .optional(),
  });

export const candidateStatusSchema =
  z.object({
    status: enumValue(
      Object.values(
        CANDIDATE_STATUS
      )
    ),

    notes: z
      .string()
      .trim()
      .optional(),
  });

export const interviewSchema =
  z.object({
    candidate: objectId,

    interviewer: objectId,

    type: enumValue(
      Object.values(
        INTERVIEW_TYPES
      )
    ),

    mode: enumValue(
      Object.values(
        INTERVIEW_MODES
      )
    ),

    scheduledAt:
      dateTimeString,

    durationMinutes: z
      .number()
      .int()
      .min(15)
      .optional(),

    location: z
      .string()
      .trim()
      .optional(),

    meetingLink: z
      .string()
      .trim()
      .optional(),
  });

export const interviewResultSchema =
  z.object({
    result: enumValue([
      INTERVIEW_RESULT.PASS,
      INTERVIEW_RESULT.FAIL,
    ]),

    rating: z
      .number()
      .min(1)
      .max(5)
      .optional(),

    feedback: z
      .string()
      .trim()
      .max(2000)
      .optional(),
  });

export const candidateHireSchema =
  z.object({
    temporaryPassword: z
      .string()
      .min(6),

    joiningDate: dateString,

    role: enumValue([
      "employee",
      "team_lead",
      "manager",
    ]).optional(),

    team: optionalObjectId,

    manager: optionalObjectId,

    teamLead: optionalObjectId,

    shift: optionalObjectId,

    employmentType: enumValue(
      Object.values(
        EMPLOYMENT_TYPES
      )
    ).optional(),

    workLocation: z
      .string()
      .trim()
      .optional(),
  });

  export const updateJobSchema =
  jobSchema.partial();

  router.put(
  "/:id",
  protect,
  recruitmentAccess,
  validateObjectId("id"),
  validateRequest(
    updateJobSchema
  ),
  updateJob
);

export const updateCandidateSchema =
  candidateSchema
    .omit({
      job: true,
    })
    .partial();