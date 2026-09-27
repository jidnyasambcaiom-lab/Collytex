import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { canManageCourse } from "@/lib/college-access";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slug";

const input = z.object({ title: z.string().trim().min(1).max(120) });

export async function POST(request: Request, context: { params: Promise<{ courseId: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a section title." }, { status: 400 });
  const { courseId } = await context.params;
  try {
    if (!(await canManageCourse(user, courseId))) return NextResponse.json({ error: "You do not have access to this course." }, { status: 403 });
    const position = await prisma.section.count({ where: { courseId } });
    const section = await prisma.section.create({ data: { courseId, title: parsed.data.title, slug: `${slugify(parsed.data.title)}-${crypto.randomUUID().slice(0, 5)}`, position, isDefault: false } });
    return NextResponse.json({ ok: true, section: { id: section.id, title: section.title } }, { status: 201 });
  } catch { return NextResponse.json({ error: "Unable to add this section right now." }, { status: 503 }); }
}
