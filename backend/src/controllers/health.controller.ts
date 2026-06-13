import type { Request, Response } from "express";

import { getHealthStatus } from "../services/health.service";
import { sendSuccess } from "../utils/api-response";

export const healthCheck = (_req: Request, res: Response): void => {
  sendSuccess(res, getHealthStatus());
};
