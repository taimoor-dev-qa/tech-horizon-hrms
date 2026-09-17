import Asset from "../models/Asset.js";

export const createAsset = async (data) => {
  const existing = await Asset.findOne({
    assetTag: data.assetTag?.toUpperCase(),
  });

  if (existing) {
    throw new Error(
      "Asset tag already exists"
    );
  }

  return Asset.create(data);
};

export const updateAsset = async (
  id,
  data
) => {
  return Asset.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
      runValidators: true,
    }
  );
};

export const deleteAsset = async (id) => {
  const asset = await Asset.findById(id);

  if (!asset) {
    return null;
  }

  if (asset.status === "assigned") {
    throw new Error(
      "Assigned asset cannot be deleted"
    );
  }

  return Asset.findByIdAndDelete(id);
};