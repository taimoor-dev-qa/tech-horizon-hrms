import { z } from "zod";

export const objectId = z
  .string()
  .regex(
    /^[0-9a-fA-F]{24}$/,
    "Invalid MongoDB ID"
  );

export const optionalObjectId =
  objectId.optional().nullable();

export const dateString = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}$/,
    "Date must use YYYY-MM-DD format"
  );

export const monthString = z
  .string()
  .regex(
    /^\d{4}-(0[1-9]|1[0-2])$/,
    "Month must use YYYY-MM format"
  );

export const dateTimeString = z
  .string()
  .refine(
    (value) =>
      !Number.isNaN(
        Date.parse(value)
      ),
    {
      message:
        "Invalid date and time",
    }
  );

export const nonNegativeNumber =
  z.number().min(
    0,
    "Value cannot be negative"
  );

export const enumValue = (
  values,
  message = "Invalid value"
) =>
  z.string().refine(
    (value) =>
      values.includes(value),
    {
      message,
    }
  );