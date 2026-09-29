"use server";

import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

const marksSchema = z.number().finite().min(0).max(100);

export async function updateStudentMarks(userId: string, marks: number): Promise<{ success: true } | { success: false; error: string }> {
  const user = await currentUser();
  if (!user || user.role !== "STUDENT" || user.id !== userId) {
    return { success: false, error: "You are not allowed to update these marks." };
  }

  const parsed = marksSchema.safeParse(marks);
  if (!parsed.success) return { success: false, error: "Marks must be a percentage between 0 and 100." };

  try {
    await prisma.user.update({ where: { id: user.id }, data: { marks: parsed.data } });
    return { success: true };
  } catch (error) {
    console.error("Student marks update failed", error);
    return { success: false, error: "Unable to save your marks. Please try again." };
  }
}

export async function getMatchedScholarships(userId: string) {
  const sessionUser = await currentUser();
  if (!sessionUser || sessionUser.role !== "STUDENT" || sessionUser.id !== userId) {
    throw new Error("You are not allowed to view these scholarships.");
  }

  const user = await prisma.user.findUnique({ where: { id: sessionUser.id }, select: { marks: true } });
  if (!user) throw new Error("Student account not found.");

  return prisma.scholarship.findMany({
    where: { minMarks: { lte: user.marks ?? 0 }, deadline: { gte: new Date() } },
    orderBy: { deadline: "asc" },
  });
}
