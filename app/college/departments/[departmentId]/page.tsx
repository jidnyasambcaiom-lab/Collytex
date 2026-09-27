import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/permissions";
import { canManageDepartment } from "@/lib/college-access";
import { prisma } from "@/lib/db";
import { ManagementForm } from "@/components/management-form";

export const dynamic = "force-dynamic";

export default async function DepartmentManagementPage({ params }: { params: Promise<{ departmentId: string }> }) {
  const user = await requireUser(["COLLEGE_HEAD", "COLLEGE_BRANCH"]);
  const { departmentId } = await params;
  if (!(await canManageDepartment(user, departmentId))) notFound();
  const department = await prisma.department.findUnique({
    where: { id: departmentId },
    include: { branch: true, offerings: { include: { university: true, courses: { orderBy: { name: "asc" } } } } },
  });
  if (!department) notFound();
  return <main className="account-page"><header className="site-header"><Link className="brand" href="/college"><span className="brand-mark">c</span><span>collytex</span></Link><nav className="main-nav"><Link href="/college">Dashboard</Link><Link href={`/college/branches/${department.branchId}`}>{department.branch.name}</Link></nav></header><div className="account-content"><div className="eyebrow">{department.branch.name} / DEPARTMENT</div><h1>{department.name}</h1><p>Connect this department to the universities and courses it actually offers.</p><div className="account-section-heading"><h2>Universities</h2><span>{department.offerings.length}</span></div><div className="directory-list">{department.offerings.map((offering) => <article className="directory-card" key={offering.id}><div className="directory-card-top"><div><span className="verified-label">UNIVERSITY</span><h2>{offering.university.name}</h2></div><span className="branch-location">{offering.courses.length} courses</span></div><div className="directory-meta">{offering.courses.map((course) => <Link className="course-chip" href={`/college/courses/${course.id}`} key={course.id}>{course.name} →</Link>)}</div><div className="management-card compact-card"><h3>Add a course</h3><ManagementForm endpoint="/api/college/courses" hidden={{ offeringId: offering.id }} submitText="Create course" fields={[{ name: "name", label: "Course name", maxLength: 140 }, { name: "level", label: "Level (optional)", required: false, maxLength: 80 }, { name: "durationYears", label: "Duration in years (optional)", type: "number", required: false, minLength: 1, maxLength: 2 }]} /></div></article>)}</div><section className="management-card"><h2>Add a university relationship</h2><p>Universities are only associated with this department after you add them here.</p><ManagementForm endpoint="/api/college/universities" hidden={{ departmentId }} submitText="Connect university" fields={[{ name: "name", label: "University name", maxLength: 160 }]} /></section></div></main>;
}
