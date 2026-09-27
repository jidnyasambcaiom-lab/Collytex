import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { canManageSection } from "@/lib/college-access";
import { isBlockType, validateBlockContent } from "@/lib/content-validation";
import { prisma } from "@/lib/db";

const input = z.object({ type: z.string(), content: z.unknown() });

export async function POST(request: Request, context: { params: Promise<{ sectionId: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !isBlockType(parsed.data.type)) return NextResponse.json({ error: "Choose a supported content type." }, { status: 400 });
  const content = validateBlockContent(parsed.data.type, parsed.data.content);
  if (!content.success) return NextResponse.json({ error: "Check this content and try again." }, { status: 400 });
  const { sectionId } = await context.params;
  try {
    if (!(await canManageSection(user, sectionId))) return NextResponse.json({ error: "You do not have access to this section." }, { status: 403 });
    const section = await prisma.section.findUnique({ where: { id: sectionId }, select: { id: true, status: true, courseId: true } });
    if (!section || section.status === "PUBLISHED") return NextResponse.json({ error: "Unpublish the section before editing it." }, { status: 409 });
    const position = await prisma.block.count({ where: { sectionId } });
    const block = await prisma.block.create({ data: { sectionId, type: parsed.data.type, position, content: content.data } });
    return NextResponse.json({ ok: true, blockId: block.id }, { status: 201 });
  } catch { return NextResponse.json({ error: "Unable to add this content right now." }, { status: 503 }); }
}

export async function PATCH(request: Request, context: { params: Promise<{ sectionId: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  const parsed = z.object({ blockIds: z.array(z.string().min(1).max(64)).min(1).max(100) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check the block order and try again." }, { status: 400 });
  const { sectionId } = await context.params;
  try {
    if (!(await canManageSection(user, sectionId))) return NextResponse.json({ error: "You do not have access to this section." }, { status: 403 });
    await prisma.$transaction(async (tx) => {
      const section = await tx.section.findUnique({ where: { id: sectionId }, select: { status: true } });
      if (!section || section.status === "PUBLISHED") throw new Error("SECTION_NOT_EDITABLE");
      const current = await tx.block.findMany({ where: { sectionId }, select: { id: true } });
      if (current.length !== parsed.data.blockIds.length || new Set(parsed.data.blockIds).size !== current.length || !current.every((block) => parsed.data.blockIds.includes(block.id))) throw new Error("INVALID_BLOCK_ORDER");
      await Promise.all(parsed.data.blockIds.map((id, position) => tx.block.update({ where: { id }, data: { position } })));
    });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Unable to reorder these blocks." }, { status: 400 }); }
}
