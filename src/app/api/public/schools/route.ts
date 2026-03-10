import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import School from "@/models/School";

export async function GET() {
  try {
    await connectToDatabase();
    const schools = await School.find({}, { name: 1, type: 1 }).lean();
    return NextResponse.json({ ok: true, data: schools });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}