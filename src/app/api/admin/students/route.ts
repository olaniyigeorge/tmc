import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Student from "@/models/Student";
import { getSessionUser, ensureSchoolAccess } from "@/lib/auth";
import { studentCreateSchema } from "@/validation/admin";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    await connectToDatabase();
    const url = new URL(req.url);
    const schoolId = url.searchParams.get("schoolId");
    const classId = url.searchParams.get("classId");
    const query: any = {};
    if (schoolId) {
      ensureSchoolAccess(user, schoolId);
      query.schoolId = schoolId;
    } else if (user.role !== "SUPER_ADMIN") {
      query.schoolId = user.schoolId;
    }
    if (classId) query.classId = classId;
    let students = await Student.find(query).lean();
    // attach class names
    const classIds = students.map((s: any) => s.classId);
    const ClassModel = (await import("@/models/Class")).default;
    const classes = await ClassModel.find({ _id: { $in: classIds } }).lean();
    const classMap: Record<string,string> = {};
    classes.forEach((c: any) => { classMap[c._id.toString()] = c.name; });
    // attach school names if needed
    const schoolIds = students.map((s: any) => s.schoolId);
    const SchoolModel = (await import("@/models/School")).default;
    const schoolsList = await SchoolModel.find({ _id: { $in: schoolIds } }).lean();
    const schoolMap: Record<string,string> = {};
    schoolsList.forEach((s: any) => { schoolMap[s._id.toString()] = s.name; });
    students = students.map((s: any) => ({
      ...s,
      className: classMap[s.classId?.toString()],
      schoolName: schoolMap[s.schoolId?.toString()],
    }));
    return NextResponse.json({ ok: true, data: students });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "SCHOOL_ADMIN" && user.role !== "TEACHER")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json();
    const parsed = studentCreateSchema.parse(body);
    ensureSchoolAccess(user, parsed.schoolId);
    await connectToDatabase();
    // check unique studentCode
    const existing = await Student.findOne({ schoolId: parsed.schoolId, studentCode: parsed.studentCode });
    if (existing) {
      return NextResponse.json({ ok: false, error: "studentCode already exists" }, { status: 400 });
    }
    if (parsed.admissionNo) {
      const ex2 = await Student.findOne({ schoolId: parsed.schoolId, admissionNo: parsed.admissionNo });
      if (ex2) {
        return NextResponse.json({ ok: false, error: "admissionNo already exists" }, { status: 400 });
      }
    }
    const created = new Student(parsed);
    await created.save();
    return NextResponse.json({ ok: true, data: created });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: err.message || "Error" }, { status: 500 });
  }
}
