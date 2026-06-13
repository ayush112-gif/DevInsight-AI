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
  complexityScore: number;
  complexityLevel: string;
  aiAnalysis: {
    summary: string;
    architecture: string;
    improvements: string[];
    interviewQuestions: string[];
  };
}