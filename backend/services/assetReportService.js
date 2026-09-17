import Asset from "../models/Asset.js";
import AssetAssignment
  from "../models/AssetAssignment.js";

export const getAssetReport = async ({
  category,
  status,
  condition,
} = {}) => {
  const filter = {};

  if (category) {
    filter.category = category;
  }

  if (status) {
    filter.status = status;
  }

  if (condition) {
    filter.condition = condition;
  }

  const assets = await Asset.find(filter)
    .sort({
      assetTag: 1,
    });

  const activeAssignments =
    await AssetAssignment.countDocuments({
      status: "assigned",
    });

  const summary = {
    total: assets.length,
    available: 0,
    assigned: 0,
    repair: 0,
    lost: 0,
    retired: 0,
    activeAssignments,
  };

  assets.forEach((asset) => {
    if (
      Object.hasOwn(
        summary,
        asset.status
      )
    ) {
      summary[asset.status] += 1;
    }
  });

  return {
    summary,
    assets,
  };
};