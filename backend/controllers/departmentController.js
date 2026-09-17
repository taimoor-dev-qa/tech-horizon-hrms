import * as departmentService
  from "../services/departmentService.js";

export const createDepartment = async (
  req,
  res
) => {
  try {
    const department =
      await departmentService.createDepartment(
        req.body
      );

    res.status(201).json({
      success: true,
      message: "Department created successfully",
      department,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getDepartments = async (
  req,
  res
) => {
  try {
    const departments =
      await departmentService.getDepartments();

    res.status(200).json({
      success: true,
      count: departments.length,
      departments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getDepartmentById = async (
  req,
  res
) => {
  try {
    const department =
      await departmentService.getDepartmentById(
        req.params.id
      );

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    res.status(200).json({
      success: true,
      department,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateDepartment = async (
  req,
  res
) => {
  try {
    const department =
      await departmentService.updateDepartment(
        req.params.id,
        req.body
      );

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Department updated successfully",
      department,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteDepartment = async (
  req,
  res
) => {
  try {
    const department =
      await departmentService.deleteDepartment(
        req.params.id
      );

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};