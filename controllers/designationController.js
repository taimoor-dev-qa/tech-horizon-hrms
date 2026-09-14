import * as designationService
  from "../services/designationService.js";

export const createDesignation = async (
  req,
  res
) => {
  try {
    const designation =
      await designationService.createDesignation(
        req.body
      );

    res.status(201).json({
      success: true,
      message: "Designation created successfully",
      designation,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getDesignations = async (
  req,
  res
) => {
  try {
    const designations =
      await designationService.getDesignations();

    res.status(200).json({
      success: true,
      count: designations.length,
      designations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getDesignationById = async (
  req,
  res
) => {
  try {
    const designation =
      await designationService.getDesignationById(
        req.params.id
      );

    if (!designation) {
      return res.status(404).json({
        success: false,
        message: "Designation not found",
      });
    }

    res.status(200).json({
      success: true,
      designation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateDesignation = async (
  req,
  res
) => {
  try {
    const designation =
      await designationService.updateDesignation(
        req.params.id,
        req.body
      );

    if (!designation) {
      return res.status(404).json({
        success: false,
        message: "Designation not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Designation updated successfully",
      designation,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteDesignation = async (
  req,
  res
) => {
  try {
    const designation =
      await designationService.deleteDesignation(
        req.params.id
      );

    if (!designation) {
      return res.status(404).json({
        success: false,
        message: "Designation not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Designation deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};