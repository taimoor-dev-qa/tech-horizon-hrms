import {
  createCandidate as createService,
  updateCandidate as updateService,
  updateCandidateStatus as statusService,
} from "../services/candidateService.js";

import {
  getCandidateById as getByIdService,
  getCandidates as getCandidatesService,
} from "../services/candidateQueryService.js";

export const createCandidate = async (
  req,
  res
) => {
  try {
    const candidate =
      await createService(req.body);

    res.status(201).json({
      success: true,
      message:
        "Candidate created successfully",
      candidate,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCandidates = async (
  req,
  res
) => {
  try {
    const candidates =
      await getCandidatesService(
        req.query
      );

    res.status(200).json({
      success: true,
      count: candidates.length,
      candidates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCandidateById = async (
  req,
  res
) => {
  try {
    const candidate =
      await getByIdService(
        req.params.id
      );

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    res.status(200).json({
      success: true,
      candidate,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateCandidate = async (
  req,
  res
) => {
  try {
    const candidate =
      await updateService(
        req.params.id,
        req.body
      );

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Candidate updated successfully",
      candidate,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const changeCandidateStatus = async (
  req,
  res
) => {
  try {
    const candidate =
      await statusService(
        req.params.id,
        req.body.status,
        req.body.notes
      );

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Candidate status updated",
      candidate,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};