import Asset from "../models/Asset.js";
import AssetAssignment
  from "../models/AssetAssignment.js";
import Employee from "../models/Employee.js";

export const getAssets = async ({
  search,
  category,
  status,
} = {}) => {
  const filter = {};

  if (category) {
    filter.category = category;
  }

  if (status) {
    filter.status = status;
  }

  if (search) {
    filter.$or = [
      {
        assetTag: {
          $regex: search,
          $options: "i",
        },
      },
      {
        name: {
          $regex: search,
          $options: "i",
        },
      },
      {
        serialNumber: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  return Asset.find(filter).sort({
    createdAt: -1,
  });
};

export const getAssetById = async (id) => {
  return Asset.findById(id);
};

export const getMyAssets = async (
  userId
) => {
  const employee = await Employee.findOne({
    user: userId,
  });

  if (!employee) {
    throw new Error(
      "Employee profile not found"
    );
  }

  return AssetAssignment.find({
    employee: employee._id,
    status: "assigned",
  })
    .populate("asset")
    .sort({ assignedDate: -1 });
};