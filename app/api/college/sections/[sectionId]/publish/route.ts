import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { canManageSection } from "@/lib/college-access";
import { prisma } from "@/lib/db";

export async function POST(request: Request, context: { params: Promise<{ sectionId: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  const parsed = z.object({ publish: z.boolean() }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Choose whether to publish or unpublish." }, { status: 400 });
  const { sectionId } = await context.params;
  try {
    if (!(await canManageSection(user, sectionId))) return NextResponse.json({ error: "You do not have access to this section." }, { status: 403 });
    if (parsed.data.publish) {
      const count = await prisma.block.count({ where: { sectionId } });
      if (!count) return NextResponse.json({ error: "Add at least one content block before publishing." }, { status: 400 });
    }
    const status = parsed.data.publish ? "PUBLISHED" : "DRAFT";
    const section = await prisma.section.update({ where: { id: sectionId }, data: { status, publishedAt: parsed.data.publish ? new Date() : null }, select: { id: true, courseId: true, title: true, slug: true, status: true } });
    await prisma.auditLog.create({ data: { actorId: user.id, action: parsed.data.publish ? "SECTION_PUBLISHED" : "SECTION_UNPUBLISHED", entityType: "Section", entityId: section.id } });
    return NextResponse.json({ ok: true, section });
  } catch { return NextResponse.json({ error: "Unable to update this section right now." }, { status: 503 }); }
}

export async function DELETE(_request: Request, context: { params: Promise<{ sectionId: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  const { sectionId } = await context.params;
  try {
    if (!(await canManageSection(user, sectionId))) return NextResponse.json({ error: "You do not have access to this section." }, { status: 403 });
    const section = await prisma.section.findUnique({ where: { id: sectionId }, select: { isDefault: true } });
    if (!section) return NextResponse.json({ error: "Section not found." }, { status: 404 });
    if (section.isDefault) return NextResponse.json({ error: "Default course sections cannot be deleted." }, { status: 403 });
    await prisma.section.delete({ where: { id: sectionId } });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Unable to delete this section right now." }, { status: 503 }); }
}
