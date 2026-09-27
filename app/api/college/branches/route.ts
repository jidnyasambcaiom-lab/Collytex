import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slug";

const input = z.object({ name: z.string().trim().min(2).max(120), city: z.string().trim().min(2).max(100), state: z.string().trim().min(2).max(100), address: z.string().trim().max(500).optional() });

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user || user.role !== "COLLEGE_HEAD" || !user.collegeId) return NextResponse.json({ error: "Only your verified college head account can add campuses." }, { status: 403 });
  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check the campus details and try again." }, { status: 400 });
  try {
    const college = await prisma.college.findFirst({ where: { id: user.collegeId, verificationStatus: "VERIFIED" }, select: { id: true } });
    if (!college) return NextResponse.json({ error: "Your college must be verified before adding campuses." }, { status: 403 });
    const base = slugify(parsed.data.name);
    const branch = await prisma.$transaction(async (tx) => {
      const created = await tx.branch.create({ data: { ...parsed.data, collegeId: college.id, slug: `${base}-${crypto.randomUUID().slice(0, 6)}`, isApproved: false } });
      await tx.auditLog.create({ data: { actorId: user.id, action: "BRANCH_CREATED", entityType: "Branch", entityId: created.id, metadata: { collegeId: college.id } } });
      return created;
    });
    return NextResponse.json({ ok: true, branch: { id: branch.id, name: branch.name } }, { status: 201 });
  } catch { return NextResponse.json({ error: "Unable to add the campus right now." }, { status: 503 }); }
}
