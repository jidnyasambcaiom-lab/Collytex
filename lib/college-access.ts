import { prisma } from "@/lib/db";

export type OrganizationUser = { id: string; role: string; collegeId: string | null; branchId: string | null };

export async function canManageBranch(user: OrganizationUser, branchId: string) {
  if (user.role === "COLLEGE_BRANCH") return user.branchId === branchId;
  if (user.role !== "COLLEGE_HEAD" || !user.collegeId) return false;
  const branch = await prisma.branch.findFirst({ where: { id: branchId, collegeId: user.collegeId }, select: { id: true } });
  return !!branch;
}

export async function canManageDepartment(user: OrganizationUser, departmentId: string) {
  if (user.role !== "COLLEGE_BRANCH" && user.role !== "COLLEGE_HEAD") return false;
  const department = await prisma.department.findFirst({ where: { id: departmentId }, select: { branchId: true } });
  return !!department && canManageBranch(user, department.branchId);
}

export async function canManageOffering(user: OrganizationUser, offeringId: string) {
  if (user.role !== "COLLEGE_BRANCH" && user.role !== "COLLEGE_HEAD") return false;
  const offering = await prisma.departmentUniversity.findFirst({ where: { id: offeringId }, select: { department: { select: { branchId: true } } } });
  return !!offering && canManageBranch(user, offering.department.branchId);
}

export async function canManageCourse(user: OrganizationUser, courseId: string) {
  if (user.role !== "COLLEGE_BRANCH" && user.role !== "COLLEGE_HEAD") return false;
  const course = await prisma.course.findFirst({ where: { id: courseId }, select: { offering: { select: { department: { select: { branchId: true } } } } } });
  return !!course && canManageBranch(user, course.offering.department.branchId);
}

export async function canManageSection(user: OrganizationUser, sectionId: string) {
  if (user.role !== "COLLEGE_BRANCH" && user.role !== "COLLEGE_HEAD") return false;
  const section = await prisma.section.findFirst({ where: { id: sectionId }, select: { course: { select: { offering: { select: { department: { select: { branchId: true } } } } } } } });
  return !!section && canManageBranch(user, section.course.offering.department.branchId);
}
