import mongoose from "mongoose";

export const validateObjectId = (
  parameter = "id"
) => {
  return (req, res, next) => {
    const value =
      req.params[parameter];

    if (
      !mongoose.Types.ObjectId.isValid(
        value
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Invalid ${parameter}`,
      });
    }

    next();
  };
};