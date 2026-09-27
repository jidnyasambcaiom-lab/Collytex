import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(request: Request, context: { params: Promise<{ branchId: string }> }) {
  const user = await currentUser();
  if (!user || user.role !== "COLLEGE_HEAD" || !user.collegeId) return NextResponse.json({ error: "Only your college head can approve branches." }, { status: 403 });
  const parsed = z.object({ approved: z.boolean() }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Choose a valid branch status." }, { status: 400 });
  const { branchId } = await context.params;
  try {
    const branch = await prisma.branch.findFirst({ where: { id: branchId, collegeId: user.collegeId }, select: { id: true } });
    if (!branch) return NextResponse.json({ error: "Branch not found in your organization." }, { status: 404 });
    await prisma.$transaction(async (tx) => {
      await tx.branch.update({ where: { id: branchId }, data: { isApproved: parsed.data.approved } });
      await tx.auditLog.create({ data: { actorId: user.id, action: parsed.data.approved ? "BRANCH_APPROVED" : "BRANCH_UNAPPROVED", entityType: "Branch", entityId: branchId } });
    });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Unable to update branch status right now." }, { status: 503 }); }
}
