import AppError from "../utils/AppError.js";
import SalaryStructure
  from "../models/SalaryStructure.js";

import {
  getValidEmployee,
  validateSalaryDates,
} from "./payrollValidationService.js";

import {
  getRuntimeCompanySettings,
} from "./companySettingsRuntimeService.js";

import {
  getMonthRange,
} from "./payrollPeriodService.js";
import { mapDuplicateKeyError } from "../utils/mongoDuplicateKey.js";

export const createSalaryStructure =
  async (data, userId) => {
    await getValidEmployee(
      data.employee
    );

    validateSalaryDates(
      data.effectiveFrom,
      data.effectiveTo
    );

    const settings =
      await getRuntimeCompanySettings();

    if (
      data.currency &&
      data.currency.toUpperCase() !==
      settings.currency
    ) {
      throw new AppError(`Salary currency must match company currency (${settings.currency})`, 400);
    }

    const existing =
      await SalaryStructure.findOne({
        employee: data.employee,
        isActive: true,
      });

    if (existing) {
      throw new AppError("Employee already has an active salary structure", 400);
    }

    try {
      return await SalaryStructure.create({
        ...data,

        currency:
          settings.currency,

        createdBy:
          userId,
      });
    } catch (error) {
      throw mapDuplicateKeyError(
        error,
        [
          {
            fields: ["employee"],
            message: "Employee already has an active salary structure",
          },
        ]
      );
    }
  };

export const getSalaryStructures =
  async () => {
    return SalaryStructure.find()
      .populate({
        path: "employee",
        select:
          "employeeId user department designation",
        populate: [
          {
            path: "user",
            select: "name email",
          },
          {
            path: "department",
            select: "name code",
          },
          {
            path: "designation",
            select: "name code",
          },
        ],
      })
      .populate(
        "createdBy",
        "name email role"
      )
      .sort({
        createdAt: -1,
      });
  };

export const getSalaryByEmployee =
  async (employeeId) => {
    return SalaryStructure.findOne({
      employee: employeeId,
      isActive: true,
    }).populate(
      "employee",
      "employeeId user"
    );
  };

export const getSalaryForPayrollMonth =
  async (
    employeeId,
    month,
    periodStart = null,
    periodEnd = null
  ) => {
    const {
      startDate,
      endDate,
    } =
      getMonthRange(
        month
      );

    const requiredStart =
      periodStart ||
      startDate;

    const requiredEnd =
      periodEnd ||
      endDate;

    return SalaryStructure
      .findOne({
        employee:
          employeeId,

        effectiveFrom: {
          $lte:
            requiredStart,
        },

        $or: [
          {
            effectiveTo:
              null,
          },

          {
            effectiveTo: {
              $gte:
                requiredEnd,
            },
          },
        ],
      })
      .sort({
        effectiveFrom: -1,
      });
  };

export const deactivateSalaryStructure =
  async (
    id,
    effectiveTo
  ) => {
    const salary =
      await SalaryStructure.findById(
        id
      );

    if (!salary) {
      return null;
    }

    validateSalaryDates(
      salary.effectiveFrom,
      effectiveTo
    );

    salary.isActive = false;
    salary.effectiveTo =
      effectiveTo;

    await salary.save();

    return salary;
  };
