import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { canManageCourse } from "@/lib/college-access";
import { prisma } from "@/lib/db";

const input = z.object({ academicYear: z.string().regex(/^\d{4}-\d{2}$/), category: z.string().trim().min(1).max(80), score: z.number().finite().min(0).max(1_000_000), unit: z.string().trim().max(40).optional() });

export async function PUT(request: Request, context: { params: Promise<{ courseId: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check the cutoff details and try again." }, { status: 400 });
  const { courseId } = await context.params;
  try {
    if (!(await canManageCourse(user, courseId))) return NextResponse.json({ error: "You do not have access to this course." }, { status: 403 });
    const cutoff = await prisma.cutoffRecord.upsert({ where: { courseId_academicYear_category: { courseId, academicYear: parsed.data.academicYear, category: parsed.data.category } }, create: { courseId, ...parsed.data }, update: { score: parsed.data.score, unit: parsed.data.unit } });
    await prisma.auditLog.create({ data: { actorId: user.id, action: "COURSE_CUTOFF_UPDATED", entityType: "CutoffRecord", entityId: cutoff.id } });
    return NextResponse.json({ ok: true, id: cutoff.id });
  } catch { return NextResponse.json({ error: "Unable to save the cutoff information right now." }, { status: 503 }); }
}
