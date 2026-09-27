import multer
  from "multer";

const handleDuplicateKey =
  (error) => {
    const field =
      Object.keys(
        error.keyValue || {}
      )[0];

    const value =
      error.keyValue?.[
        field
      ];

    return {
      statusCode: 409,

      message: field
        ? `${field} '${value}' already exists`
        : "Duplicate value already exists",
    };
  };

const handleValidationError =
  (error) => {
    const messages =
      Object.values(
        error.errors || {}
      ).map(
        (item) =>
          item.message
      );

    return {
      statusCode: 400,

      message:
        messages.join(", ") ||
        "Validation failed",
    };
  };

const handleCastError =
  () => {
    return {
      statusCode: 400,
      message:
        "Invalid resource ID",
    };
  };

const handleMulterError =
  (error) => {
    if (
      error.code ===
      "LIMIT_FILE_SIZE"
    ) {
      return {
        statusCode: 400,

        message:
          "Uploaded file exceeds the allowed size limit",
      };
    }

    if (
      error.code ===
      "LIMIT_FILE_COUNT"
    ) {
      return {
        statusCode: 400,

        message:
          "Too many files uploaded",
      };
    }

    if (
      error.code ===
      "LIMIT_UNEXPECTED_FILE"
    ) {
      return {
        statusCode: 400,

        message:
          "Unexpected file field",
      };
    }

    return {
      statusCode: 400,

      message:
        error.message ||
        "File upload failed",
    };
  };

const handleJwtError =
  (error) => {
    if (
      error.name ===
      "TokenExpiredError"
    ) {
      return {
        statusCode: 401,

        message:
          "Authentication token has expired",
      };
    }

    return {
      statusCode: 401,

      message:
        "Invalid authentication token",
    };
  };

const errorHandler = (
  error,
  req,
  res,
  next
) => {
  let statusCode =
    error.statusCode ||
    500;

  let message =
    error.message ||
    "Internal server error";

  let details =
    error.details ||
    null;

  /*
   * Mongo duplicate key
   */
  if (
    error.code === 11000
  ) {
    const handled =
      handleDuplicateKey(
        error
      );

    statusCode =
      handled.statusCode;

    message =
      handled.message;
  }

  /*
   * Mongoose validation
   */
  if (
    error.name ===
    "ValidationError"
  ) {
    const handled =
      handleValidationError(
        error
      );

    statusCode =
      handled.statusCode;

    message =
      handled.message;
  }

  /*
   * Mongoose invalid ID
   */
  if (
    error.name ===
    "CastError"
  ) {
    const handled =
      handleCastError();

    statusCode =
      handled.statusCode;

    message =
      handled.message;
  }

  /*
   * Multer
   */
  if (
    error instanceof
    multer.MulterError
  ) {
    const handled =
      handleMulterError(
        error
      );

    statusCode =
      handled.statusCode;

    message =
      handled.message;
  }

  /*
   * JWT
   */
  if (
    error.name ===
      "TokenExpiredError" ||
    error.name ===
      "JsonWebTokenError" ||
    error.name ===
      "NotBeforeError"
  ) {
    const handled =
      handleJwtError(
        error
      );

    statusCode =
      handled.statusCode;

    message =
      handled.message;
  }

  /*
   * Production mein unexpected
   * internal error detail expose
   * nahi karni.
   */
  if (
    process.env.NODE_ENV ===
      "production" &&
    statusCode >= 500 &&
    !error.isOperational
  ) {
    message =
      "Internal server error";

    details = null;
  }

  const response = {
    success: false,
    message,
  };

  if (details) {
    response.errors =
      details;
  }

  if (
    process.env.NODE_ENV ===
    "development"
  ) {
    response.stack =
      error.stack;
  }

  res
    .status(statusCode)
    .json(response);
};

export default errorHandler;