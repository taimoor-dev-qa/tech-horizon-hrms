import { z } from "zod";

export const registerSchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(2, "Name is required")
      .max(100),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Invalid email address"),

    password: z
      .string()
      .min(
        6,
        "Password must contain at least 6 characters"
      )
      .max(128),
  });

export const loginSchema =
  z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Invalid email address"),

    password: z
      .string()
      .min(
        1,
        "Password is required"
      ),
  });