import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ success: false, error: "Cron cleanup is not configured." }, { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { count } = await prisma.scholarship.deleteMany({ where: { deadline: { lt: new Date() } } });
    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error("Scholarship expiration cleanup failed", error);
    return NextResponse.json({ success: false, error: "Unable to clean up expired scholarships." }, { status: 503 });
  }
}
