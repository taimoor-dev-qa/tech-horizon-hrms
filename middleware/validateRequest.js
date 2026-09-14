const validateRequest = (
  schema,
  source = "body"
) => {
  return (req, res, next) => {
    const result = schema.safeParse(
      req[source]
    );

    if (!result.success) {
      const errors =
        result.error.issues.map(
          (issue) => ({
            field:
              issue.path.join(".") ||
              source,
            message: issue.message,
          })
        );

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    // Body ko sanitized data se replace karo.
    if (source === "body") {
      req.body = result.data;
    }

    req.validated = {
      ...(req.validated || {}),
      [source]: result.data,
    };

    next();
  };
};

export default validateRequest;