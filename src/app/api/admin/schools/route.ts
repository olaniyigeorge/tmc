import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import School from "@/models/School";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  console.log("Req info", req)
  try {
    const user = await getSessionUser();
    await connectToDatabase();
    if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    let schools;
    if (user.role === "SUPER_ADMIN") {
      schools = await School.find().lean();
    } else {
      schools = await School.find({ _id: user.schoolId }).lean();
    }
    return NextResponse.json({ ok: true, data: schools });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json();
    const school = new School(body);
    await connectToDatabase();
    const saved = await school.save();
    return NextResponse.json({ ok: true, data: saved });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Error" }, { status: 500 });
  }
}
