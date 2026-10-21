import AppError from "../utils/AppError.js";
import {
  getCurrentDate,
} from "./attendanceTimeService.js";

import {
  getRuntimeCompanySettings,
} from "./companySettingsRuntimeService.js";

export const getPayrollPolicy =
  async () => {
    const settings =
      await getRuntimeCompanySettings();

    return {
      timezone: settings.timezone,
      currency: settings.currency,
      ...settings.payroll,
    };
  };

export const validatePayrollMonthPolicy =
  async (month) => {
    const policy =
      await getPayrollPolicy();

    const today =
      getCurrentDate(
        policy.timezone
      );

    const currentMonth =
      today.slice(0, 7);

    if (month > currentMonth) {
      throw new AppError("Future month payroll cannot be created", 400);
    }

    return policy;
  };

export const validatePayrollGenerationDay =
  async (month) => {
    const policy =
      await getPayrollPolicy();

    const today =
      getCurrentDate(
        policy.timezone
      );

    const currentMonth =
      today.slice(0, 7);

    if (month > currentMonth) {
      throw new AppError("Future month payroll cannot be generated", 400);
    }

    if (month < currentMonth) {
      return policy;
    }

    const currentDay =
      Number(today.slice(8, 10));

    if (
      currentDay <
      policy.payrollDay
    ) {
      throw new AppError(`Payroll cannot be generated before day ${policy.payrollDay}`, 400);
    }

    return policy;
  };
