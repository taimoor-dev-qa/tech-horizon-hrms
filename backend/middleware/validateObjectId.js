import mongoose
  from "mongoose";

import AppError
  from "../utils/AppError.js";

export const validateObjectId =
  (
    parameter = "id"
  ) => {
    return (
      req,
      res,
      next
    ) => {
      const value =
        req.params[
          parameter
        ];

      if (
        !mongoose.Types
          .ObjectId
          .isValid(value)
      ) {
        return next(
          new AppError(
            `Invalid ${parameter}`,
            400
          )
        );
      }

      next();
    };
  };