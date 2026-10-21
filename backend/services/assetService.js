import AppError from "../utils/AppError.js";
import Asset from "../models/Asset.js";
import { mapDuplicateKeyError } from "../utils/mongoDuplicateKey.js";

const duplicateConstraints = [
  { fields: ["assetTag"], message: "Asset tag already exists" },
  { fields: ["serialNumber"], message: "Asset serial number already exists" },
];

export const createAsset = async (data) => {
  const existing = await Asset.findOne({
    assetTag: data.assetTag?.toUpperCase(),
  });

  if (existing) {
    throw new AppError("Asset tag already exists", 400);
  }

  try {
    return await Asset.create(data);
  } catch (error) {
    throw mapDuplicateKeyError(error, duplicateConstraints);
  }
};

export const updateAsset = async (
  id,
  data
) => {
  try {
    return await Asset.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
        runValidators: true,
      }
    );
  } catch (error) {
    throw mapDuplicateKeyError(error, duplicateConstraints);
  }
};

export const deleteAsset = async (id) => {
  const asset = await Asset.findById(id);

  if (!asset) {
    return null;
  }

  if (asset.status === "assigned") {
    throw new AppError("Assigned asset cannot be deleted", 400);
  }

  return Asset.findByIdAndDelete(id);
};
