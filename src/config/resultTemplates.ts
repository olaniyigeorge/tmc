export type ColumnDef = { key: string; max: number; required: boolean };
export type ResultTemplate = {
  key: string;
  schoolType: "SECONDARY" | "PRIMARY";
  columns: ColumnDef[];
  includeAttendance: boolean;
  includeLastTerm: boolean;
  includeCumulative: boolean;
  grading: "A_F" | "A_E" | "ONE_FIVE";
  defaultSubjects: string[];
};

export const secondarySubjects = [
  "English Language",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Commerce",
  "Economics",
  "Government",
  "Literature",
  "CRS",
];
export const primarySubjects = [
  "English Language",
  "Mathematics",
  "Basic Science",
  "Social Studies",
  "Religion",
  "Computer",
];

export const resultTemplates: Record<string, ResultTemplate> = {
  TINABEL_SECONDARY: {
    key: "TINABEL_SECONDARY",
    schoolType: "SECONDARY",
    columns: [
      { key: "test1", max: 20, required: true },
      { key: "test2", max: 20, required: true },
      { key: "exam", max: 60, required: true },
    ],
    includeAttendance: true,
    includeLastTerm: false,
    includeCumulative: false,
    grading: "A_F",
    defaultSubjects: secondarySubjects,
  },
  TINUOLA_PRIMARY: {
    key: "TINUOLA_PRIMARY",
    schoolType: "PRIMARY",
    columns: [
      { key: "test1", max: 10, required: true },
      { key: "test2", max: 10, required: true },
      { key: "test3", max: 10, required: true },
      { key: "exam", max: 70, required: true },
    ],
    includeAttendance: false,
    includeLastTerm: true,
    includeCumulative: true,
    grading: "A_F",
    defaultSubjects: primarySubjects,
  },
};
