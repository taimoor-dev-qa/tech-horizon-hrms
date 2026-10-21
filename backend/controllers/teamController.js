import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import * as teamService
  from "../services/teamService.js";

export const createTeam = asyncHandler(async (req, res) => {
  const team = await teamService.createTeam(
    req.body
  );

  res.status(201).json({
    success: true,
    message: "Team created successfully",
    team,
  });
});

export const getTeams = asyncHandler(async (req, res) => {
  const teams = await teamService.getTeams();

  res.status(200).json({
    success: true,
    count: teams.length,
    teams,
  });
});

export const getTeamById = asyncHandler(async (req, res) => {
  const team = await teamService.getTeamById(
    req.params.id
  );

  if (!team) {
    throw new AppError("Team not found", 404);
  }

  res.status(200).json({
    success: true,
    team,
  });
});

export const updateTeam = asyncHandler(async (req, res) => {
  const team = await teamService.updateTeam(
    req.params.id,
    req.body
  );

  if (!team) {
    throw new AppError("Team not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Team updated successfully",
    team,
  });
});

export const deleteTeam = asyncHandler(async (req, res) => {
  const team = await teamService.deleteTeam(
    req.params.id
  );

  if (!team) {
    throw new AppError("Team not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Team deleted successfully",
  });
});
