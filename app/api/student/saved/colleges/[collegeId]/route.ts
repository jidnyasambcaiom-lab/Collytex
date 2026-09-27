import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(_request: Request, context: { params: Promise<{ collegeId: string }> }) {
  const user = await currentUser();
  if (!user || user.role !== "STUDENT") return NextResponse.json({ error: "Sign in with a student account to save colleges." }, { status: 403 });
  const { collegeId } = await context.params;
  try {
    const college = await prisma.college.findFirst({ where: { id: collegeId, verificationStatus: "VERIFIED" }, select: { id: true } });
    if (!college) return NextResponse.json({ error: "College not found." }, { status: 404 });
    await prisma.studentSavedCollege.upsert({ where: { userId_collegeId: { userId: user.id, collegeId } }, create: { userId: user.id, collegeId }, update: {} });
    return NextResponse.json({ ok: true, saved: true });
  } catch { return NextResponse.json({ error: "Unable to save this college right now." }, { status: 503 }); }
}

export async function DELETE(_request: Request, context: { params: Promise<{ collegeId: string }> }) {
  const user = await currentUser();
  if (!user || user.role !== "STUDENT") return NextResponse.json({ error: "Sign in with a student account to update your shortlist." }, { status: 403 });
  const { collegeId } = await context.params;
  try {
    await prisma.studentSavedCollege.deleteMany({ where: { userId: user.id, collegeId } });
    return NextResponse.json({ ok: true, saved: false });
  } catch { return NextResponse.json({ error: "Unable to update your shortlist right now." }, { status: 503 }); }
}
