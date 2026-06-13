import axios from "axios";
import { calculateComplexityScore } from "./complexity-score.service";

import {
  generateAIAnalysis,
  type AIAnalysis,
} from "./ai-analysis.service";

import {
  detectTechnologies,
  type PackageManifest,
} from "./technology-detector.service";

import { AppError } from "../utils/app-error";


interface GitHubRepositoryResponse {
  default_branch: string;
}

interface GitHubTreeItem {
  path: string;
  type: "blob" | "tree" | string;
}

interface GitHubTreeResponse {
  tree: GitHubTreeItem[];
  truncated: boolean;
}

interface GitHubFileContentResponse {
  content: string;
  encoding: string;
}


export interface RepositoryAnalysis {
  repositoryUrl: string;
  provider: string;
  owner: string;
  name: string;
  defaultBranch: string;
  cloneUrl: string;
  filesCount: number;
  importantFiles: string[];
  detectedTechnologies: string[];
  aiAnalysis: AIAnalysis;
  complexityScore: number;
  complexityLevel: string;
}

const providerByHost: Record<string, string> = {
  "github.com": "GitHub",
  "gitlab.com": "GitLab",
  "bitbucket.org": "Bitbucket",
};

const importantFileNames = new Set([
  "package.json",
  "readme.md",
  "tsconfig.json",
  "next.config.js",
  "tailwind.config.js",
  "prisma.schema",
  "schema.prisma",
]);

const normalizeRepositoryUrl = (value: unknown): URL => {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new AppError("repositoryUrl is required", 400);
  }

  try {
    const url = new URL(value.trim());

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new AppError("repositoryUrl must use http or https", 400);
    }

    return url;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("repositoryUrl must be a valid URL", 400);
  }
};

const getRepositoryParts = (url: URL): { owner: string; name: string } => {
  const segments = url.pathname
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (segments.length < 2) {
    throw new AppError(
      "repositoryUrl must include repository owner and name",
      400,
    );
  }

  return {
    owner: segments[0],
    name: segments[1].replace(/\.git$/i, ""),
  };
};

const ensureSupportedProvider = (host: string): void => {
  if (host !== "github.com") {
    throw new AppError("Only GitHub repositories are supported for analysis", 400);
  }
};

const fetchGitHubRepository = async (
  owner: string,
  name: string,
): Promise<GitHubRepositoryResponse> => {
  try {
    const response = await axios.get<GitHubRepositoryResponse>(
      `https://api.github.com/repos/${owner}/${name}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "DevInsight-AI",
        },
      },
    );

    return response.data;
  } catch (error: any) {

    console.log("===== GITHUB API ERROR =====");

    if (axios.isAxiosError(error)) {
      console.log("STATUS:", error.response?.status);
      console.log("DATA:", JSON.stringify(error.response?.data));
      console.log("MESSAGE:", error.message);
    }

    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new AppError("Repository not found or not publicly accessible", 404);
    }

    throw new AppError("Failed to fetch repository metadata", 502);
  }
};

const fetchGitHubTree = async (
  owner: string,
  name: string,
  branch: string,
): Promise<GitHubTreeResponse> => {
  try {
    const response = await axios.get<GitHubTreeResponse>(
      `https://api.github.com/repos/${owner}/${name}/git/trees/${encodeURIComponent(
        branch,
      )}?recursive=1`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "DevInsight-AI",
        },
      },
    );

    // ── Truncated hone par sirf warn karo — error mat throw karo ──
    if (response.data.truncated) {
      console.warn(`[TREE] Repository tree truncated — using partial data.`);
    }

    return response.data;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Failed to fetch repository file tree", 502);
  }
};

const fetchGitHubPackageManifest = async (
  owner: string,
  name: string,
  branch: string,
  files: GitHubTreeItem[],
): Promise<PackageManifest | null> => {
  const packageFile = files.find(
    (file) => file.path.toLowerCase() === "package.json",
  );

  if (!packageFile) {
    return null;
  }

  try {
    const response = await axios.get<GitHubFileContentResponse>(
      `https://api.github.com/repos/${owner}/${name}/contents/package.json`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "DevInsight-AI",
        },
        params: {
          ref: branch,
        },
      },
    );

    if (response.data.encoding !== "base64") {
      return null;
    }

    const decodedContent = Buffer.from(response.data.content, "base64").toString(
      "utf8",
    );

    return JSON.parse(decodedContent) as PackageManifest;
  } catch {
    return null;
  }
};

const fetchReadmeContent = async (
  owner: string,
  name: string,
  branch: string,
): Promise<string | null> => {
  try {
    const response = await axios.get<GitHubFileContentResponse>(
      `https://api.github.com/repos/${owner}/${name}/contents/README.md`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "DevInsight-AI",
        },
        params: {
          ref: branch,
        },
      },
    );

    if (response.data.encoding !== "base64") {
      return null;
    }

    return Buffer.from(
      response.data.content,
      "base64",
    ).toString("utf8");
  } catch {
    return null;
  }
};

const getImportantFiles = (files: GitHubTreeItem[]): string[] =>
  files
    .filter((file) =>
      importantFileNames.has((file.path.split("/").pop() ?? "").toLowerCase()),
    )
    .map((file) => file.path)
    .sort((first, second) => first.localeCompare(second));

export const analyzeRepositoryUrl = async (
  repositoryUrl: unknown,
): Promise<RepositoryAnalysis> => {
  const url = normalizeRepositoryUrl(repositoryUrl);
  const host = url.hostname.toLowerCase();

  const { owner, name } = getRepositoryParts(url);

  ensureSupportedProvider(host);

  const repository = await fetchGitHubRepository(owner, name);

  const tree = await fetchGitHubTree(
    owner,
    name,
    repository.default_branch,
  );

  const files = tree.tree.filter(
    (item) => item.type === "blob",
  );

  const packageManifest = await fetchGitHubPackageManifest(
    owner,
    name,
    repository.default_branch,
    files,
  );

  const readmeContent = await fetchReadmeContent(
    owner,
    name,
    repository.default_branch,
  );

  const detectedTechnologies = detectTechnologies(
    files,
    packageManifest,
  );

  const importantFiles = getImportantFiles(files);

  const complexity = calculateComplexityScore(
    files.length,
    detectedTechnologies.length,
    importantFiles.length,
  );

  console.log(`[REPO] Analyzing: ${owner}/${name}`);
  console.log(`[REPO] Files: ${files.length}, Technologies: ${detectedTechnologies.length}`);
console.log("===== AI CALL START =====");
  const aiAnalysis = await generateAIAnalysis(
    name,
    detectedTechnologies,
    files.length,
    importantFiles,
    readmeContent,
  );
  console.log("===== AI CALL END =====");

  return {
    repositoryUrl: url.toString(),
    provider: providerByHost[host] ?? host,
    owner,
    name,
    defaultBranch: repository.default_branch,
    cloneUrl: `${url.protocol}//${url.host}/${owner}/${name}.git`,
    filesCount: files.length,
    importantFiles,
    detectedTechnologies,
    complexityScore: complexity.score,
    complexityLevel: complexity.level,
    aiAnalysis,
  };
};