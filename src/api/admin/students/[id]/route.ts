import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/db";
import Student from "../../../../models/Student";
import { getSessionUser, ensureSchoolAccess } from "../../../../lib/auth";
import { studentUpdateSchema } from "../../../../validation/admin";

type StudentDoc = {
  _id: unknown;
  schoolId: { toString(): string };
  studentCode: string;
  admissionNo?: string;
  classId: unknown;
  firstName: string;
  lastName: string;
};

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    await connectToDatabase();
    const student = await Student.findById(params.id).lean<StudentDoc>();
    if (!student) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    ensureSchoolAccess(user, student.schoolId.toString());
    return NextResponse.json({ ok: true, data: student });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "SCHOOL_ADMIN" && user.role !== "TEACHER")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json();
    const parsed = studentUpdateSchema.parse(body);
    await connectToDatabase();
    const student = await Student.findById(params.id);
    if (!student) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }
    ensureSchoolAccess(user, student.schoolId.toString());
    if (parsed.studentCode && parsed.studentCode !== student.studentCode) {
      const ex = await Student.findOne({ schoolId: student.schoolId, studentCode: parsed.studentCode });
      if (ex) {
        return NextResponse.json({ ok: false, error: "studentCode already exists" }, { status: 400 });
      }
    }
    if (parsed.admissionNo && parsed.admissionNo !== student.admissionNo) {
      const ex2 = await Student.findOne({ schoolId: student.schoolId, admissionNo: parsed.admissionNo });
      if (ex2) {
        return NextResponse.json({ ok: false, error: "admissionNo already exists" }, { status: 400 });
      }
    }
    Object.assign(student, parsed);
    await student.save();
    return NextResponse.json({ ok: true, data: student });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: err.message || "Error" }, { status: 500 });
  }
}
