import Candidate from "../models/Candidate.js";

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

  return populateCandidate(
    Candidate.find(filter).sort({
      createdAt: -1,
    })
  );
};

export const getCandidateById = async (
  id
) => {
  return populateCandidate(
    Candidate.findById(id)
  );
};