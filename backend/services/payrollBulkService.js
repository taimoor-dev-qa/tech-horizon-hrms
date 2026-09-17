import Employee
  from "../models/Employee.js";

import {
  createPayroll,
} from "./payrollService.js";

import {
  validatePayrollMonth,
} from "./payrollValidationService.js";

import {
  validatePayrollMonthPolicy,
} from "./payrollPolicyService.js";

export const generateBulkPayroll =
  async (
    month,
    userId
  ) => {
    validatePayrollMonth(month);

    await validatePayrollMonthPolicy(
      month
    );

    const employees =
      await Employee.find({
        status: {
          $in: [
            "active",
            "on_leave",
          ],
        },
      }).select(
        "_id employeeId"
      );

    const results = {
      month,
      created: [],
      skipped: [],
      failed: [],
    };

    for (
      const employee
      of employees
    ) {
      try {
        const payroll =
          await createPayroll(
            {
              employee:
                employee._id,

              month,
            },
            userId
          );

        results.created.push({
          employee:
            employee.employeeId,

          payrollId:
            payroll._id,
        });
      } catch (error) {
        if (
          error.message.includes(
            "Payroll already exists"
          )
        ) {
          results.skipped.push({
            employee:
              employee.employeeId,

            reason:
              error.message,
          });

          continue;
        }

        results.failed.push({
          employee:
            employee.employeeId,

          reason:
            error.message,
        });
      }
    }

    return results;
  };