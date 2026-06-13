export interface ComplexityResult {
  score: number;
  level: string;
}

export const calculateComplexityScore = (
  filesCount: number,
  technologiesCount: number,
  importantFilesCount: number,
): ComplexityResult => {
  let score = 0;

  // File Count Score
  if (filesCount > 5000) {
    score += 40;
  } else if (filesCount > 1000) {
    score += 30;
  } else if (filesCount > 300) {
    score += 20;
  } else if (filesCount > 100) {
    score += 15;
  }

  // Technology Diversity Score
  if (technologiesCount >= 6) {
    score += 25;
  } else if (technologiesCount >= 4) {
    score += 15;
  } else if (technologiesCount >= 2) {
    score += 10;
  }

  // Important Files Score
  if (importantFilesCount >= 20) {
    score += 20;
  } else if (importantFilesCount >= 10) {
    score += 15;
  } else if (importantFilesCount >= 3) {
    score += 10;
  }

  // Base Score
  score += 20;

  // Max Score Limit
  if (score > 100) {
    score = 100;
  }

  let level = "Beginner";

  if (score >= 85) {
    level = "Enterprise";
  } else if (score >= 65) {
    level = "Advanced";
  } else if (score >= 40) {
    level = "Intermediate";
  }

  return {
    score,
    level,
  };
};