import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

const input = z.object({ status: z.enum(["VERIFIED", "REJECTED", "SUSPENDED"]), note: z.string().trim().max(1000).optional() });

export async function POST(request: Request, context: { params: Promise<{ collegeId: string }> }) {
  const actor = await currentUser();
  if (!actor || actor.role !== "PLATFORM_ADMIN") return NextResponse.json({ error: "You are not allowed to perform this action." }, { status: 403 });
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "Request could not be verified." }, { status: 403 });
  let raw: unknown;
  if ((request.headers.get("content-type") ?? "").includes("application/json")) raw = await request.json().catch(() => null);
  else { const form = await request.formData().catch(() => null); raw = form ? { status: form.get("status"), note: form.get("note") || undefined } : null; }
  const parsed = input.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Choose a valid verification status." }, { status: 400 });
  const { collegeId } = await context.params;
  try {
    await prisma.$transaction(async (tx) => {
      await tx.college.update({ where: { id: collegeId }, data: { verificationStatus: parsed.data.status, verifiedAt: parsed.data.status === "VERIFIED" ? new Date() : null } });
      await tx.verification.create({ data: { collegeId, status: parsed.data.status, note: parsed.data.note, reviewedBy: actor.id, reviewedAt: new Date() } });
      await tx.auditLog.create({ data: { actorId: actor.id, action: `COLLEGE_${parsed.data.status}`, entityType: "College", entityId: collegeId, metadata: { note: parsed.data.note } } });
    });
    if (request.headers.get("accept")?.includes("text/html")) return NextResponse.redirect(new URL("/admin", request.url), 303);
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Unable to update verification. Please try again." }, { status: 404 }); }
}
