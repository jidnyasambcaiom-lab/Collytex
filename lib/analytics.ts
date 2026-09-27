import { prisma } from "@/lib/db";

export async function recordPublicView({ path, collegeId, courseId, userId, title, entityType }: { path: string; collegeId?: string; courseId?: string; userId?: string; title?: string; entityType?: string }) {
  try {
    await prisma.pageView.create({ data: { path, collegeId, courseId } });
    if (userId && title && entityType) await prisma.recentView.upsert({ where: { userId_path: { userId, path } }, create: { userId, path, title, entityType }, update: { title, entityType, viewedAt: new Date() } });
  } catch { /* Visits are best-effort and never interrupt public pages. */ }
}
