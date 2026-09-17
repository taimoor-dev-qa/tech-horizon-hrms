import { z } from "zod";

import {
  EMPLOYMENT_TYPES,
  EMPLOYEE_STATUS,
} from "../constants/employee.js";

import {
  dateString,
  enumValue,
  objectId,
  optionalObjectId,
} from "./commonValidators.js";

const employeeRole = enumValue(
  [
    "employee",
    "team_lead",
    "manager",
  ],
  "Invalid employee role"
);

const gender = enumValue(
  [
    "male",
    "female",
    "other",
  ],
  "Invalid gender"
);

export const createEmployeeSchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(2),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email(),

    password: z
      .string()
      .min(6),

    role:
      employeeRole.optional(),

    phone: z
      .string()
      .trim()
      .optional(),

    cnic: z
      .string()
      .trim()
      .optional(),

    dateOfBirth:
      dateString.optional(),

    gender:
      gender.optional(),

    department: objectId,

    designation: objectId,

    team: optionalObjectId,

    manager: optionalObjectId,

    teamLead: optionalObjectId,

    shift: optionalObjectId,

    joiningDate: dateString,

    employmentType: enumValue(
      Object.values(
        EMPLOYMENT_TYPES
      ),
      "Invalid employment type"
    ),

    workLocation: z
      .string()
      .trim()
      .optional(),
  });

export const updateEmployeeSchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(2)
      .optional(),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email()
      .optional(),

    role:
      employeeRole.optional(),

    phone: z
      .string()
      .trim()
      .optional(),

    cnic: z
      .string()
      .trim()
      .optional(),

    dateOfBirth:
      dateString.optional(),

    gender:
      gender.optional(),

    department:
      objectId.optional(),

    designation:
      objectId.optional(),

    team: optionalObjectId,

    manager: optionalObjectId,

    teamLead: optionalObjectId,

    shift: optionalObjectId,

    joiningDate:
      dateString.optional(),

    employmentType:
      enumValue(
        Object.values(
          EMPLOYMENT_TYPES
        ),
        "Invalid employment type"
      ).optional(),

    workLocation: z
      .string()
      .trim()
      .optional(),
  });

export const employeeStatusSchema =
  z.object({
    status: enumValue(
      Object.values(
        EMPLOYEE_STATUS
      ),
      "Invalid employee status"
    ),
  });