import AppError from "./AppError.js";

const getDuplicateFields = (error) => {
  const source = error?.keyPattern || error?.keyValue;

  return source && typeof source === "object"
    ? Object.keys(source).sort()
    : [];
};

export const isDuplicateKeyFor = (
  error,
  expectedFields
) => {
  if (error?.code !== 11000) {
    return false;
  }

  const actualFields = getDuplicateFields(error);
  const fields = [...expectedFields].sort();

  return (
    actualFields.length === fields.length &&
    fields.every(
      (field, index) =>
        field === actualFields[index]
    )
  );
};

export const mapDuplicateKeyError = (
  error,
  constraints
) => {
  const constraint = constraints.find(
    ({ fields }) =>
      isDuplicateKeyFor(error, fields)
  );

  if (!constraint) {
    return error;
  }

  const mapped = new AppError(
    constraint.message,
    constraint.statusCode || 400
  );

  if (constraint.businessCode) {
    mapped.businessCode =
      constraint.businessCode;
  }

  return mapped;
};
