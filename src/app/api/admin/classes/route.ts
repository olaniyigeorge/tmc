import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import ClassModel from "@/models/Class";
import { getSessionUser, ensureSchoolAccess } from "@/lib/auth";
import { classSchema } from "@/validation/admin";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    await connectToDatabase();
    if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const url = new URL(req.url);
    const schoolId = url.searchParams.get("schoolId");
    if (schoolId) {
      ensureSchoolAccess(user, schoolId);
      const classes = await ClassModel.find({ schoolId }).lean();
      return NextResponse.json({ ok: true, data: classes });
    }
    if (user.role === "SUPER_ADMIN") {
      const classes = await ClassModel.find().lean();
      return NextResponse.json({ ok: true, data: classes });
    }
    const classes = await ClassModel.find({ schoolId: user.schoolId }).lean();
    return NextResponse.json({ ok: true, data: classes });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "SCHOOL_ADMIN")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json();
    const parsed = classSchema.parse(body);
    ensureSchoolAccess(user, parsed.schoolId);
    await connectToDatabase();
    const existing = await ClassModel.findOne({ schoolId: parsed.schoolId, name: parsed.name });
    if (existing) {
      return NextResponse.json({ ok: false, error: "Class name already exists" }, { status: 400 });
    }
    const created = new ClassModel(parsed);
    await created.save();
    return NextResponse.json({ ok: true, data: created });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: err.message || "Error" }, { status: 500 });
  }
}
