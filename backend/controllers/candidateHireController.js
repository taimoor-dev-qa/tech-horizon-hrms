import asyncHandler from "../utils/asyncHandler.js";
import {
  hireCandidate as hireService,
} from "../services/candidateHireService.js";

export const hireCandidate = asyncHandler(async (req, res) => {
  const result = await hireService(
    req.params.id,
    req.body
  );

  res.status(201).json({
    success: true,
    message:
      "Candidate hired and employee created successfully",
    candidate: result.candidate,
    employee: result.employee,
  });
});
