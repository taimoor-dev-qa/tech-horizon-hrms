import {
  hireCandidate as hireService,
} from "../services/candidateHireService.js";

export const hireCandidate = async (
  req,
  res
) => {
  try {
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
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};