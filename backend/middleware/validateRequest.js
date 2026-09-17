const validateRequest = (schema) => {
  return (req, res, next) => {
    if (
      !schema ||
      typeof schema.safeParse !== "function"
    ) {
      return res.status(500).json({
        success: false,
        message:
          "Invalid request validation schema",
      });
    }

    const result =
      schema.safeParse(req.body);

    if (!result.success) {
      const errors =
        result.error.issues.map(
          (issue) => ({
            field:
              issue.path.length
                ? issue.path.join(".")
                : "body",

            location: "body",

            message:
              issue.message,
          })
        );

      return res.status(400).json({
        success: false,
        message:
          "Request validation failed",
        errors,
      });
    }

    req.body = result.data;

    next();
  };
};

export default validateRequest;