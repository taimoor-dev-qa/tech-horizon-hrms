import CompanySettings
  from "../models/CompanySettings.js";

const DEFAULT_SETTINGS = {
  timezone: "Asia/Karachi",
  currency: "PKR",

  attendance: {
    graceMinutes: 10,
    halfDayAfterMinutes: 240,
    allowManualAttendance: true,
  },

  payroll: {
    payrollDay: 30,
    overtimeEnabled: true,
    deductAbsence: true,
    deductUnpaidLeave: true,
  },

  leave: {
    leaveYearStartMonth: 1,
    allowPastDateRequest: false,
    managerApprovalRequired: true,
    hrApprovalRequired: true,
  },
};

export const getRuntimeCompanySettings =
  async () => {
    const settings =
      await CompanySettings.findOne().lean();

    if (!settings) {
      return DEFAULT_SETTINGS;
    }

    return {
      timezone:
        settings.timezone ||
        DEFAULT_SETTINGS.timezone,

      currency:
        settings.currency ||
        DEFAULT_SETTINGS.currency,

      attendance: {
        graceMinutes:
          settings.attendance
            ?.graceMinutes ??
          DEFAULT_SETTINGS.attendance
            .graceMinutes,

        halfDayAfterMinutes:
          settings.attendance
            ?.halfDayAfterMinutes ??
          DEFAULT_SETTINGS.attendance
            .halfDayAfterMinutes,

        allowManualAttendance:
          settings.attendance
            ?.allowManualAttendance ??
          DEFAULT_SETTINGS.attendance
            .allowManualAttendance,
      },

      payroll: {
        payrollDay:
          settings.payroll
            ?.payrollDay ??
          DEFAULT_SETTINGS.payroll
            .payrollDay,

        overtimeEnabled:
          settings.payroll
            ?.overtimeEnabled ??
          DEFAULT_SETTINGS.payroll
            .overtimeEnabled,

        deductAbsence:
          settings.payroll
            ?.deductAbsence ??
          DEFAULT_SETTINGS.payroll
            .deductAbsence,

        deductUnpaidLeave:
          settings.payroll
            ?.deductUnpaidLeave ??
          DEFAULT_SETTINGS.payroll
            .deductUnpaidLeave,
      },

      leave: {
        leaveYearStartMonth:
          settings.leave
            ?.leaveYearStartMonth ??
          DEFAULT_SETTINGS.leave
            .leaveYearStartMonth,

        allowPastDateRequest:
          settings.leave
            ?.allowPastDateRequest ??
          DEFAULT_SETTINGS.leave
            .allowPastDateRequest,

        managerApprovalRequired:
          settings.leave
            ?.managerApprovalRequired ??
          DEFAULT_SETTINGS.leave
            .managerApprovalRequired,

        hrApprovalRequired:
          settings.leave
            ?.hrApprovalRequired ??
          DEFAULT_SETTINGS.leave
            .hrApprovalRequired,
      },
    };
  };