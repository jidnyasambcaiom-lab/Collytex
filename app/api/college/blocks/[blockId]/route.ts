import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { canManageSection } from "@/lib/college-access";
import { isBlockType, validateBlockContent } from "@/lib/content-validation";
import { prisma } from "@/lib/db";

export async function PATCH(request: Request, context: { params: Promise<{ blockId: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  const parsed = z.object({ type: z.string(), content: z.unknown() }).safeParse(await request.json().catch(() => null));
  if (!parsed.success || !isBlockType(parsed.data.type)) return NextResponse.json({ error: "Choose a supported content type." }, { status: 400 });
  const content = validateBlockContent(parsed.data.type, parsed.data.content);
  if (!content.success) return NextResponse.json({ error: "Check this content and try again." }, { status: 400 });
  const { blockId } = await context.params;
  try {
    const block = await prisma.block.findUnique({ where: { id: blockId }, select: { sectionId: true, section: { select: { status: true } } } });
    if (!block || !(await canManageSection(user, block.sectionId))) return NextResponse.json({ error: "You do not have access to this content." }, { status: 403 });
    if (block.section.status === "PUBLISHED") return NextResponse.json({ error: "Unpublish the section before editing it." }, { status: 409 });
    await prisma.block.update({ where: { id: blockId }, data: { type: parsed.data.type, content: content.data } });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Unable to update this content right now." }, { status: 503 }); }
}

export async function DELETE(_request: Request, context: { params: Promise<{ blockId: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  const { blockId } = await context.params;
  try {
    const block = await prisma.block.findUnique({ where: { id: blockId }, select: { sectionId: true, section: { select: { status: true } } } });
    if (!block || !(await canManageSection(user, block.sectionId))) return NextResponse.json({ error: "You do not have access to this content." }, { status: 403 });
    if (block.section.status === "PUBLISHED") return NextResponse.json({ error: "Unpublish the section before editing it." }, { status: 409 });
    await prisma.block.delete({ where: { id: blockId } });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Unable to delete this content right now." }, { status: 503 }); }
}
