import {
  updateEmployee as updateEmployeeService,
} from "../services/employeeUpdateService.js";

import {
  deactivateEmployee as deactivateService,
  reactivateEmployee as reactivateService,
  setEmployeeStatus,
} from "../services/employeeStatusService.js";

const sendNotFound = (res) => {
  return res.status(404).json({
    success: false,
    message: "Employee not found",
  });
};

export const updateEmployee = async (
  req,
  res
) => {
  try {
    const employee =
      await updateEmployeeService(
        req.params.id,
        req.body
      );

    if (!employee) {
      return sendNotFound(res);
    }

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      employee,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deactivateEmployee = async (
  req,
  res
) => {
  try {
    const employee = await deactivateService(
      req.params.id
    );

    if (!employee) {
      return sendNotFound(res);
    }

    res.status(200).json({
      success: true,
      message: "Employee deactivated successfully",
      employee,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const reactivateEmployee = async (
  req,
  res
) => {
  try {
    const employee = await reactivateService(
      req.params.id
    );

    if (!employee) {
      return sendNotFound(res);
    }

    res.status(200).json({
      success: true,
      message: "Employee reactivated successfully",
      employee,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const changeEmployeeStatus = async (
  req,
  res
) => {
  try {
    const employee = await setEmployeeStatus(
      req.params.id,
      req.body.status
    );

    if (!employee) {
      return sendNotFound(res);
    }

    res.status(200).json({
      success: true,
      message: "Employee status updated",
      employee,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};