console.log("AI SERVICE LOADED");
import axios from "axios";
import { env } from "../config/env";

export interface AIAnalysis {
  summary: string;
  architecture: string;
  improvements: string[];
  interviewQuestions: string[];
}

const extractJson = (text: string): string => {
  let cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end   = cleaned.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.slice(start, end + 1);
  }
  return cleaned;
};

const validateAndFill = (parsed: any): AIAnalysis => {
  return {
    summary:
      typeof parsed.summary === "string" && parsed.summary.trim()
        ? parsed.summary.trim()
        : "Summary not available.",
    architecture:
      typeof parsed.architecture === "string" && parsed.architecture.trim()
        ? parsed.architecture.trim()
        : "Architecture details not available.",
    improvements:
      Array.isArray(parsed.improvements) && parsed.improvements.length > 0
        ? parsed.improvements.filter((i: any) => typeof i === "string")
        : ["No suggestions available."],
    interviewQuestions:
      Array.isArray(parsed.interviewQuestions) && parsed.interviewQuestions.length > 0
        ? parsed.interviewQuestions.filter((q: any) => typeof q === "string")
        : ["No questions available."],
  };
};

const buildPrompt = (
  repoName: string,
  technologies: string[],
  filesCount: number,
  importantFiles: string[],
  readmeContent?: string | null
): string => `You are a senior software architect. Analyze this GitHub repository and return ONLY a JSON object. No markdown, no explanation, no code blocks.

REPOSITORY DETAILS:
- Name: ${repoName}
- Technologies: ${technologies.join(", ") || "Not detected"}
- Total Files: ${filesCount}
- Key Files: ${importantFiles.join(", ") || "None"}
- README: ${readmeContent?.slice(0, 4000) ?? "Not available"}

Return this exact JSON structure with all fields filled:
{"summary":"3-4 sentences about what this project does and its purpose","architecture":"4-5 sentences describing frontend backend database and how components connect","improvements":["improvement 1","improvement 2","improvement 3","improvement 4","improvement 5"],"interviewQuestions":["question 1?","question 2?","question 3?","question 4?","question 5?"]}`;

export const generateAIAnalysis = async (
  repoName: string,
  technologies: string[],
  filesCount: number,
  importantFiles: string[],
  readmeContent?: string | null
): Promise<AIAnalysis> => {
     

   
  console.log("[AI] generateAIAnalysis called for:", repoName);
  console.log("[AI] KEY:", process.env.OPENROUTER_API_KEY ? "FOUND" : "MISSING");

  const prompt = buildPrompt(repoName, technologies, filesCount, importantFiles, readmeContent);

  const models = [
     "google/gemini-2.5-flash"
  ];

  for (const model of models) {
    try {
      console.log(`[AI] Trying model: ${model}`);
        console.log("[AI] Sending request to OpenRouter...");
      const response = await axios.post(
        
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model,
          messages: [
            {
              role: "system",
              content: "You are a senior software architect. Respond with valid JSON only. No markdown, no code blocks, no explanation whatsoever.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 2000,
          temperature: 0.3,
        },
        {
          headers: {
            Authorization: `Bearer ${env.openRouterApiKey}`,
  "Content-Type": "application/json",
          },
          timeout: 40000,
        }
      );
              console.log("[AI] Response received");
console.log(JSON.stringify(response.data, null, 2));
      const raw = response.data.choices?.[0]?.message?.content as string;
      console.log("[AI] Raw response:", raw?.slice(0, 200));

      if (!raw || raw.trim().length === 0) {
        console.warn(`[AI] Empty response from ${model}`);
        continue;
      }

      const extracted = extractJson(raw);
      const parsed    = JSON.parse(extracted);
      const result    = validateAndFill(parsed);

      if (
        result.summary === "Summary not available." ||
        result.interviewQuestions[0] === "No questions available."
      ) {
        console.warn(`[AI] Incomplete response from ${model}, trying next...`);
        continue;
      }

      console.log(`[AI] Success with model: ${model}`);
      return result;

    } catch (error: any) {
  console.error("========== OPENROUTER ERROR ==========");

  if (error.response) {
    console.error("Status:", error.response.status);
    console.error("Data:", JSON.stringify(error.response.data, null, 2));
  } else {
    console.error("Message:", error.message);
  }
}
  }

  console.error("[AI] All models failed.");
  return {
    summary: "AI analysis unavailable. Please try again.",
    architecture: "AI analysis unavailable. Please try again.",
    improvements: ["Please retry the analysis for AI-powered suggestions."],
    interviewQuestions: ["Please retry the analysis for interview questions."],
  };
};