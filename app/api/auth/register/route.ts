import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { startSession } from "@/lib/auth";

const registration = z.object({
  name: z.string().trim().min(2).max(100),
  username: z.string().trim().min(3).max(32).regex(/^[a-zA-Z0-9._-]+$/).transform((value) => value.toLowerCase()),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(12).max(128),
  accountType: z.enum(["STUDENT", "COLLEGE_HEAD"]),
  collegeName: z.string().trim().min(2).max(160).optional(),
}).refine((data) => data.accountType !== "COLLEGE_HEAD" || !!data.collegeName, { path: ["collegeName"], message: "College name is required" });

function slugify(value: string) { return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "college"; }

export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > 12_000) return NextResponse.json({ error: "Registration request is too large." }, { status: 413 });
  const parsed = registration.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check the details and try again." }, { status: 400 });
  const { name, username, email, password, accountType, collegeName } = parsed.data;
  try {
    const passwordHash = await hashPassword(password);
    const user = await prisma.$transaction(async (tx) => {
      const existing = await tx.user.findFirst({ where: { OR: [{ email }, { username }] }, select: { id: true } });
      if (existing) return null;
      if (accountType === "STUDENT") return tx.user.create({ data: { name, username, email, passwordHash, role: "STUDENT" }, select: { id: true } });
      const normalizedName = collegeName!;
      const baseSlug = slugify(normalizedName);
      const collegeSlug = `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`;
      const college = await tx.college.create({ data: { name: normalizedName, slug: collegeSlug, verificationStatus: "PENDING", verifications: { create: { status: "PENDING" } } }, select: { id: true } });
      const head = await tx.user.create({ data: { name, username, email, passwordHash, role: "COLLEGE_HEAD", collegeId: college.id }, select: { id: true } });
      await tx.auditLog.create({ data: { actorId: head.id, action: "COLLEGE_REGISTERED", entityType: "College", entityId: college.id } });
      return head;
    });
    if (!user) return NextResponse.json({ error: "That email or username is already in use." }, { status: 409 });
    await startSession(user.id);
    return NextResponse.json({ ok: true, redirectTo: accountType === "STUDENT" ? "/student" : "/college" }, { status: 201 });
  } catch { return NextResponse.json({ error: "Unable to create your account right now. Please try again." }, { status: 503 }); }
}
