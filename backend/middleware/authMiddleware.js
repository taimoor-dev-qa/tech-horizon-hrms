import jwt
  from "jsonwebtoken";

import User
  from "../models/User.js";

import AppError
  from "../utils/AppError.js";

import asyncHandler
  from "../utils/asyncHandler.js";

const protect =
  asyncHandler(
    async (
      req,
      res,
      next
    ) => {
      const authorization =
        req.headers
          .authorization;

      if (
        !authorization
          ?.startsWith(
            "Bearer "
          )
      ) {
        throw new AppError(
          "Authentication token is required",
          401
        );
      }

      const token =
        authorization
          .split(" ")[1];

      /*
       * TokenExpiredError /
       * JsonWebTokenError
       * central error middleware
       * handle karega.
       */
      const decoded =
        jwt.verify(
          token,
          process.env
            .JWT_SECRET
        );

      const user =
        await User.findById(
          decoded.userId
        );

      if (!user) {
        throw new AppError(
          "User account not found",
          401
        );
      }

      if (!user.isActive) {
        throw new AppError(
          "User account is inactive",
          403
        );
      }

      if (
        (decoded.tokenVersion ?? 0) !==
          (user.tokenVersion || 0)
      ) {
        throw new AppError(
          "Authentication token is no longer valid",
          401
        );
      }

      const isPasswordChangeRequest =
        req.method === "PATCH" &&
        req.originalUrl.split("?")[0] ===
          "/api/auth/change-password";

      if (
        user.mustChangePassword &&
        !isPasswordChangeRequest
      ) {
        throw new AppError(
          "You must change your password before continuing",
          403
        );
      }

      req.user =
        user;

      next();
    }
  );

export default protect;
