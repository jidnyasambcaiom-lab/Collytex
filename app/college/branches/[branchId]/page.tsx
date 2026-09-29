import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/permissions";
import { canManageBranch } from "@/lib/college-access";
import { prisma } from "@/lib/db";
import { ManagementForm, BranchApproval } from "@/components/management-form";

export const dynamic = "force-dynamic";

export default async function BranchManagementPage({ params }: { params: Promise<{ branchId: string }> }) {
  const user = await requireUser(["COLLEGE_HEAD", "COLLEGE_BRANCH"]);
  const { branchId } = await params;
  if (!(await canManageBranch(user, branchId))) notFound();
  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    include: {
      college: true,
      departments: {
        orderBy: { name: "asc" },
        include: { offerings: { include: { university: true, courses: { orderBy: { name: "asc" } } } } },
      },
    },
  });
  if (!branch) notFound();
  return <main className="account-page"><header className="site-header"><Link className="brand" href="/college"><span className="brand-mark">c</span><span>collytex</span></Link><nav className="main-nav"><Link href="/college">Dashboard</Link><Link href="/college/branches">Branches</Link></nav></header><div className="account-content"><div className="eyebrow">{branch.college.name}</div><h1>{branch.name}</h1><p>{branch.city}, {branch.state}</p><div className="branch-status-line"><span className="status-dot" />{branch.isApproved ? "Approved for public listing" : "Private until approved by the college head"}{user.role === "COLLEGE_HEAD" && <BranchApproval branchId={branch.id} approved={branch.isApproved} />}</div>{user.role === "COLLEGE_HEAD" && <section className="management-card"><h2>Create a branch account</h2><p>Branch accounts can only manage this campus.</p><ManagementForm endpoint={`/api/college/branches/${branch.id}/accounts`} hidden={{}} submitText="Create branch account" fields={[{ name: "name", label: "Staff name", maxLength: 100 }, { name: "username", label: "Username", minLength: 3, maxLength: 32 }, { name: "email", label: "Staff email", type: "email", maxLength: 254 }, { name: "password", label: "Temporary password", type: "password", minLength: 12, maxLength: 128 }]} /></section>}<div className="account-section-heading"><h2>Departments</h2><span>{branch.departments.length}</span></div><div className="directory-list">{branch.departments.map((department) => <article className="directory-card" key={department.id}><div className="directory-card-top"><div><span className="verified-label">DEPARTMENT</span><h2>{department.name}</h2><p className="branch-location">{department.offerings.length} universities</p></div><Link className="text-link" href={`/college/departments/${department.id}`}>Manage ↗</Link></div><div className="directory-meta">{department.offerings.flatMap((offering) => offering.courses).map((course) => <Link className="course-chip" href={`/college/courses/${course.id}`} key={course.id}>{course.name} →</Link>)}</div></article>)}</div><section className="management-card"><h2>Add a department</h2><ManagementForm endpoint="/api/college/departments" hidden={{ branchId: branch.id }} submitText="Add department" fields={[{ name: "name", label: "Department name", maxLength: 120 }]} /></section></div></main>;
}
