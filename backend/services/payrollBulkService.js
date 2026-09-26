import Employee
  from "../models/Employee.js";

import SalaryStructure
  from "../models/SalaryStructure.js";

import {
  createPayroll,
} from "./payrollService.js";

import {
  validatePayrollMonthPolicy,
} from "./payrollPolicyService.js";

import {
  getMonthRange,
} from "./payrollPeriodService.js";

export const generateBulkPayroll =
  async (
    month,
    userId
  ) => {
    await validatePayrollMonthPolicy(
      month
    );

    const {
      startDate,
      endDate,
    } =
      getMonthRange(
        month
      );

    /*
     * Active + historical salary
     * structures dono consider honge.
     *
     * Resigned employee ki salary
     * structure deactivate ho sakti hai.
     */
    const salaryStructures =
      await SalaryStructure.find({
        effectiveFrom: {
          $lte: endDate,
        },

        $or: [
          {
            effectiveTo:
              null,
          },

          {
            effectiveTo: {
              $gte:
                startDate,
            },
          },
        ],
      }).select(
        "employee"
      );

    const employeeIds = [
      ...new Set(
        salaryStructures.map(
          (salary) =>
            String(
              salary.employee
            )
        )
      ),
    ];

    const monthStart =
      new Date(
        `${startDate}T00:00:00Z`
      );

    const monthEnd =
      new Date(
        `${endDate}T23:59:59.999Z`
      );

    /*
     * Status ke bajaye actual
     * employment period use hoga.
     *
     * Isliye month ke beech resign
     * hone wala employee final
     * payroll mein include hoga.
     */
    const employees =
      await Employee.find({
        _id: {
          $in:
            employeeIds,
        },

        joiningDate: {
          $lte:
            monthEnd,
        },

        $or: [
          {
            employmentEndDate:
              null,
          },

          {
            employmentEndDate: {
              $gte:
                monthStart,
            },
          },
        ],
      })
        .select(
          "_id employeeId"
        )
        .sort({
          employeeId: 1,
        });

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