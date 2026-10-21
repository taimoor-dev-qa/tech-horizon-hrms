import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  createSalaryStructure as createService,
  deactivateSalaryStructure as deactivateService,
  getSalaryByEmployee as getByEmployeeService,
  getSalaryStructures as getAllService,
} from "../services/salaryStructureService.js";

export const createSalaryStructure = asyncHandler(async (req, res) => {
  const salary = await createService(
    req.body,
    req.user._id
  );

  res.status(201).json({
    success: true,
    message:
      "Salary structure created successfully",
    salary,
  });
});

export const getSalaryStructures = asyncHandler(async (req, res) => {
  const salaries =
    await getAllService();

  res.status(200).json({
    success: true,
    count: salaries.length,
    salaries,
  });
});

export const getSalaryByEmployee = asyncHandler(async (req, res) => {
  const salary =
    await getByEmployeeService(
      req.params.employeeId
    );

  if (!salary) {
    throw new AppError("Salary structure not found", 404);
  }

  res.status(200).json({
    success: true,
    salary,
  });
});

export const deactivateSalary = asyncHandler(async (req, res) => {
  const salary =
    await deactivateService(
      req.params.id,
      req.body.effectiveTo
    );

  if (!salary) {
    throw new AppError("Salary structure not found", 404);
  }

  res.status(200).json({
    success: true,
    message:
      "Salary structure deactivated",
    salary,
  });
});
