import helmet from "helmet";

import rateLimit
  from "express-rate-limit";

export const securityHeaders =
  helmet();

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  limit: 500,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many requests. Please try again later.",
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  limit: 50,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many authentication attempts. Please try again later.",
  },
});