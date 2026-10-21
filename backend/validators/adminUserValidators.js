import { z } from "zod";
import ROLES from "../constants/roles.js";

export const adminAccountSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6).max(100),
});

export const PRIVILEGED_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.HR_ADMIN,
  ROLES.FINANCE,
];

export const privilegedUserSchema = adminAccountSchema.extend({
  role: z.enum(PRIVILEGED_ROLES),
});
