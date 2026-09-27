import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { canManageCourse } from "@/lib/college-access";
import { prisma } from "@/lib/db";

const year = z.string().regex(/^\d{4}-\d{2}$/);
const input = z.object({ academicYear: year, amountRupees: z.number().finite().positive().max(1_000_000_000), notes: z.string().trim().max(2000).optional() });

export async function PUT(request: Request, context: { params: Promise<{ courseId: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check the fee details and try again." }, { status: 400 });
  const { courseId } = await context.params;
  try {
    if (!(await canManageCourse(user, courseId))) return NextResponse.json({ error: "You do not have access to this course." }, { status: 403 });
    const amountPaise = BigInt(Math.round(parsed.data.amountRupees * 100));
    const fee = await prisma.feeRecord.upsert({ where: { courseId_academicYear: { courseId, academicYear: parsed.data.academicYear } }, create: { courseId, academicYear: parsed.data.academicYear, amountPaise, notes: parsed.data.notes }, update: { amountPaise, notes: parsed.data.notes } });
    await prisma.auditLog.create({ data: { actorId: user.id, action: "COURSE_FEE_UPDATED", entityType: "FeeRecord", entityId: fee.id } });
    return NextResponse.json({ ok: true, id: fee.id });
  } catch { return NextResponse.json({ error: "Unable to save the fee information right now." }, { status: 503 }); }
}
