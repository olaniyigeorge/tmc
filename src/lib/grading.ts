// grading utilities

export type GradingScale = "A_F" | "A_E" | "ONE_FIVE";

// simple scale A-F with thresholds
export function gradeAF(total: number): string {
  if (total >= 70) return "A";
  if (total >= 60) return "B";
  if (total >= 50) return "C";
  if (total >= 45) return "D";
  if (total >= 40) return "E";
  return "F";
}

export function gradeAE(total: number): string {
  if (total >= 70) return "A";
  if (total >= 60) return "B";
  if (total >= 50) return "C";
  if (total >= 45) return "D";
  if (total >= 40) return "E";
  return "F";
}

export function gradeOneFive(score: number): string {
  // assume score between 1 and 5 inclusive
  if (score <= 1) return "1";
  if (score <= 2) return "2";
  if (score <= 3) return "3";
  if (score <= 4) return "4";
  return "5";
}

export function calculateGrade(scale: GradingScale, value: number): string {
  switch (scale) {
    case "A_F":
      return gradeAF(value);
    case "A_E":
      return gradeAE(value);
    case "ONE_FIVE":
      return gradeOneFive(value);
    default:
      return "";
  }
}
