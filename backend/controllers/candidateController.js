import {
  createCandidate as createService,
  updateCandidate as updateService,
  updateCandidateStatus as statusService,
} from "../services/candidateService.js";

import {
  getCandidateById as getByIdService,
  getCandidates as getCandidatesService,
} from "../services/candidateQueryService.js";

import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

export const createCandidate = asyncHandler(async (req, res) => {
  const candidate = await createService(req.body);

  res.status(201).json({
    success: true,
    message: "Candidate created successfully",
    candidate,
  });
});

export const getCandidates = asyncHandler(async (req, res) => {
  const result = await getCandidatesService(req.query);

  res.status(200).json({
    success: true,
    count: result.candidates.length,
    pagination: result.pagination,
    candidates: result.candidates,
  });
});

export const getCandidateById = asyncHandler(async (req, res) => {
  const candidate = await getByIdService(req.params.id);

  if (!candidate) {
    throw new AppError("Candidate not found", 404);
  }

  res.status(200).json({
    success: true,
    candidate,
  });
});

export const updateCandidate = asyncHandler(async (req, res) => {
  const candidate = await updateService(req.params.id, req.body);

  if (!candidate) {
    throw new AppError("Candidate not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Candidate updated successfully",
    candidate,
  });
});

export const changeCandidateStatus = asyncHandler(async (req, res) => {
  const candidate = await statusService(
    req.params.id,
    req.body.status,
    req.body.notes
  );

  if (!candidate) {
    throw new AppError("Candidate not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Candidate status updated",
    candidate,
  });
});
