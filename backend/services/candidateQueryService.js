import Candidate from "../models/Candidate.js";

import {
  buildPagination,
  getPagination,
} from "../utils/pagination.js";

const populateCandidate = (query) => {
  return query.populate({
    path: "job",
    select:
      "title code department designation status",
    populate: [
      {
        path: "department",
        select: "name code",
      },
      {
        path: "designation",
        select: "name code",
      },
    ],
  });
};

export const getCandidates = async ({
  job,
  status,
  search,
  page,
  limit,
} = {}) => {
  const filter = {};

  if (job) {
    filter.job = job;
  }

  if (status) {
    filter.status = status;
  }

  if (search) {
    filter.$or = [
      {
        name: {
          $regex: search,
          $options: "i",
        },
      },
      {
        email: {
          $regex: search,
          $options: "i",
        },
      },
      {
        phone: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  const pagination = getPagination({ page, limit });

  const [candidates, total] = await Promise.all([
    populateCandidate(
      Candidate.find(filter)
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
    ),
    Candidate.countDocuments(filter),
  ]);

  return {
    candidates,
    pagination: buildPagination(
      pagination.page,
      pagination.limit,
      total
    ),
  };
};

export const getCandidateById = async (
  id
) => {
  return populateCandidate(
    Candidate.findById(id)
  );
};
