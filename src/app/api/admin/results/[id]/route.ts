import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Result from "@/models/Result";
import { getSessionUser, ensureSchoolAccess } from "@/lib/auth";

// ── GET /api/admin/results/[id] ───────────────────────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectToDatabase();

    const result = await Result.findById(id)
      .populate("studentId", "firstName lastName otherName studentCode admissionNo sex dob")
      .lean();

    if (!result) {
      return NextResponse.json({ ok: false, error: "Result not found" }, { status: 404 });
    }

    ensureSchoolAccess(user, (result as any).schoolId.toString());

    return NextResponse.json({ ok: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Error" }, { status: 500 });
  }
}

// ── PATCH /api/admin/results/[id] ─────────────────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectToDatabase();

    const result = await Result.findById(id);
    if (!result) return NextResponse.json({ ok: false, error: "Result not found" }, { status: 404 });

    ensureSchoolAccess(user, result.schoolId.toString());

    if (result.status === "PUBLISHED") {
      return NextResponse.json({ ok: false, error: "Cannot edit a published result" }, { status: 403 });
    }

    const body = await req.json();
    const { subjects, attendance, ratings, comments, totalInClass } = body;

    // ── Server-side score recomputation (never trust client totals/grades) ────
    if (subjects) {
      const template = result.templateKey;

      result.subjects = subjects.map((s: any) => {
        const scores: Record<string, number> = {};
        let total = 0;

        if (template === "TINABEL_SECONDARY") {
          scores.test1 = clamp(Number(s.scores?.test1) || 0, 0, 20);
          scores.test2 = clamp(Number(s.scores?.test2) || 0, 0, 20);
          scores.exam  = clamp(Number(s.scores?.exam)  || 0, 0, 60);
          total = scores.test1 + scores.test2 + scores.exam;
        } else {
          // TINUOLA_PRIMARY
          scores.test1 = clamp(Number(s.scores?.test1) || 0, 0, 10);
          scores.test2 = clamp(Number(s.scores?.test2) || 0, 0, 10);
          scores.test3 = clamp(Number(s.scores?.test3) || 0, 0, 10);
          scores.exam  = clamp(Number(s.scores?.exam)  || 0, 0, 70);
          total = scores.test1 + scores.test2 + scores.test3 + scores.exam;
        }

        return {
          name:   s.name,
          scores: new Map(Object.entries(scores)),
          total,
          grade:  computeGrade(total, template),
          remark: s.remark || "",
        };
      });
    }

    if (attendance)   result.attendance   = attendance;
    if (ratings)      result.ratings      = ratings;
    if (comments)     result.comments     = comments;
    if (totalInClass !== undefined) result.totalInClass = totalInClass;

    await result.save();

    // Re-fetch with population so the response has full student data
    const updated = await Result.findById(id)
      .populate("studentId", "firstName lastName otherName studentCode admissionNo sex dob")
      .lean();

    return NextResponse.json({ ok: true, data: updated });
  } catch (err: any) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors as Record<string, { message: string }>)
        .map((e: any) => e.message)
        .join("; ");
      return NextResponse.json({ ok: false, error: `Validation failed: ${messages}` }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: err.message || "Error" }, { status: 500 });
  }
}

// ── helpers ───────────────────────────────────────────────────────────────────
function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

function computeGrade(total: number, templateKey: string): string {
  // Both schools use A–F for subject grades
  if (total >= 75) return "A1";
  if (total >= 70) return "B2";
  if (total >= 65) return "B3";
  if (total >= 60) return "C4";
  if (total >= 55) return "C5";
  if (total >= 50) return "C6";
  if (total >= 45) return "D7";
  if (total >= 40) return "E8";
  return "F9";
}