import AppError from "../utils/AppError.js";
export const validateSettingsData = (
  data
) => {
  if (
    data.payroll?.payrollDay !== undefined &&
    (
      data.payroll.payrollDay < 1 ||
      data.payroll.payrollDay > 31
    )
  ) {
    throw new AppError("Payroll day must be between 1 and 31", 400);
  }

  if (
    data.leave?.leaveYearStartMonth !==
      undefined &&
    (
      data.leave.leaveYearStartMonth < 1 ||
      data.leave.leaveYearStartMonth > 12
    )
  ) {
    throw new AppError("Leave year start month must be between 1 and 12", 400);
  }

  if (
    data.attendance?.graceMinutes !==
      undefined &&
    data.attendance.graceMinutes < 0
  ) {
    throw new AppError("Grace minutes cannot be negative", 400);
  }
};
