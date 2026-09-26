export const getPagination = (
  query = {},
  defaultLimit = 20,
  maxLimit = 100
) => {
  const parsedPage =
    Number(query.page);

  const parsedLimit =
    Number(query.limit);

  const page =
    Number.isInteger(parsedPage) &&
    parsedPage > 0
      ? parsedPage
      : 1;

  const limit =
    Number.isInteger(parsedLimit) &&
    parsedLimit > 0
      ? Math.min(
          parsedLimit,
          maxLimit
        )
      : defaultLimit;

  const skip =
    (page - 1) *
    limit;

  return {
    page,
    limit,
    skip,
  };
};

export const buildPagination = (
  page,
  limit,
  total
) => {
  const totalPages =
    Math.ceil(
      total / limit
    );

  return {
    page,
    limit,
    total,
    totalPages,

    hasNextPage:
      page < totalPages,

    hasPrevPage:
      page > 1,
  };
};