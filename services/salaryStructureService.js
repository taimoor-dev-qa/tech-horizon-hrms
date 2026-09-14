import SalaryStructure
  from "../models/SalaryStructure.js";

import {
  getValidEmployee,
  validateSalaryDates,
} from "./payrollValidationService.js";

export const createSalaryStructure =
  async (data, userId) => {
    await getValidEmployee(data.employee);

    validateSalaryDates(
      data.effectiveFrom,
      data.effectiveTo
    );

    const existing =
      await SalaryStructure.findOne({
        employee: data.employee,
        isActive: true,
      });

    if (existing) {
      throw new Error(
        "Employee already has an active salary structure"
      );
    }

    return SalaryStructure.create({
      ...data,
      createdBy: userId,
    });
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
      .sort({ createdAt: -1 });
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

export const deactivateSalaryStructure =
  async (id, effectiveTo) => {
    const salary =
      await SalaryStructure.findById(id);

    if (!salary) {
      return null;
    }

    salary.isActive = false;
    salary.effectiveTo = effectiveTo;

    await salary.save();

    return salary;
  };