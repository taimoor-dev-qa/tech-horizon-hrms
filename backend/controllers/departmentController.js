import * as departmentService from "../services/departmentService.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

export const createDepartment = asyncHandler(
  async (req, res) => {
    const department =
      await departmentService.createDepartment(
        req.body
      );

    res.status(201).json({
      success: true,
      message: "Department created successfully",
      department,
    });
  }
);

export const getDepartments = asyncHandler(
  async (req, res) => {
    const departments =
      await departmentService.getDepartments();

    res.status(200).json({
      success: true,
      count: departments.length,
      departments,
    });
  }
);

export const getDepartmentById = asyncHandler(
  async (req, res) => {
    const department =
      await departmentService.getDepartmentById(
        req.params.id
      );

    if (!department) {
      throw new AppError(
        "Department not found",
        404
      );
    }

    res.status(200).json({
      success: true,
      department,
    });
  }
);

export const updateDepartment = asyncHandler(
  async (req, res) => {
    const department =
      await departmentService.updateDepartment(
        req.params.id,
        req.body
      );

    if (!department) {
      throw new AppError(
        "Department not found",
        404
      );
    }

    res.status(200).json({
      success: true,
      message: "Department updated successfully",
      department,
    });
  }
);

export const deleteDepartment = asyncHandler(
  async (req, res) => {
    const department =
      await departmentService.deleteDepartment(
        req.params.id
      );

    if (!department) {
      throw new AppError(
        "Department not found",
        404
      );
    }

    res.status(200).json({
      success: true,
      message: "Department deleted successfully",
    });
  }
);