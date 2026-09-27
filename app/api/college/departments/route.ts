import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { canManageBranch } from "@/lib/college-access";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slug";

const input = z.object({ branchId: z.string().min(1).max(64), name: z.string().trim().min(2).max(120) });

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check the department details and try again." }, { status: 400 });
  try {
    if (!(await canManageBranch(user, parsed.data.branchId))) return NextResponse.json({ error: "You do not have access to this campus." }, { status: 403 });
    const branch = await prisma.branch.findUnique({ where: { id: parsed.data.branchId }, select: { id: true, college: { select: { verificationStatus: true } } } });
    if (!branch || branch.college.verificationStatus !== "VERIFIED") return NextResponse.json({ error: "The college must be verified before editing its profile." }, { status: 403 });
    const department = await prisma.department.create({ data: { branchId: branch.id, name: parsed.data.name, slug: `${slugify(parsed.data.name)}-${crypto.randomUUID().slice(0, 5)}` } });
    return NextResponse.json({ ok: true, department: { id: department.id, name: department.name } }, { status: 201 });
  } catch { return NextResponse.json({ error: "Unable to add the department right now." }, { status: 503 }); }
}
