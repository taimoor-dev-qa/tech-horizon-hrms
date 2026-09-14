import Asset from "../models/Asset.js";
import AssetAssignment
  from "../models/AssetAssignment.js";
import Employee from "../models/Employee.js";

import {
  ASSET_CONDITION,
  ASSET_STATUS,
  ASSIGNMENT_STATUS,
} from "../constants/asset.js";

export const assignAsset = async (
  data,
  assignedBy
) => {
  const asset = await Asset.findById(
    data.asset
  );

  if (!asset) {
    throw new Error("Asset not found");
  }

  if (
    asset.status !== ASSET_STATUS.AVAILABLE
  ) {
    throw new Error(
      "Asset is not available"
    );
  }

  const employee = await Employee.findById(
    data.employee
  );

  if (!employee) {
    throw new Error("Employee not found");
  }

  const assignment =
    await AssetAssignment.create({
      asset: asset._id,
      employee: employee._id,
      assignedDate: data.assignedDate,
      assignedCondition: asset.condition,
      assignedBy,
      notes: data.notes,
    });

  asset.status = ASSET_STATUS.ASSIGNED;
  await asset.save();

  return assignment;
};

export const returnAsset = async (
  assignmentId,
  data
) => {
  const assignment =
    await AssetAssignment.findById(
      assignmentId
    );

  if (!assignment) {
    throw new Error(
      "Asset assignment not found"
    );
  }

  if (
    assignment.status ===
    ASSIGNMENT_STATUS.RETURNED
  ) {
    throw new Error(
      "Asset has already been returned"
    );
  }

  const asset = await Asset.findById(
    assignment.asset
  );

  assignment.status =
    ASSIGNMENT_STATUS.RETURNED;

  assignment.returnedDate =
    data.returnedDate;

  assignment.returnedCondition =
    data.returnedCondition;

  if (data.notes) {
    assignment.notes = data.notes;
  }

  await assignment.save();

  asset.condition =
    data.returnedCondition;

  asset.status =
    data.returnedCondition ===
    ASSET_CONDITION.DAMAGED
      ? ASSET_STATUS.REPAIR
      : ASSET_STATUS.AVAILABLE;

  await asset.save();

  return assignment;
};

export const getAssignments = async () => {
  return AssetAssignment.find()
    .populate(
      "asset",
      "assetTag name category status"
    )
    .populate({
      path: "employee",
      select: "employeeId user",
      populate: {
        path: "user",
        select: "name email",
      },
    })
    .populate(
      "assignedBy",
      "name email role"
    )
    .sort({ createdAt: -1 });
};