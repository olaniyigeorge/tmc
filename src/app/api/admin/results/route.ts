import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/db";
import Result from "../../../../models/Result";
import Student from "../../../../models/Student";
import { getSessionUser, ensureSchoolAccess } from "../../../../lib/auth";

// ── lean types ───
type ResultLean = {
  _id: unknown;
  studentId: { toString(): string };
  schoolId: { toString(): string };
  classSnapshot: { classId: unknown; name: string; level: string };
  session: string;
  term: string;
  templateKey: string;
  status: string;
};

type StudentLean = {
  _id: { toString(): string };
  firstName: string;
  lastName: string;
};

type SchoolLean = {
  _id: { toString(): string };
  name: string;
};

// ── GET ───
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const schoolId = url.searchParams.get("schoolId");
    const classId  = url.searchParams.get("classId");
    const session  = url.searchParams.get("session");
    const term     = url.searchParams.get("term");

    await connectToDatabase();

    const query: Record<string, unknown> = {};
    if (schoolId) {
      ensureSchoolAccess(user, schoolId);
      query.schoolId = schoolId;
    } else if (user.role !== "SUPER_ADMIN") {
      query.schoolId = user.schoolId;
    }
    if (classId) query["classSnapshot.classId"] = classId;
    if (session)  query.session = session;
    if (term)     query.term    = term;

    const results = await Result.find(query).lean<ResultLean[]>();

    // attach student + school names
    const StudentModel = (await import("../../../../models/Student")).default;
    const SchoolModel  = (await import("../../../../models/School")).default;

    const studentIds = results.map((r) => r.studentId);
    const schoolIds  = results.map((r) => r.schoolId);

    const students   = await StudentModel.find({ _id: { $in: studentIds } }).lean<StudentLean[]>();
    const schoolsList = await SchoolModel.find({ _id: { $in: schoolIds } }).lean<SchoolLean[]>();

    const studentMap: Record<string, string> = {};
    students.forEach((s) => { studentMap[s._id.toString()] = `${s.firstName} ${s.lastName}`; });

    const schoolMap: Record<string, string> = {};
    schoolsList.forEach((s) => { schoolMap[s._id.toString()] = s.name; });

    const enriched = results.map((r) => ({
      ...r,
      studentName: studentMap[r.studentId.toString()],
      schoolName:  schoolMap[r.schoolId.toString()],
    }));

    return NextResponse.json({ ok: true, data: enriched });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Error" }, { status: 500 });
  }
}

// ── POST ───
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"].includes(user.role)) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { studentId, session, term } = body;
    if (!studentId || !session || !term) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();

    const student = await Student.findById(studentId);
    if (!student) return NextResponse.json({ ok: false, error: "Student not found" }, { status: 404 });

    ensureSchoolAccess(user, student.schoolId.toString());

    // return existing draft/result if already created
    const exists = await Result.findOne({ schoolId: student.schoolId, studentId, session, term });
    if (exists) return NextResponse.json({ ok: true, data: exists });

    const SchoolModel = (await import("../../../../models/School")).default;
    const school = await SchoolModel.findById(student.schoolId);
    const templateKey = school?.type === "SECONDARY" ? "TINABEL_SECONDARY" : "TINUOLA_PRIMARY";

    const ClassModel = (await import("../../../../models/Class")).default;
    const cls = await ClassModel.findById(student.classId);

    const newResult = new Result({
      schoolId: student.schoolId,
      studentId,
      classSnapshot: cls
        ? { classId: cls._id, name: cls.name, level: cls.level }
        : { classId: student.classId, name: "", level: "" },
      session,
      term,
      templateKey,
      subjects: [],
      verificationCode: "",
      createdBy: user.id,
    });

    await newResult.save();
    return NextResponse.json({ ok: true, data: newResult });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Error" }, { status: 500 });
  }
}