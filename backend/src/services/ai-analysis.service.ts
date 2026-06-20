console.log("AI SERVICE LOADED");
import axios from "axios";
import { env } from "../config/env";

export interface AIAnalysis {
  summary: string;
  architecture: string;
  strengths: string[];
  improvements: string[];
  interviewQuestions: string[];
}

interface AIAnalysisRequest {
  repoName: string;
  technologies: string[];
  filesCount: number;
  importantFiles: string[];
  readmeContent?: string | null;
  description?: string | null;
  stars?: number;
  forks?: number;
  primaryLanguage?: string | null;
  languageStats?: Record<string, number>;
}

const DEFAULT_TOKEN_LIMIT = 250;
const LARGE_REPO_TOKEN_LIMIT = 350;
const MAX_TOKEN_LIMIT = 400;
const LARGE_REPO_FILE_THRESHOLD = 250;
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const REQUEST_TIMEOUT_MS = 30000;

const models = [
  "qwen/qwen3-8b:free",
  "meta-llama/llama-4-scout:free",
  "mistralai/mistral-small-3.2-24b-instruct:free",
] as const;

const cleanForPrompt = (value?: string | null, maxLength = 1200): string => {
  if (!value) {
    return "Not available";
  }

  return value
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
};

const calculateMaxTokens = (filesCount: number): number => {
  const tokenLimit = filesCount > LARGE_REPO_FILE_THRESHOLD
    ? LARGE_REPO_TOKEN_LIMIT
    : DEFAULT_TOKEN_LIMIT;

  return Math.min(tokenLimit, MAX_TOKEN_LIMIT);
};

const extractJson = (text: string): string => {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    return cleaned;
  }

  return cleaned.slice(start, end + 1);
};

const validateAndFill = (parsed: any): AIAnalysis => ({
  summary:
    typeof parsed.summary === "string" && parsed.summary.trim()
      ? parsed.summary.trim()
      : "Summary not available.",
  architecture:
    typeof parsed.architecture === "string" && parsed.architecture.trim()
      ? parsed.architecture.trim()
      : "Architecture details not available.",
  strengths:
    Array.isArray(parsed.strengths) && parsed.strengths.length > 0
      ? parsed.strengths.filter((item: any) => typeof item === "string")
      : ["Strengths not available."],
  improvements:
    Array.isArray(parsed.improvements) && parsed.improvements.length > 0
      ? parsed.improvements.filter((item: any) => typeof item === "string")
      : ["No suggestions available."],
  interviewQuestions:
    Array.isArray(parsed.interviewQuestions) && parsed.interviewQuestions.length > 0
      ? parsed.interviewQuestions.filter((item: any) => typeof item === "string")
      : ["No questions available."],
});

const buildPrompt = (props: AIAnalysisRequest): string => {
  const {
    repoName,
    technologies,
    filesCount,
    importantFiles,
    readmeContent,
    description,
    stars,
    forks,
    primaryLanguage,
    languageStats,
  } = props;

  const languageSummary = languageStats && Object.keys(languageStats).length > 0
    ? Object.entries(languageStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([lang, bytes]) => `${lang}: ${bytes} bytes`)
        .join(", ")
    : primaryLanguage
      ? `Primary language: ${primaryLanguage}`
      : "Language stats: Not available";

  return `You are a senior software architect. Analyze this GitHub repository and respond with valid JSON only. No markdown, no code fences, no explanation. Keep output concise and under 250 words total.

REPOSITORY:
- Name: ${repoName}
- Description: ${cleanForPrompt(description, 300)}
- Technologies: ${technologies.join(", ") || "Not detected"}
- Files: ${filesCount}
- Key files: ${importantFiles.join(", ") || "None"}
- Stars: ${stars ?? "Unknown"}
- Forks: ${forks ?? "Unknown"}
- ${languageSummary}
- README excerpt: ${cleanForPrompt(readmeContent, 1200)}

Return exactly this JSON structure:
{"summary":"","architecture":"","strengths":[""],"improvements":[""],"interviewQuestions":[""]}

Provide 3-5 strengths, 3-5 improvements, and 3-5 interview questions. Make summary and architecture short, accurate, and focused on repository purpose, stack, and component interaction.`;
};

const isRetryableOpenRouterError = (error: unknown): boolean => {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  const status = error.response?.status;
  if (!status) {
    return true;
  }

  return [402, 429, 503, 500, 504, 423, 507].includes(status) || status >= 500;
};

