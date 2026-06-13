import type { ErrorRequestHandler } from "express";

import { env } from "../config/env";
import { AppError } from "../utils/app-error";

interface HttpError extends Error {
  status?: number;
  statusCode?: number;
}

const getStatusCode = (error: unknown): number => {
  if (error instanceof AppError) {
    return error.statusCode;
  }

  const httpError = error as Partial<HttpError>;
  const statusCode = httpError.statusCode ?? httpError.status;

  if (typeof statusCode === "number" && statusCode >= 400 && statusCode < 600) {
    return statusCode;
  }

  return 500;
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const statusCode = getStatusCode(error);
  const message = error instanceof Error ? error.message : "Internal server error";

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.nodeEnv === "development" && {
      stack: error instanceof Error ? error.stack : undefined,
    }),
  });
};
