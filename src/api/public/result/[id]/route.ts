import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/db";
import Result from "../../../models/Result";
import { verifyResultAccess } from "../../../lib/jwt";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.cookies.get("result_access")?.value;
    if (!token) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    const payload = verifyResultAccess(token);
    if (!payload || payload.resultId !== params.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    await connectToDatabase();
    const result = await Result.findById(params.id).lean();
    if (!result) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }
    const Student = (await import("../../../models/Student")).default;
    const School = (await import("../../../models/School")).default;
    const student = await Student.findById(result.studentId).lean();
    const school = await School.findById(result.schoolId).lean();
    return NextResponse.json({
      ok: true,
      data: {
        ...result,
        studentName: student ? `${student.firstName} ${student.lastName}` : "",
        schoolName: school?.name,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Error" }, { status: 500 });
  }
}
