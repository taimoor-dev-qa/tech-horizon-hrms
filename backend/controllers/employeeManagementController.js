import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  updateEmployee as updateEmployeeService,
} from "../services/employeeUpdateService.js";

import {
  deactivateEmployee as deactivateService,
  reactivateEmployee as reactivateService,
  setEmployeeStatus,
} from "../services/employeeStatusService.js";

const sendNotFound = (res) => {
  throw new AppError("Employee not found", 404);
};

export const updateEmployee = asyncHandler(async (req, res) => {
  const employee =
    await updateEmployeeService(
      req.params.id,
      req.body,
      req.user
    );

  if (!employee) {
    return sendNotFound(res);
  }

  res.status(200).json({
    success: true,
    message: "Employee updated successfully",
    employee,
  });
});

export const deactivateEmployee = asyncHandler(async (req, res) => {
  const employee =
    await deactivateService(
      req.params.id,
      req.user
    );

  if (!employee) {
    return sendNotFound(res);
  }

  res.status(200).json({
    success: true,
    message: "Employee deactivated successfully",
    employee,
  });
});

export const reactivateEmployee = asyncHandler(async (req, res) => {
  const employee =
    await reactivateService(
      req.params.id,
      req.user
    );

  if (!employee) {
    return sendNotFound(res);
  }

  res.status(200).json({
    success: true,
    message: "Employee reactivated successfully",
    employee,
  });
});

export const changeEmployeeStatus = asyncHandler(async (req, res) => {
  const employee =
    await setEmployeeStatus(
      req.params.id,
      req.body.status,
      req.user,
      req.body
        .employmentEndDate
    );

  if (!employee) {
    return sendNotFound(res);
  }

  res.status(200).json({
    success: true,
    message: "Employee status updated",
    employee,
  });
});
