import {
  assignAsset as assignService,
  getAssignments as getAssignmentsService,
  returnAsset as returnService,
} from "../services/assetAssignmentService.js";

export const assignAsset = async (
  req,
  res
) => {
  try {
    const assignment = await assignService(
      req.body,
      req.user._id
    );

    res.status(201).json({
      success: true,
      message:
        "Asset assigned successfully",
      assignment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const returnAsset = async (
  req,
  res
) => {
  try {
    const assignment = await returnService(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message:
        "Asset returned successfully",
      assignment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAssignments = async (
  req,
  res
) => {
  try {
    const assignments =
      await getAssignmentsService();

    res.status(200).json({
      success: true,
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};