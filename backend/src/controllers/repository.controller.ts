import type { Request, Response, NextFunction } from "express";

import { analyzeRepositoryUrl } from "../services/repository.service";
import { sendSuccess } from "../utils/api-response";

interface AnalyzeRepositoryBody {
  githubUrl?: unknown;
  repoUrl?: unknown;
  repository?: unknown;
  repositoryUrl?: unknown;
  url?: unknown;
}

const getRepositoryUrlFromBody = (body: unknown): unknown => {
  if (typeof body === "string") {
    return body;
  }

  if (!body || typeof body !== "object") {
    return undefined;
  }

  const data = body as AnalyzeRepositoryBody;

  return (
    data.repositoryUrl ??
    data.repoUrl ??
    data.url ??
    data.githubUrl ??
    data.repository
  );
};
console.log("===== ANALYZE API HIT =====");
export const analyzeRepository = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    console.log("===== ANALYZE API HIT =====");
    const repositoryUrl = getRepositoryUrlFromBody(req.body);
    console.log("[CTRL] Request received, URL:", repositoryUrl);
    const analysis = await analyzeRepositoryUrl(repositoryUrl);
    sendSuccess(res, {
      success: true,
      message: "Repository analyzed successfully",
      data: analysis,
      
    });
  } catch (error) {
    console.error("[CTRL] Error:", error);
    next(error);
  }
};