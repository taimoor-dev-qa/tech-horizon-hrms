import AppError
  from "../utils/AppError.js";

const validateRequest = (
  schema
) => {
  return (
    req,
    res,
    next
  ) => {
    if (
      !schema ||
      typeof schema
        .safeParse !==
        "function"
    ) {
      return next(
        new AppError(
          "Invalid request validation schema",
          500
        )
      );
    }

    const result =
      schema.safeParse(
        req.body
      );

    if (!result.success) {
      const errors =
        result.error.issues.map(
          (issue) => ({
            field:
              issue.path.length
                ? issue.path.join(
                    "."
                  )
                : "body",

            location:
              "body",

            message:
              issue.message,
          })
        );

      return next(
        new AppError(
          "Request validation failed",
          400,
          errors
        )
      );
    }

    req.body =
      result.data;

    next();
  };
};

export default validateRequest;