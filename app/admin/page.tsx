import Link from "next/link";
import { requireUser } from "@/lib/permissions";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requireUser(["PLATFORM_ADMIN"]);
  const [pending, colleges, branches, courses, students, visits, collegeViews, courseViews] = await Promise.all([
    prisma.college.findMany({ where: { verificationStatus: "PENDING" }, orderBy: { createdAt: "asc" }, include: { verifications: { orderBy: { createdAt: "desc" }, take: 1 }, users: { where: { role: "COLLEGE_HEAD" }, select: { name: true, email: true } } } }),
    prisma.college.count(), prisma.branch.count(), prisma.course.count(), prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.pageView.count(),
    prisma.pageView.groupBy({ by: ["collegeId"], where: { collegeId: { not: null } }, _count: { collegeId: true }, orderBy: { _count: { collegeId: "desc" } }, take: 5 }),
    prisma.pageView.groupBy({ by: ["courseId"], where: { courseId: { not: null } }, _count: { courseId: true }, orderBy: { _count: { courseId: "desc" } }, take: 5 }),
  ]);
  const [topColleges, topCourses] = await Promise.all([
    prisma.college.findMany({ where: { id: { in: collegeViews.flatMap((item) => item.collegeId ? [item.collegeId] : []) } }, select: { id: true, name: true, slug: true } }),
    prisma.course.findMany({
      where: { id: { in: courseViews.flatMap((item) => item.courseId ? [item.courseId] : []) } },
      select: {
        id: true, name: true, slug: true,
        offering: {
          select: {
            university: { select: { slug: true } },
            department: { select: { slug: true, branch: { select: { slug: true, college: { select: { slug: true } } } } } },
          },
        },
      },
    }),
  ]);
  const collegesById = new Map(topColleges.map((item) => [item.id, item]));
  const coursesById = new Map(topCourses.map((item) => [item.id, item]));
  return <main className="account-page"><header className="site-header"><Link className="brand" href="/"><span className="brand-mark">c</span><span>collytex</span></Link><div className="header-actions"><span className="login-link">Platform administration</span><form action="/api/auth/logout" method="post"><button className="login-link logout-button">Log out</button></form></div></header><div className="account-content"><div className="eyebrow">PLATFORM ADMINISTRATION</div><h1>Keep the directory trustworthy.</h1><div className="admin-stats"><div><strong>{colleges}</strong><span>colleges</span></div><div><strong>{branches}</strong><span>branches</span></div><div><strong>{courses}</strong><span>courses</span></div><div><strong>{students}</strong><span>students</span></div><div><strong>{visits}</strong><span>profile and directory visits</span></div></div><div className="account-section-heading"><h2>College verification</h2><span>{pending.length} pending</span></div>{pending.length ? <div className="directory-list">{pending.map((college) => <article className="directory-card" key={college.id}><div className="directory-card-top"><div><span className="verified-label">PENDING REVIEW</span><h2>{college.name}</h2><p className="branch-location">{college.users[0]?.name ?? "Account owner"} · {college.users[0]?.email ?? "No head account"}</p></div><div className="admin-actions"><form action={`/api/admin/colleges/${college.id}/verification`} method="post"><input type="hidden" name="status" value="VERIFIED" /><button className="button button-dark button-small">Verify</button></form><form action={`/api/admin/colleges/${college.id}/verification`} method="post"><input type="hidden" name="status" value="REJECTED" /><button className="button button-small button-light">Decline</button></form></div></div></article>)}</div> : <div className="empty-state"><span className="empty-mark">✓</span><div><strong>No college registrations need review.</strong><p>New requests will show up here.</p></div></div>}<div className="account-section-heading"><h2>Popular colleges</h2><Link className="text-link" href="/admin/audit">Audit log →</Link></div><div className="saved-list">{collegeViews.flatMap((item) => item.collegeId && collegesById.has(item.collegeId) ? [<Link href={`/colleges/${collegesById.get(item.collegeId)!.slug}`} key={item.collegeId}>{collegesById.get(item.collegeId)!.name}<span>{item._count.collegeId} profile visits</span></Link>] : [])}</div><div className="account-section-heading"><h2>Popular courses</h2></div><div className="saved-list">{courseViews.flatMap((item) => { const course = item.courseId ? coursesById.get(item.courseId) : undefined; return course ? [<Link href={`/colleges/${course.offering.department.branch.college.slug}/${course.offering.department.branch.slug}/${course.offering.department.slug}/${course.offering.university.slug}/${course.slug}`} key={course.id}>{course.name}<span>{item._count.courseId} profile visits</span></Link>] : []; })}</div></div></main>;
}
