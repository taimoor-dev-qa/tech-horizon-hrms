import multer from "multer";

const handleDuplicateKey = (
  error
) => {
  const field = Object.keys(
    error.keyValue || {}
  )[0];

  const value =
    error.keyValue?.[field];

  return {
    statusCode: 409,
    message: field
      ? `${field} '${value}' already exists`
      : "Duplicate value already exists",
  };
};

const handleValidationError = (
  error
) => {
  const messages = Object.values(
    error.errors || {}
  ).map(
    (item) => item.message
  );

  return {
    statusCode: 400,
    message:
      messages.join(", ") ||
      "Validation failed",
  };
};

const handleCastError = () => {
  return {
    statusCode: 400,
    message: "Invalid resource ID",
  };
};

const handleMulterError = (
  error
) => {
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

  return {
    statusCode: 400,
    message:
      error.message ||
      "File upload failed",
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
    res.statusCode;

  if (
    !statusCode ||
    statusCode === 200
  ) {
    statusCode = 500;
  }

  let message =
    error.message ||
    "Internal server error";

  if (error.code === 11000) {
    const handled =
      handleDuplicateKey(error);

    statusCode =
      handled.statusCode;

    message =
      handled.message;
  }

  if (
    error.name ===
    "ValidationError"
  ) {
    const handled =
      handleValidationError(error);

    statusCode =
      handled.statusCode;

    message =
      handled.message;
  }

  if (
    error.name === "CastError"
  ) {
    const handled =
      handleCastError(error);

    statusCode =
      handled.statusCode;

    message =
      handled.message;
  }

  if (
    error instanceof
    multer.MulterError
  ) {
    const handled =
      handleMulterError(error);

    statusCode =
      handled.statusCode;

    message =
      handled.message;
  }

  const response = {
    success: false,
    message,
  };

  if (
    process.env.NODE_ENV ===
    "development"
  ) {
    response.stack = error.stack;
  }

  res.status(statusCode).json(
    response
  );
};

export default errorHandler;