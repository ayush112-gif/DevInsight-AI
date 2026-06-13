import type { Response } from "express";

export interface ApiSuccess<T = unknown> {
  success: true;
  message: string;
  data?: T;
}

export const sendSuccess = <T>(
  res: Response,
  payload: ApiSuccess<T>,
  statusCode = 200,
): void => {
  res.status(statusCode).json(payload);
};
