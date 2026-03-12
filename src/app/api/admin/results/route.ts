import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Result from "@/models/Result";
import StudentModel from "@/models/Student";
import SchoolModel from "@/models/School";
import ClassModel from "@/models/Class";
import { getSessionUser, ensureSchoolAccess } from "@/lib/auth";
import crypto from "crypto";

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

/** Generate a temporary unique verification code for draft results.
 *  The publish flow will overwrite this with the formatted school/session code. */
function generateDraftVerificationCode(): string {
  return "DRAFT-" + crypto.randomBytes(8).toString("hex").toUpperCase();
}

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

    const studentIds  = results.map((r) => r.studentId);
    const schoolIds   = results.map((r) => r.schoolId);

    const students    = await StudentModel.find({ _id: { $in: studentIds } }).lean<StudentLean[]>();
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
    console.log("POST /api/admin/results - user:", user);
    if (!user || !["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"].includes(user.role)) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { studentId, session, term } = body;
    if (!studentId || !session || !term) {
      return NextResponse.json({ ok: false, error: "Missing required fields: studentId, session, term" }, { status: 400 });
    }

    if (!["1st", "2nd", "3rd"].includes(term)) {
      return NextResponse.json({ ok: false, error: "Term must be 1st, 2nd, or 3rd" }, { status: 400 });
    }

    await connectToDatabase();

    const student = await StudentModel.findById(studentId);
    if (!student) {
      return NextResponse.json({ ok: false, error: "Student not found" }, { status: 404 });
    }

    ensureSchoolAccess(user, student.schoolId.toString());

    // Return existing result if already created for this student+session+term
    const exists = await Result.findOne({
      schoolId: student.schoolId,
      studentId,
      session,
      term,
    });
    if (exists) {
      return NextResponse.json({ ok: true, data: exists });
    }


    const school = await SchoolModel.findById(student.schoolId);
    const templateKey = school?.type === "SECONDARY" ? "TINABEL_SECONDARY" : "TINUOLA_PRIMARY";


    const cls = await ClassModel.findById(student.classId);

    // Generate a unique draft verification code — will be replaced on publish
    // with the proper formatted code (e.g. TMC-2526-1ST-JSS1A-8F3K2)
    let verificationCode = generateDraftVerificationCode();
    // Ensure uniqueness (extremely unlikely to collide, but be safe)
    let collision = await Result.findOne({ verificationCode });
    while (collision) {
      verificationCode = generateDraftVerificationCode();
      collision = await Result.findOne({ verificationCode });
    }

    const newResult = new Result({
      schoolId: student.schoolId,
      studentId,
      classSnapshot: cls
        ? { classId: cls._id, name: cls.name, level: cls.level }
        : { classId: student.classId, name: "Unknown", level: "JSS" },
      session,
      term,
      templateKey,
      subjects: [],
      verificationCode,   // ← satisfies the required field; overwritten at publish
      status: "DRAFT",
      createdBy: user.id,
    });

    await newResult.save();
    return NextResponse.json({ ok: true, data: newResult }, { status: 201 });
  } catch (err: any) {
    // Surface Mongoose validation errors clearly
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors as Record<string, { message: string }>)
        .map((e) => e.message)
        .join("; ");
      return NextResponse.json({ ok: false, error: `Result validation failed: ${messages}` }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: err.message || "Error" }, { status: 500 });
  }
}