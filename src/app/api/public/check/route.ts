import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/db";
import Student from "../../../../models/Student";
import Result from "../../../../models/Result";
import bcrypt from "bcrypt";
import { signResultAccess } from "../../../../lib/jwt";
import { checkSchema } from "../../../../validation/public";

const attempts: Record<string, {count:number, time:number}> = {};

export async function POST(req: NextRequest) {
  try {
    // naive rate limit by ip
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim()
        ?? req.headers.get("x-real-ip")
        ?? "global";
    const key = ip || "global";
    const now = Date.now();
    const entry = attempts[key] || { count: 0, time: now };
    if (now - entry.time < 60000 && entry.count >= 30) {
      return NextResponse.json({ ok: false, error: "Too many attempts" }, { status: 429 });
    }
    if (now - entry.time >= 60000) {
      entry.count = 0; entry.time = now;
    }
    entry.count += 1;
    attempts[key] = entry;
    const body = await req.json();
    const parsed = checkSchema.parse(body);
    await connectToDatabase();
    const student = await Student.findOne({
      schoolId: parsed.schoolId,
      studentCode: parsed.studentCode,
    });
    if (!student) {
      return NextResponse.json({ ok: false, error: "Invalid details" }, { status: 400 });
    }
    const result = await Result.findOne({
      schoolId: parsed.schoolId,
      studentId: student._id,
      session: parsed.session,
      term: parsed.term,
      status: "PUBLISHED",
    });
    if (!result || !result.pinHash) {
      return NextResponse.json({ ok: false, error: "Result not published" }, { status: 404 });
    }
    const match = await bcrypt.compare(parsed.pin, result.pinHash);
    if (!match) {
      return NextResponse.json({ ok: false, error: "Invalid pin" }, { status: 400 });
    }
    const token = signResultAccess(result._id.toString());
    const res = NextResponse.json({ ok: true, data: { resultId: result._id } });
    res.cookies.set("result_access", token, { httpOnly: true, maxAge: 60 * 30 });
    return res;
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: err.message || "Error" }, { status: 500 });
  }
}
