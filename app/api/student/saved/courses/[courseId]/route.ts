import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(_request: Request, context: { params: Promise<{ courseId: string }> }) {
  const user = await currentUser();
  if (!user || user.role !== "STUDENT") return NextResponse.json({ error: "Sign in with a student account to save courses." }, { status: 403 });
  const { courseId } = await context.params;
  try {
    const course = await prisma.course.findFirst({ where: { id: courseId, offering: { department: { branch: { isApproved: true, college: { verificationStatus: "VERIFIED" } } } } }, select: { id: true } });
    if (!course) return NextResponse.json({ error: "Course not found." }, { status: 404 });
    await prisma.studentSavedCourse.upsert({ where: { userId_courseId: { userId: user.id, courseId } }, create: { userId: user.id, courseId }, update: {} });
    return NextResponse.json({ ok: true, saved: true });
  } catch { return NextResponse.json({ error: "Unable to save this course right now." }, { status: 503 }); }
}

export async function DELETE(_request: Request, context: { params: Promise<{ courseId: string }> }) {
  const user = await currentUser();
  if (!user || user.role !== "STUDENT") return NextResponse.json({ error: "Sign in with a student account to update your shortlist." }, { status: 403 });
  const { courseId } = await context.params;
  try {
    await prisma.studentSavedCourse.deleteMany({ where: { userId: user.id, courseId } });
    return NextResponse.json({ ok: true, saved: false });
  } catch { return NextResponse.json({ error: "Unable to update your shortlist right now." }, { status: 503 }); }
}
