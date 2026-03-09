import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/db";
import Result from "../../../../models/Result";
import { getSessionUser, ensureSchoolAccess } from "../../../../lib/auth";
import { validateAndNormalizeResultInput } from "../../../../validation/results";

type ResultLean = {
  _id: unknown;
  schoolId: { toString(): string };
  studentId: { toString(): string };
  classSnapshot: { classId: { toString(): string }; name: string; level: string };
  session: string;
  term: string;
  templateKey: string;
  status: string;
};

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    await connectToDatabase();
    const result = await Result.findById(params.id).lean<ResultLean>();
    if (!result) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    ensureSchoolAccess(user, result.schoolId.toString());
    return NextResponse.json({ ok: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "SCHOOL_ADMIN" && user.role !== "TEACHER")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json();
    await connectToDatabase();
    const result = await Result.findById(params.id);
    if (!result) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }
    ensureSchoolAccess(user, result.schoolId.toString());
    if (result.status === "PUBLISHED") {
      return NextResponse.json({ ok: false, error: "Cannot edit published result" }, { status: 400 });
    }
    // validate and normalize
    const normalized = await validateAndNormalizeResultInput({
      templateKey: result.templateKey,
      subjects: body.subjects,
      attendance: body.attendance,
      ratings: body.ratings,
      session: result.session,
      term: result.term,
      classSnapshot: {
        classId: result.classSnapshot.classId.toString(),
        name: result.classSnapshot.name,
        level: result.classSnapshot.level,
      },
      schoolId: result.schoolId.toString(),
      studentId: result.studentId.toString(),
    });
    Object.assign(result, normalized);
    await result.save();
    return NextResponse.json({ ok: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Error" }, { status: 500 });
  }
}
