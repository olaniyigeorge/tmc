import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Result from "@/models/Result";
import { verifySchema } from "@/validation/public";

const verifyAttempts: Record<string, {count:number, time:number}> = {};

interface Ctx { params: Promise<{ code: string }> }


export async function GET(
  req: NextRequest,
  { params }: Ctx) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim()
        ?? req.headers.get("x-real-ip")
        ?? "global";
    const key = ip || "global";
    const now = Date.now();
    const entry = verifyAttempts[key] || { count: 0, time: now };
    if (now - entry.time < 60000 && entry.count >= 60) {
      return NextResponse.json({ ok: false, error: "Too many attempts" }, { status: 429 });
    }
    if (now - entry.time >= 60000) {
      entry.count = 0; entry.time = now;
    }
    entry.count += 1;
    verifyAttempts[key] = entry;
    const parsed = verifySchema.parse({ code: (await params).code });
    await connectToDatabase();
    const result = await Result.findOne({ verificationCode: parsed.code }).lean() as any;
    if (!result) {
      return NextResponse.json({ ok: true, data: { valid: false } });
    }
    // basic info
    const Student = (await import("@/models/Student")).default;
    const School = (await import("@/models/School")).default;
    const student = await Student.findById(result.studentId).lean() as any;
    const school = await School.findById(result.schoolId).lean() as any;
    return NextResponse.json({
      ok: true,
      data: {
        valid: true,
        schoolName: school?.name,
        studentName: student ? `${student.firstName} ${student.lastName}` : "",
        className: result.classSnapshot.name,
        session: result.session,
        term: result.term,
        issuedAt: result.issuedAt,
        status: result.status,
      },
    });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: err.message || "Error" }, { status: 500 });
  }
}
