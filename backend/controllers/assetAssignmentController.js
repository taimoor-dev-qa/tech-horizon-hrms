import asyncHandler from "../utils/asyncHandler.js";
import {
  assignAsset as assignService,
  getAssignments as getAssignmentsService,
  returnAsset as returnService,
} from "../services/assetAssignmentService.js";

export const assignAsset = asyncHandler(async (req, res) => {
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
});

export const returnAsset = asyncHandler(async (req, res) => {
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
});

export const getAssignments = asyncHandler(async (req, res) => {
  const assignments =
    await getAssignmentsService();

  res.status(200).json({
    success: true,
    count: assignments.length,
    assignments,
  });
});
