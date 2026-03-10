import { resultTemplates } from "../config/resultTemplates";
import { calculateGrade } from "../lib/grading";
import { getPreviousTerm } from "../lib/term";
import Result from "../models/Result";


export type SubjectInput = {
  name: string;
  scores: Record<string, number>;
  remark?: string;
};

export type AttendanceInput = {
  opened?: number;
  present?: number;
  punctual?: number;
  absent?: number;
};

export type RatingsInput = {
  scale: "A_E" | "ONE_FIVE";
  items: Record<string, string>;
};

interface NormalizeParams {
  templateKey: string;
  subjects: SubjectInput[];
  attendance?: AttendanceInput;
  ratings?: RatingsInput;
  session: string;
  term: "1st" | "2nd" | "3rd";
  classSnapshot: { classId: string; name: string; level: string };
  schoolId: string;
  studentId: string;
}

export async function validateAndNormalizeResultInput(
  params: NormalizeParams
) {
  const {
    templateKey,
    subjects,
    attendance,
    ratings,
    session,
    term,
    classSnapshot,
    schoolId,
    studentId,
  } = params;
  const template = resultTemplates[templateKey];
  if (!template) {
    throw new Error("Invalid templateKey");
  }

  // Validate subjects
  const seen = new Set<string>();
  const normalizedSubjects: any[] = [];
  for (const subj of subjects) {
    if (seen.has(subj.name)) {
      throw new Error(`Duplicate subject ${subj.name}`);
    }
    seen.add(subj.name);

    // check scores keys allowed
    let total = 0;
    for (const col of template.columns) {
      const score = subj.scores[col.key];
      if (col.required && (score === undefined || score === null)) {
        throw new Error(`Missing required score ${col.key} for ${subj.name}`);
      }
      if (score != null) {
        if (typeof score !== "number" || score < 0 || score > col.max) {
          throw new Error(`Invalid score for ${subj.name}:${col.key}`);
        }
        total += score;
      }
    }
    const grade = calculateGrade(template.grading, total);

    normalizedSubjects.push({
      name: subj.name,
      scores: subj.scores,
      total,
      grade,
      remark: subj.remark,
      lastTermTotal: null,
      cumulative: null,
      average: null,
    });
  }

  // attendance validate simple
  let normalizedAttendance: any = undefined;
  if (attendance) {
    normalizedAttendance = {
      opened: attendance.opened,
      present: attendance.present,
      punctual: attendance.punctual,
      absent: attendance.absent,
    };
  }

  // ratings
  let normalizedRatings: any = undefined;
  if (ratings) {
    normalizedRatings = ratings;
  }

  // compute last term / cumulative if needed
  if (template.includeLastTerm || template.includeCumulative) {
    const prevTerm = getPreviousTerm(term);
    if (prevTerm) {
        const prev = await Result.findOne({
        schoolId,
        studentId,
        session,
        term: prevTerm,
        }).lean<{ subjects: Array<{ name: string; total: number }> }>();

        if (prev) {
        const mapPrev: Record<string, { name: string; total: number }> = {};
        prev.subjects.forEach((s) => {
            mapPrev[s.name] = s;
        });
        normalizedSubjects.forEach((s) => {
            const p = mapPrev[s.name];
            if (p) {
            if (template.includeLastTerm) s.lastTermTotal = p.total;
            if (template.includeCumulative) {
                s.cumulative = p.total + s.total;
                s.average = s.cumulative / 2;
            }
            }
        });
        }
    }
  }

  return {
    schoolId,
    studentId,
    classSnapshot,
    session,
    term,
    templateKey,
    attendance: normalizedAttendance,
    subjects: normalizedSubjects,
    ratings: normalizedRatings,
  };
}
