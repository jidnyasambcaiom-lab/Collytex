import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/permissions";
import { canManageCourse } from "@/lib/college-access";
import { prisma } from "@/lib/db";
import { CourseEditor } from "@/components/course-editor";
import { ManagementForm } from "@/components/management-form";

export const dynamic = "force-dynamic";

export default async function CourseManagementPage({ params }: { params: Promise<{ courseId: string }> }) {
  const user = await requireUser(["COLLEGE_HEAD", "COLLEGE_BRANCH"]);
  const { courseId } = await params;
  if (!(await canManageCourse(user, courseId))) notFound();
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      offering: { include: { university: true, department: { include: { branch: { include: { college: true } } } } } },
      sections: { orderBy: { position: "asc" }, include: { blocks: { orderBy: { position: "asc" } } } },
    },
  });
  if (!course) notFound();
  const hierarchy = course.offering.department;
  return <main className="account-page"><header className="site-header"><Link className="brand" href="/college"><span className="brand-mark">c</span><span>collytex</span></Link><nav className="main-nav"><Link href="/college">Dashboard</Link><Link href={`/college/branches/${hierarchy.branchId}`}>{hierarchy.branch.name}</Link><Link href={`/college/departments/${hierarchy.id}`}>{hierarchy.name}</Link></nav></header><div className="account-content"><div className="eyebrow">{hierarchy.branch.college.name} / {hierarchy.branch.name} / {course.offering.university.name}</div><h1>{course.name}</h1><p>Drafts are private. Publish a section when its content is ready.</p><div className="course-editor-note"><b>Default sections</b><span>Admission · Fees · Scholarship · Syllabus · Placement</span><small>Default section names cannot be changed or removed.</small></div><CourseEditor courseId={course.id} initialSections={course.sections} /><section className="structured-editor"><div className="eyebrow">STRUCTURED COURSE DATA</div><h2>Keep figures by academic year.</h2><p>Only saved values appear on the public course page and graphs.</p><div className="structured-form-grid"><div className="management-card"><h3>Fees</h3><ManagementForm endpoint={`/api/college/courses/${course.id}/fees`} method="PUT" submitText="Save fee" fields={[{ name: "academicYear", label: "Academic year (e.g. 2026-27)", maxLength: 7 }, { name: "amountRupees", label: "Total fees (₹)", type: "number", step: "0.01" }, { name: "notes", label: "Notes (optional)", required: false, maxLength: 2000 }]} /></div><div className="management-card"><h3>Cutoff</h3><ManagementForm endpoint={`/api/college/courses/${course.id}/cutoffs`} method="PUT" submitText="Save cutoff" fields={[{ name: "academicYear", label: "Academic year (e.g. 2026-27)", maxLength: 7 }, { name: "category", label: "Category", maxLength: 80 }, { name: "score", label: "Score", type: "number", step: "0.01" }, { name: "unit", label: "Score unit (optional)", required: false, maxLength: 40 }]} /></div><div className="management-card"><h3>Placement</h3><ManagementForm endpoint={`/api/college/courses/${course.id}/placements`} method="PUT" submitText="Save placement" fields={[{ name: "academicYear", label: "Academic year (e.g. 2026-27)", maxLength: 7 }, { name: "averagePackageRupees", label: "Average package (₹)", type: "number", required: false, step: "0.01" }, { name: "highestPackageRupees", label: "Highest package (₹)", type: "number", required: false, step: "0.01" }, { name: "placementPercentage", label: "Placed (%)", type: "number", required: false, step: "0.1" }, { name: "studentsPlaced", label: "Students placed", type: "number", required: false }]} /></div></div></section></div></main>;
}
