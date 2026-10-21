import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  createEmployee as createEmployeeService,
} from "../services/employeeService.js";

import {
  getEmployeeById as getEmployeeByIdService,
  getEmployees as getEmployeesService,
} from "../services/employeeQueryService.js";

export const createEmployee = asyncHandler(async (req, res) => {
  const employee =
    await createEmployeeService(req.body);

  res.status(201).json({
    success: true,
    message: "Employee created successfully",
    employee,
  });
});

export const getEmployees = asyncHandler(async (req, res) => {
  const result = await getEmployeesService(
    req.query
  );

  res.status(200).json({
    success: true,
    ...result,
  });
});

export const getEmployeeById = asyncHandler(async (req, res) => {
  const employee =
    await getEmployeeByIdService(
      req.params.id
    );

  if (!employee) {
    throw new AppError("Employee not found", 404);
  }

  res.status(200).json({
    success: true,
    employee,
  });
});
