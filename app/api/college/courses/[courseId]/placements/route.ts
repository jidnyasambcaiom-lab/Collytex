import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { canManageCourse } from "@/lib/college-access";
import { prisma } from "@/lib/db";

const input = z.object({ academicYear: z.string().regex(/^\d{4}-\d{2}$/), averagePackageRupees: z.number().finite().positive().max(1_000_000_000).optional(), highestPackageRupees: z.number().finite().positive().max(1_000_000_000).optional(), placementPercentage: z.number().finite().min(0).max(100).optional(), studentsPlaced: z.number().int().nonnegative().max(1_000_000).optional(), companies: z.array(z.string().trim().min(1).max(100)).max(100).optional() });

export async function PUT(request: Request, context: { params: Promise<{ courseId: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check the placement details and try again." }, { status: 400 });
  const { courseId } = await context.params;
  try {
    if (!(await canManageCourse(user, courseId))) return NextResponse.json({ error: "You do not have access to this course." }, { status: 403 });
    const { academicYear, averagePackageRupees, highestPackageRupees, companies, ...rest } = parsed.data;
    const values = { averagePackagePaise: averagePackageRupees === undefined ? null : BigInt(Math.round(averagePackageRupees * 100)), highestPackagePaise: highestPackageRupees === undefined ? null : BigInt(Math.round(highestPackageRupees * 100)), ...rest, companies: companies ?? undefined };
    const placement = await prisma.placementRecord.upsert({ where: { courseId_academicYear: { courseId, academicYear } }, create: { courseId, academicYear, ...values }, update: values });
    await prisma.auditLog.create({ data: { actorId: user.id, action: "COURSE_PLACEMENT_UPDATED", entityType: "PlacementRecord", entityId: placement.id } });
    return NextResponse.json({ ok: true, id: placement.id });
  } catch { return NextResponse.json({ error: "Unable to save the placement information right now." }, { status: 503 }); }
}
