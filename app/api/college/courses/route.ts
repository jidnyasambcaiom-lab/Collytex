import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { canManageOffering } from "@/lib/college-access";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slug";

const input = z.object({ offeringId: z.string().min(1).max(64), name: z.string().trim().min(2).max(140), level: z.string().trim().max(80).optional(), durationYears: z.number().int().min(1).max(12).optional() });
const defaults = ["Admission", "Fees", "Scholarship", "Syllabus", "Placement"];

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check the course details and try again." }, { status: 400 });
  try {
    if (!(await canManageOffering(user, parsed.data.offeringId))) return NextResponse.json({ error: "You do not have access to this department and university." }, { status: 403 });
    const course = await prisma.$transaction(async (tx) => tx.course.create({ data: {
      offeringId: parsed.data.offeringId, name: parsed.data.name, slug: `${slugify(parsed.data.name)}-${crypto.randomUUID().slice(0, 5)}`,
      level: parsed.data.level, durationYears: parsed.data.durationYears,
      sections: { create: defaults.map((title, position) => ({ title, slug: slugify(title), isDefault: true, position, status: "DRAFT" })) },
    }, select: { id: true, name: true, sections: { select: { title: true, isDefault: true }, orderBy: { position: "asc" } } } }));
    await prisma.auditLog.create({ data: { actorId: user.id, action: "COURSE_CREATED", entityType: "Course", entityId: course.id } });
    return NextResponse.json({ ok: true, course }, { status: 201 });
  } catch { return NextResponse.json({ error: "Unable to create the course right now." }, { status: 503 }); }
}