const generateFallbackAIAnalysis = (props: AIAnalysisRequest): AIAnalysis => {
  const {
    repoName,
    technologies,
    filesCount,
    importantFiles,
    description,
    stars,
    forks,
    primaryLanguage,
  } = props;

  const techLine = technologies.length > 0 ? technologies.join(", ") : "a technology stack";
  const stats = [`${filesCount} files`, primaryLanguage ? `${primaryLanguage} codebase` : "mixed languages"];

  if (typeof stars === "number") {
    stats.push(`${stars} star${stars === 1 ? "" : "s"}`);
  }

  if (typeof forks === "number") {
    stats.push(`${forks} fork${forks === 1 ? "" : "s"}`);
  }

  const structure = importantFiles.length > 0
    ? `Key files include ${importantFiles.slice(0, 4).join(", ")}`
    : "Repository structure is not detailed.";

  return {
    summary: `The ${repoName} repository is built around ${techLine}. It appears designed for ${description ? cleanForPrompt(description, 200) : "general application use"} with a repository structure focused on ${structure.toLowerCase()}.`,
    architecture: `This project likely combines frontend and backend components using ${techLine}. The codebase spans ${stats.join(", ")} and indicates a modern JavaScript/TypeScript architecture.`,
    strengths: [
      `Clear technology stack with ${techLine}.`,
      `Reasonable project size (${filesCount} files) for maintainability.`,
      structure,
      `Fallback metadata includes ${stats.join(", ")}.`,
    ].slice(0, 5),
    improvements: [
      "Add a concise README summary if not already present.",
      "Document the architecture and deployment flow more clearly.",
      "Provide stronger folder-level separation between frontend and backend.",
      "Include comments or developer notes in key files like package.json or config files.",
      "Add explicit onboarding documentation for new contributors.",
    ].slice(0, 5),
    interviewQuestions: [
      `What are the main responsibilities of the ${techLine} components in this repository?`,
      "How does the repository structure support separation of concerns?",
      "What would you change to improve deployment and scalability?",
      "How would you add a CI/CD pipeline for this project?",
      "What security or dependency maintenance risks should be monitored?",
    ].slice(0, 5),
  };
};

export const generateAIAnalysis = async (
  repoName: string,
  technologies: string[],
  filesCount: number,
  importantFiles: string[],
  readmeContent?: string | null,
  description?: string | null,
  stars?: number,
  forks?: number,
  primaryLanguage?: string | null,
  languageStats?: Record<string, number>,
): Promise<AIAnalysis> => {
  console.log("[AI] generateAIAnalysis called for:", repoName);

  const requestPayload: AIAnalysisRequest = {
    repoName,
    technologies,
    filesCount,
    importantFiles,
    readmeContent,
    description,
    stars,
    forks,
    primaryLanguage,
    languageStats,
  };

  if (!env.openRouterApiKey) {
    console.warn("[AI] OPENROUTER_API_KEY missing, using fallback analysis.");
    return generateFallbackAIAnalysis(requestPayload);
  }

  const tokenLimit = calculateMaxTokens(filesCount);
  const prompt = buildPrompt(requestPayload);

  for (const model of models) {
    const requestStart = Date.now();
    console.log(`[AI] Attempting model: ${model} with max_tokens=${tokenLimit}`);

    try {
      const response = await axios.post(
        OPENROUTER_URL,
        {
          model,
          messages: [
            {
              role: "system",
              content: "You are a senior software architect. Reply with valid JSON only. No markdown, no code blocks, no explanations.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: tokenLimit,
          temperature: 0.2,
        },
        {
          headers: {
            Authorization: `Bearer ${env.openRouterApiKey}`,
            "Content-Type": "application/json",
          },
          timeout: REQUEST_TIMEOUT_MS,
        },
      );

      const elapsedMs = Date.now() - requestStart;
      console.log(`[AI] Response received from ${model} in ${elapsedMs}ms`);
      console.log(`[AI] Response status: ${response.status}`);

      const raw = response.data?.choices?.[0]?.message?.content;
      console.log("[AI] Raw response preview:", typeof raw === "string" ? raw.slice(0, 300) : raw);

      if (!raw || typeof raw !== "string" || raw.trim().length === 0) {
        console.warn(`[AI] Empty or invalid response from ${model}`);
        continue;
      }

      const extracted = extractJson(raw);
      let parsed: unknown;

      try {
        parsed = JSON.parse(extracted);
      } catch (parseError) {
        console.warn(`[AI] JSON parse failed for ${model}:`, (parseError as Error).message);
        continue;
      }

      const result = validateAndFill(parsed);

      if (
        result.summary === "Summary not available." ||
        result.architecture === "Architecture details not available." ||
        result.interviewQuestions[0] === "No questions available."
      ) {
        console.warn(`[AI] Incomplete response from ${model}, trying next model.`);
        continue;
      }

      console.log(`[AI] Success with model: ${model}`);
      return result;
    } catch (error: unknown) {
      const elapsedMs = Date.now() - requestStart;
      console.error(`[AI] Error with ${model} after ${elapsedMs}ms`);

      if (axios.isAxiosError(error)) {
        console.error("[AI] OpenRouter error status:", error.response?.status);
        console.error("[AI] OpenRouter error data:", JSON.stringify(error.response?.data));
        console.error("[AI] OpenRouter error message:", error.message);
      } else {
        console.error("[AI] Error message:", (error as Error).message);
      }

      if (!isRetryableOpenRouterError(error)) {
        console.warn("[AI] Non-retryable error encountered, breaking model retry loop.");
        break;
      }

      console.warn("[AI] Retryable error; trying next model if available.");
    }
  }

  console.error("[AI] All OpenRouter models failed. Falling back to metadata-based analysis.");
  return generateFallbackAIAnalysis(requestPayload);
};