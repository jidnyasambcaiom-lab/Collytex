import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { canManageDepartment } from "@/lib/college-access";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slug";

const input = z.object({ departmentId: z.string().min(1).max(64), name: z.string().trim().min(2).max(160) });

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check the university details and try again." }, { status: 400 });
  try {
    if (!(await canManageDepartment(user, parsed.data.departmentId))) return NextResponse.json({ error: "You do not have access to this department." }, { status: 403 });
    const result = await prisma.$transaction(async (tx) => {
      const universitySlug = slugify(parsed.data.name);
      let university = await tx.university.findUnique({ where: { slug: universitySlug } });
      if (!university) university = await tx.university.create({ data: { name: parsed.data.name, slug: universitySlug } });
      const offering = await tx.departmentUniversity.upsert({ where: { departmentId_universityId: { departmentId: parsed.data.departmentId, universityId: university.id } }, create: { departmentId: parsed.data.departmentId, universityId: university.id }, update: {} });
      return { university, offering };
    });
    return NextResponse.json({ ok: true, universityId: result.university.id, offeringId: result.offering.id }, { status: 201 });
  } catch { return NextResponse.json({ error: "Unable to add the university right now." }, { status: 503 }); }
}
