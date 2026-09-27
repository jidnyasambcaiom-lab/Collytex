import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/db";

const input = z.object({ name: z.string().trim().min(2).max(100), email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()), password: z.string().min(12).max(128) });

export async function POST(request: Request, context: { params: Promise<{ branchId: string }> }) {
  const user = await currentUser();
  if (!user || user.role !== "COLLEGE_HEAD" || !user.collegeId) return NextResponse.json({ error: "Only your college head can create branch accounts." }, { status: 403 });
  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check the account details and use a password with at least 12 characters." }, { status: 400 });
  const { branchId } = await context.params;
  try {
    const branch = await prisma.branch.findFirst({ where: { id: branchId, collegeId: user.collegeId }, select: { id: true } });
    if (!branch) return NextResponse.json({ error: "Branch not found in your organization." }, { status: 404 });
    const passwordHash = await hashPassword(parsed.data.password);
    const created = await prisma.$transaction(async (tx) => {
      const account = await tx.user.create({ data: { name: parsed.data.name, email: parsed.data.email, passwordHash, role: "COLLEGE_BRANCH", collegeId: user.collegeId!, branchId }, select: { id: true, name: true, email: true } });
      await tx.auditLog.create({ data: { actorId: user.id, action: "BRANCH_ACCOUNT_CREATED", entityType: "User", entityId: account.id, metadata: { branchId } } });
      return account;
    });
    return NextResponse.json({ ok: true, account: created }, { status: 201 });
  } catch { return NextResponse.json({ error: "Unable to create this account. The email may already be in use." }, { status: 409 }); }
}
