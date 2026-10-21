import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import * as designationService
  from "../services/designationService.js";

export const createDesignation = asyncHandler(async (req, res) => {
  const designation =
    await designationService.createDesignation(
      req.body
    );

  res.status(201).json({
    success: true,
    message: "Designation created successfully",
    designation,
  });
});

export const getDesignations = asyncHandler(async (req, res) => {
  const designations =
    await designationService.getDesignations();

  res.status(200).json({
    success: true,
    count: designations.length,
    designations,
  });
});

export const getDesignationById = asyncHandler(async (req, res) => {
  const designation =
    await designationService.getDesignationById(
      req.params.id
    );

  if (!designation) {
    throw new AppError("Designation not found", 404);
  }

  res.status(200).json({
    success: true,
    designation,
  });
});

export const updateDesignation = asyncHandler(async (req, res) => {
  const designation =
    await designationService.updateDesignation(
      req.params.id,
      req.body
    );

  if (!designation) {
    throw new AppError("Designation not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Designation updated successfully",
    designation,
  });
});

export const deleteDesignation = asyncHandler(async (req, res) => {
  const designation =
    await designationService.deleteDesignation(
      req.params.id
    );

  if (!designation) {
    throw new AppError("Designation not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Designation deleted successfully",
  });
});
