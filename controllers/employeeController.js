import {
  createEmployee as createEmployeeService,
} from "../services/employeeService.js";

import {
  getEmployeeById as getEmployeeByIdService,
  getEmployees as getEmployeesService,
} from "../services/employeeQueryService.js";

export const createEmployee = async (
  req,
  res
) => {
  try {
    const employee =
      await createEmployeeService(req.body);

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      employee,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getEmployees = async (
  req,
  res
) => {
  try {
    const result = await getEmployeesService(
      req.query
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getEmployeeById = async (
  req,
  res
) => {
  try {
    const employee =
      await getEmployeeByIdService(
        req.params.id
      );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};