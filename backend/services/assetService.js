import AppError from "../utils/AppError.js";
import Asset from "../models/Asset.js";
import { mapDuplicateKeyError } from "../utils/mongoDuplicateKey.js";
import {
  assertAssetCanBeDeleted,
} from "./resourceReferenceService.js";
import {
  ASSET_STATUS,
} from "../constants/asset.js";

const duplicateConstraints = [
  { fields: ["assetTag"], message: "Asset tag already exists" },
  { fields: ["serialNumber"], message: "Asset serial number already exists" },
];

export const createAsset = async (data) => {
  if (data.status === ASSET_STATUS.ASSIGNED) {
    throw new AppError(
      "Asset can only be marked assigned through the assignment workflow",
      400
    );
  }

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
  if (data.status === ASSET_STATUS.ASSIGNED) {
    throw new AppError(
      "Asset can only be marked assigned through the assignment workflow",
      400
    );
  }

  try {
    if (data.status !== undefined) {
      const asset =
        await Asset.findOneAndUpdate(
          {
            _id: id,
            status: {
              $ne: ASSET_STATUS.ASSIGNED,
            },
          },
          data,
          {
            new: true,
            runValidators: true,
          }
        );

      if (asset) {
        return asset;
      }

      const existing =
        await Asset.findById(id);

      if (!existing) {
        return null;
      }

      throw new AppError(
        "Assigned asset status can only be changed through the return workflow",
        400
      );
    }

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

  await assertAssetCanBeDeleted(id);

  return Asset.findByIdAndDelete(id);
};
